import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { sendEmailOnce } from '@/lib/email/send';
import { dayKey } from '@/lib/email/keys';
import { getProviderIdentity } from '@/lib/contract/provider';
import { buildContract, contractToHtml, contractToText, type ContractInput } from '@/lib/contract/template';

const text = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contrat de mission d'un client (administrateur uniquement).
 * - action « preview » : génère le contrat à partir du dossier et des champs saisis, sans rien envoyer ;
 * - action « send » : envoie le contrat par e-mail à un contact du client, UNIQUEMENT si l'administrateur
 *   a explicitement confirmé (confirm: true) et que le contrat est complet. Un envoi par jour et par montant au plus.
 * Rien n'est envoyé automatiquement ailleurs (le CRM ne déclenche jamais d'envoi).
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const org = await prisma.organization.findFirst({ where: { id }, select: { id: true, name: true, missionScope: true } });
    if (!org) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return jsonError('Corps invalide', 400);
    const action = body.action;
    if (action !== 'preview' && action !== 'send') return jsonError('Action invalide', 400);

    let priceHT: number | null = null;
    if (body.priceHT != null && body.priceHT !== '') {
      priceHT = Number(body.priceHT);
      if (!Number.isFinite(priceHT) || priceHT < 0 || priceHT > 1_000_000) return jsonError('Prix invalide', 400);
    }
    let durationDays: number | null = null;
    if (body.durationDays != null && body.durationDays !== '') {
      durationDays = Number(body.durationDays);
      if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) return jsonError('Durée invalide', 400);
    }
    const startDate = text(body.startDate, 10);
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return jsonError('Date de démarrage invalide', 400);

    const input: ContractInput = {
      clientName: org.name,
      clientSignatoryName: text(body.clientSignatoryName, 120),
      clientSignatoryRole: text(body.clientSignatoryRole, 120),
      clientSiret: text(body.clientSiret, 20),
      clientAddress: text(body.clientAddress, 300),
      priceHT,
      durationDays,
      startDate,
      scope: text(body.scope, 4000) ?? org.missionScope?.trim() ?? null,
      provider: getProviderIdentity(),
    };
    const doc = buildContract(input);

    if (action === 'preview') return NextResponse.json({ doc });

    if (body.confirm !== true) return jsonError('Confirmation explicite requise pour envoyer le contrat', 400);
    if (doc.missing.length > 0) {
      return NextResponse.json({ error: 'Contrat incomplet : complétez les champs manquants avant envoi.', missing: doc.missing }, { status: 409 });
    }

    type ContactRow = { id: string; name: string; email: string | null; isPrimary: boolean };
    const contacts: ContactRow[] = await prisma.contact.findMany({
      where: { organizationId: id },
      select: { id: true, name: true, email: true, isPrimary: true },
    });
    const wanted = typeof body.contactId === 'string' ? body.contactId : null;
    const contact = wanted
      ? contacts.find((c) => c.id === wanted)
      : contacts.find((c) => c.isPrimary && c.email) ?? contacts.find((c) => c.email);
    if (!contact || !contact.email || !EMAIL.test(contact.email)) {
      return jsonError('Aucun contact avec une adresse e-mail valide pour ce client', 409);
    }

    const subject = `Contrat de mission — ${org.name}`;
    const intro = `Bonjour ${contact.name},\n\nVeuillez trouver ci-dessous le contrat de mission (réf. ${doc.reference}) et son annexe de protection des données. Merci de nous le retourner signé, ainsi que la lettre d'autorisation de contrôles externes si elle est prévue.\n\nCordialement,\n${input.provider.representative ?? 'InfraCyb'}\n\n`;
    const result = await sendEmailOnce({
      key: `contract:${id}:${dayKey(new Date())}:${priceHT ?? 'na'}`,
      kind: 'contract',
      organizationId: id,
      to: contact.email,
      subject,
      text: intro + contractToText(doc),
      html: `<p>${intro.replace(/\n/g, '<br>')}</p>${contractToHtml(doc)}`,
    });

    if (result.status === 'skipped') return jsonError('Ce contrat a déjà été envoyé aujourd’hui pour ce montant', 409);
    if (result.status === 'failed') return jsonError('Échec de l’envoi, réessayez', 502);

    await prisma.decisionLogEntry.create({
      data: {
        organizationId: id,
        title: 'Contrat envoyé',
        description: `Contrat ${doc.reference} (${priceHT !== null ? `${priceHT} € HT` : 'prix non fixé'}) envoyé à ${contact.name}${result.simulated ? ' — SIMULATION : aucun e-mail réel parti' : ''}.`,
        decidedAt: new Date(),
      },
    });
    await logActivity(user, {
      action: 'organization.contract.send',
      targetType: 'organization',
      targetId: id,
      organizationId: id,
      metadata: { reference: doc.reference, simulated: result.simulated },
    });
    return NextResponse.json({ sent: true, simulated: result.simulated, reference: doc.reference });
  },
  { roles: ['admin'] }
);

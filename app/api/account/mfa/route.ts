import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { generateTotpSecret, otpauthUri, verifyTotp } from '@/lib/auth/totp';
import { isEncryptionConfigured, open, seal } from '@/lib/auth/secret-box';
import { generateRecoveryCodes, RECOVERY_CODE_COUNT } from '@/lib/auth/recovery-codes';

/**
 * Double authentification du compte connecté (tous rôles).
 *  GET  → état (activée, codes de secours restants).
 *  POST { action: 'setup' }                 → nouveau secret en attente (renvoyé UNE fois pour l'appli).
 *  POST { action: 'enable', code }          → active la MFA si le code est bon, renvoie les codes de secours UNE fois.
 *  POST { action: 'regenerate-codes', code } → nouveaux codes de secours (les anciens deviennent invalides).
 *  POST { action: 'disable', password, code } → désactive (mot de passe + code exigés).
 * Ne s'applique qu'à l'utilisateur de la session : aucun identifiant n'est lu dans la requête.
 */

function remainingCodes(json: string | null): number {
  try {
    const parsed = json ? JSON.parse(json) : [];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export const GET = withApiAuth(async (_request, { user }) => {
  const account = await prisma.user.findUnique({ where: { id: user.id } });
  if (!account) return jsonError('Compte introuvable', 404);
  return NextResponse.json({
    enabled: account.mfaEnabled,
    recoveryCodesRemaining: account.mfaEnabled ? remainingCodes(account.mfaRecoveryCodes) : 0,
    encryptionConfigured: isEncryptionConfigured(),
  });
});

export const POST = withApiAuth(async (request, { user }) => {
  const body = await request.json().catch(() => null);
  const action = typeof body?.action === 'string' ? body.action : '';
  const code = typeof body?.code === 'string' ? body.code : '';

  const account = await prisma.user.findUnique({ where: { id: user.id } });
  if (!account) return jsonError('Compte introuvable', 404);

  if (!isEncryptionConfigured()) {
    return jsonError('Double authentification indisponible : clé de chiffrement non configurée sur le serveur', 503);
  }

  if (action === 'setup') {
    if (account.mfaEnabled) return jsonError('La double authentification est déjà activée', 409);
    const secret = generateTotpSecret();
    await prisma.user.update({ where: { id: user.id }, data: { mfaPendingSecret: seal(secret) } });
    return NextResponse.json({ secret, otpauthUri: otpauthUri(secret, account.email) });
  }

  if (action === 'enable') {
    if (account.mfaEnabled) return jsonError('La double authentification est déjà activée', 409);
    if (!account.mfaPendingSecret) return jsonError('Commencez par générer un secret', 400);
    const secret = open(account.mfaPendingSecret);
    const step = verifyTotp(secret, code);
    if (step === null) return jsonError('Code de vérification invalide', 400);
    const { codes, hashes } = generateRecoveryCodes();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        mfaSecret: account.mfaPendingSecret,
        mfaPendingSecret: null,
        mfaLastStep: step,
        mfaRecoveryCodes: JSON.stringify(hashes),
      },
    });
    await logActivity(user, { action: 'user.mfa.enable', targetType: 'user', targetId: user.id, organizationId: user.organizationId ?? null });
    return NextResponse.json({ enabled: true, recoveryCodes: codes });
  }

  if (action === 'regenerate-codes') {
    if (!account.mfaEnabled || !account.mfaSecret) return jsonError('La double authentification n\'est pas activée', 400);
    const step = verifyTotp(open(account.mfaSecret), code, { lastUsedStep: account.mfaLastStep });
    if (step === null) return jsonError('Code de vérification invalide', 400);
    const { codes, hashes } = generateRecoveryCodes();
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaRecoveryCodes: JSON.stringify(hashes), mfaLastStep: step },
    });
    await logActivity(user, { action: 'user.mfa.recovery-codes', targetType: 'user', targetId: user.id, organizationId: user.organizationId ?? null });
    return NextResponse.json({ recoveryCodes: codes, count: RECOVERY_CODE_COUNT });
  }

  if (action === 'disable') {
    if (!account.mfaEnabled || !account.mfaSecret) return jsonError('La double authentification n\'est pas activée', 400);
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!(await bcrypt.compare(password, account.password))) return jsonError('Mot de passe incorrect', 400);
    const step = verifyTotp(open(account.mfaSecret), code, { lastUsedStep: account.mfaLastStep });
    if (step === null) return jsonError('Code de vérification invalide', 400);
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: false, mfaSecret: null, mfaPendingSecret: null, mfaRecoveryCodes: null, mfaLastStep: null },
    });
    await logActivity(user, { action: 'user.mfa.disable', targetType: 'user', targetId: user.id, organizationId: user.organizationId ?? null });
    return NextResponse.json({ enabled: false });
  }

  return jsonError('Action inconnue', 400);
});

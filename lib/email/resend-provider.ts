import type { EmailMessage, EmailProvider, EmailSendResult } from '@/lib/email/provider';

/**
 * Fournisseur réel via l'API HTTP de Resend (aucune dépendance supplémentaire).
 * Configuration par variables d'environnement uniquement : RESEND_API_KEY et EMAIL_FROM.
 * Le contenu des messages n'est jamais écrit dans les logs.
 */
export class ResendProvider implements EmailProvider {
  readonly name = 'resend';
  readonly simulated = false;

  constructor(
    private readonly apiKey: string,
    private readonly from: string,
    private readonly fetchImpl: typeof fetch = fetch
  ) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const res = await this.fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: [message.to], subject: message.subject, text: message.text, ...(message.html ? { html: message.html } : {}) }),
    });
    if (!res.ok) throw new Error(`Resend a refusé l'envoi (HTTP ${res.status})`);
    const body = await res.json().catch(() => null);
    return { id: typeof body?.id === 'string' ? body.id : undefined };
  }
}

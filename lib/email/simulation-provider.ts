import type { EmailMessage, EmailProvider, EmailSendResult } from '@/lib/email/provider';

/**
 * Fournisseur de simulation : n'envoie RIEN. Il garde les messages en mémoire (utile aux tests)
 * et n'écrit dans les logs que le type et le domaine du destinataire, jamais le contenu.
 */
export class SimulationProvider implements EmailProvider {
  readonly name = 'simulation';
  readonly simulated = true;
  readonly outbox: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.outbox.push(message);
    console.info(`[email:simulation] message non envoyé (destinataire @${message.to.split('@')[1] ?? '?'})`);
    return {};
  }
}

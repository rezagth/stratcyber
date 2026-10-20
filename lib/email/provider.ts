/** Contrat d'un fournisseur d'envoi. Le reste du code ne connaît que cette interface. */
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type EmailSendResult = {
  /** Identifiant renvoyé par le fournisseur (absent en simulation). */
  id?: string;
};

export interface EmailProvider {
  readonly name: string;
  /** true : aucun message ne part réellement (mode simulation). */
  readonly simulated: boolean;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

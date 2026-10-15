import { NextRequest } from 'next/server';

export const userA = { id: 'user-a', email: 'a@exemple.fr', name: 'Alex', role: 'user' };
export const userB = { id: 'user-b', email: 'b@exemple.fr', name: 'Alex', role: 'user' }; // homonyme volontaire
export const admin = { id: 'user-admin', email: 'admin@exemple.fr', name: 'Admin', role: 'admin' };

export function sessionFor(user: typeof userA | null) {
  return user ? { user, expires: '2999-01-01T00:00:00.000Z' } : null;
}

export function req(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(`http://localhost${url}`, init);
}

export function ctx<P extends Record<string, string>>(params: P) {
  return { params: Promise.resolve(params) };
}

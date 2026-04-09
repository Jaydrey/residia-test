export const users = {
  alice: {
    email: process.env['ALICE_EMAIL'] ?? '',
    password: process.env['ALICE_PASSWORD'] ?? '',
  },
  bob: {
    email: process.env['BOB_EMAIL'] ?? '',
    password: process.env['BOB_PASSWORD'] ?? '',
  },
  charlie: {
    email: process.env['CHARLIE_EMAIL'] ?? '',
    password: process.env['CHARLIE_PASSWORD'] ?? '',
  },
} as const;

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

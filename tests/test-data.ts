export const users = {
  alice: { email: 'alice@example.com', password: 'password123' },
  bob: { email: 'bob@example.com', password: 'password123' },
  charlie: { email: 'charlie@example.com', password: 'password123' },
} as const;

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

import { db } from "@/db/client"
import { ensureDb } from "@/db/migrate"
import { integrations } from "@/db/schema"
import { createOAuthClient } from "@/lib/google/oauth"
import { getPrimaryEmail } from "@/lib/google/api"

/**
 * Exchanges an OAuth code for tokens and stores them. Server-only — kept out of
 * `server/google.ts` (which the client imports for its server functions) so the
 * database/Node imports never leak into the client bundle. Loaded via dynamic
 * import from the OAuth callback route.
 */
export async function connectWithCode(
  userId: string,
  code: string
): Promise<void> {
  await ensureDb()
  const client = createOAuthClient()
  const { tokens } = await client.getToken(code)
  client.setCredentials(tokens)
  const email = await getPrimaryEmail(client)
  const now = new Date().toISOString()
  await db
    .insert(integrations)
    .values({
      userId,
      provider: "google",
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? null,
      expiresAt: tokens.expiry_date ?? null,
      scope: tokens.scope ?? null,
      email,
      calendarId: "primary",
      taskListId: "@default",
      syncEnabled: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [integrations.userId, integrations.provider],
      set: {
        accessToken: tokens.access_token ?? null,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiresAt: tokens.expiry_date ?? null,
        scope: tokens.scope ?? null,
        email,
        syncEnabled: true,
        updatedAt: now,
      },
    })
}

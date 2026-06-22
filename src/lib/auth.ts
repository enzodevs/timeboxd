import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink } from "better-auth/plugins"

import { db, schema } from "@/db/client"
import { sendEmail } from "@/server/email"

// Google sign-in reuses the same OAuth client as the Calendar/Tasks integration.
// Only register the provider when credentials are present so local/dev installs
// without Google configured still boot. Inlined (not imported from lib/google) to
// keep `google-auth-library` out of any client-reachable graph.
const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.APP_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  socialProviders: googleConfigured
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : undefined,
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Your timeboxd sign-in link",
          text: `Sign in to timeboxd:\n\n${url}\n\nThis link expires shortly. If you didn't request it, ignore this email.`,
          html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h1 style="font-size:20px;margin:0 0 8px">Sign in to timeboxd</h1>
  <p style="color:#555;margin:0 0 24px">Click the button below to sign in. This link expires shortly.</p>
  <a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">Sign in</a>
  <p style="color:#999;font-size:13px;margin:24px 0 0">If you didn't request this, you can safely ignore it.</p>
</div>`,
        })
      },
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await db
            .insert(schema.settings)
            .values({ userId: user.id })
            .onConflictDoNothing()
        },
      },
    },
  },
})

export type AuthSession = typeof auth.$Infer.Session

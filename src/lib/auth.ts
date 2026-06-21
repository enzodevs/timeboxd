import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { db, schema } from "@/db/client"

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

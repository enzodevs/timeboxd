import { createClient } from "@libsql/client"

/**
 * One-time self-host owner backfill.
 *
 * Intended ordering for existing single-user installs:
 * 1. Apply a transitional migration that adds nullable user_id/provider columns.
 * 2. Sign up the owner account, or pass OWNER_USER_ID when more than one user exists.
 * 3. Run:
 *    DATABASE_URL=file:./data/timeboxd.db node --experimental-strip-types src/db/backfill-owner.ts
 * 4. Apply the follow-up migration that enforces NOT NULL owner columns and new PKs.
 *
 * Fresh Turso/cloud databases do not need this script.
 */

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:./data/timeboxd.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

type Row = Record<string, unknown>
type SqlArg = string | number | null

function textArg(value: unknown, fallback: string | null): string | null {
  if (value === null || value === undefined) return fallback
  return String(value)
}

function numberArg(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

async function tableExists(name: string): Promise<boolean> {
  const result = await client.execute({
    sql: "select 1 from sqlite_master where type = 'table' and name = ? limit 1",
    args: [name],
  })
  return result.rows.length > 0
}

async function tableColumns(name: string): Promise<Set<string>> {
  if (!(await tableExists(name))) return new Set()
  const result = await client.execute(`pragma table_info(${name})`)
  return new Set(result.rows.map((row) => String(row.name)))
}

async function requireOwnerUserId(): Promise<string> {
  const explicitOwner = process.env.OWNER_USER_ID
  if (explicitOwner) {
    const result = await client.execute({
      sql: "select id from user where id = ? limit 1",
      args: [explicitOwner],
    })
    if (result.rows.length === 0) {
      throw new Error(
        `OWNER_USER_ID '${explicitOwner}' does not match a user row`
      )
    }
    return explicitOwner
  }

  const result = await client.execute(
    "select id from user order by created_at asc"
  )
  if (result.rows.length === 0) {
    throw new Error(
      "No users found. Sign up the owner account before backfilling."
    )
  }
  if (result.rows.length > 1) {
    throw new Error(
      "Multiple users found. Set OWNER_USER_ID to the intended owner user id."
    )
  }
  return String(result.rows[0]?.id)
}

async function updateNullableOwner(table: string, ownerUserId: string) {
  const columns = await tableColumns(table)
  if (!columns.has("user_id")) {
    console.log(`skip ${table}: user_id column is not present`)
    return
  }
  const result = await client.execute({
    sql: `update ${table} set user_id = ? where user_id is null`,
    args: [ownerUserId],
  })
  console.log(`backfilled ${table}: ${result.rowsAffected} rows`)
}

async function backfillSettings(ownerUserId: string) {
  const columns = await tableColumns("settings")
  if (!columns.has("user_id")) {
    console.log("skip settings: user_id column is not present")
    return
  }

  const hasLegacyId = columns.has("id")
  const legacy = hasLegacyId
    ? await client.execute("select * from settings where id = 'app' limit 1")
    : { rows: [] as Row[] }

  if (legacy.rows[0]) {
    const row = legacy.rows[0] as Row
    const args: SqlArg[] = [
      ownerUserId,
      textArg(row.theme, "light"),
      textArg(row.timezone, null),
      numberArg(row.day_start_hour, 0),
      numberArg(row.week_start, 1),
      textArg(row.updated_at, new Date().toISOString()),
    ]
    await client.execute({
      sql: `
        insert into settings (
          user_id, theme, timezone, day_start_hour, week_start, updated_at
        )
        values (?, ?, ?, ?, ?, ?)
        on conflict(user_id) do update set
          theme = excluded.theme,
          timezone = excluded.timezone,
          day_start_hour = excluded.day_start_hour,
          week_start = excluded.week_start,
          updated_at = excluded.updated_at
      `,
      args,
    })
    console.log("backfilled settings from id='app'")
    return
  }

  await client.execute({
    sql: "update settings set user_id = ? where user_id is null",
    args: [ownerUserId],
  })
  console.log("backfilled settings user_id")
}

async function backfillIntegrations(ownerUserId: string) {
  const columns = await tableColumns("integrations")
  if (!columns.has("user_id")) {
    console.log("skip integrations: user_id column is not present")
    return
  }
  if (!columns.has("provider")) {
    console.log("skip integrations: provider column is not present")
    return
  }

  const providerExpr = columns.has("id")
    ? "coalesce(provider, id, 'google')"
    : "coalesce(provider, 'google')"

  const result = await client.execute({
    sql: `
      update integrations
      set
        user_id = coalesce(user_id, ?),
        provider = ${providerExpr}
      where user_id is null or provider is null
    `,
    args: [ownerUserId],
  })
  console.log(`backfilled integrations: ${result.rowsAffected} rows`)
}

async function main() {
  if (!(await tableExists("user"))) {
    throw new Error("Missing user table. Apply the auth migration first.")
  }

  const ownerUserId = await requireOwnerUserId()
  await updateNullableOwner("tasks", ownerUserId)
  await updateNullableOwner("timeboxes", ownerUserId)
  await updateNullableOwner("notes", ownerUserId)
  await backfillSettings(ownerUserId)
  await backfillIntegrations(ownerUserId)
  console.log(`owner backfill complete for user ${ownerUserId}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})

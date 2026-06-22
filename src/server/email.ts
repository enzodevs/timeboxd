// Server-only email sending. The `resend` SDK is imported dynamically so it never
// lands in any client-reachable module graph (see db/client.ts for the same gotcha).
//
// Without RESEND_API_KEY the helper logs the message instead of sending — magic
// links still work locally (copy the URL from the server logs); add the key in
// production to actually deliver mail.

type SendArgs = {
  to: string
  subject: string
  html: string
  text: string
}

const FROM = process.env.EMAIL_FROM ?? "timeboxd <onboarding@resend.dev>"

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY not set — not sending. To: ${to} | ${subject}\n${text}`
    )
    return
  }

  const { Resend } = await import("resend")
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text })
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}

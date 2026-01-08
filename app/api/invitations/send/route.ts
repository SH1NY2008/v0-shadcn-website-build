import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      friendName,
      friendEmail,
      sessionTitle,
      sessionDate,
      sessionTime,
      message,
    } = body as {
      friendName?: string
      friendEmail?: string
      sessionTitle?: string
      sessionDate?: string
      sessionTime?: string
      message?: string
    }

    if (!friendEmail || typeof friendEmail !== "string") {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 })
    }
    const to = friendEmail.trim()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const host = process.env.SMTP_HOST
    const portStr = process.env.SMTP_PORT
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const secureEnv = process.env.SMTP_SECURE
    const from = process.env.SMTP_FROM || user

    if (!host || !portStr || !user || !pass || !from) {
      const missing: string[] = []
      if (!host) missing.push("SMTP_HOST")
      if (!portStr) missing.push("SMTP_PORT")
      if (!user) missing.push("SMTP_USER")
      if (!pass) missing.push("SMTP_PASS")
      if (!from) missing.push("SMTP_FROM")
      return NextResponse.json(
        {
          error: "Email service not configured: SMTP env vars missing",
          details: { missing, expected: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"] },
        },
        { status: 500 },
      )
    }

    const port = Number.parseInt(portStr, 10)
    const secure = secureEnv === "true" || port === 465

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    const subject = `Study Session Invite: ${sessionTitle || "Math Study"}`

    const safeDate = sessionDate || "TBD"
    const safeTime = sessionTime || "TBD"
    const html = `
      <div>
        <p>Hey ${friendName || "there"},</p>
        <p>I'd like to invite you to join me for a study session on Numeria.inc.</p>
        <p><strong>Session:</strong> ${sessionTitle || "Math Study Session"}<br/>
        <strong>Date:</strong> ${safeDate}<br/>
        <strong>Time:</strong> ${safeTime}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ""}
        <p>Join me at: ${process.env.APP_URL || "https://numeria.inc"}</p>
       <p>Looking forward to studying together!</p>
      </div>
    `

    const info = await transporter.sendMail({ from, to, subject, html })
    return NextResponse.json({ id: info.messageId })
  } catch (e: any) {
    console.error("[invite] Request error:", e)
    return NextResponse.json({ error: "Invalid request", details: String(e?.message || e) }, { status: 400 })
  }
}

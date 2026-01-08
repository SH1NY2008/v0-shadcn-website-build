"use server"

import { Resend } from "resend"

interface InviteEmailParams {
  friendName: string
  friendEmail: string
  sessionTitle: string
  sessionDate: string
  sessionTime: string
  message: string
}

export async function sendStudyInvite(params: InviteEmailParams) {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error("Resend API key not configured. Please add RESEND_API_KEY to your environment variables.")
  }

  const resend = new Resend(apiKey)

  try {
    const { data, error } = await resend.emails.send({
      from: "Numeria.inc <onboarding@resend.dev>", // Use your verified domain in production
      to: [params.friendEmail],
      subject: `Study Session Invitation: ${params.sessionTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #087CA7 0%, #004385 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; }
              .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .detail-row { margin: 10px 0; }
              .detail-label { font-weight: bold; color: #004385; }
              .message { background: #e8f4f8; padding: 15px; border-left: 4px solid #087CA7; margin: 20px 0; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              .button { display: inline-block; background: #087CA7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📚 Study Session Invitation</h1>
                <p>You've been invited to a Numeria.inc study session!</p>
              </div>
              <div class="content">
                <p>Hi ${params.friendName},</p>
                <p>You've been invited to join a study session on Numeria.inc.</p>
                
                <div class="details">
                  <div class="detail-row">
                    <span class="detail-label">Session:</span> ${params.sessionTitle}
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Date:</span> ${params.sessionDate}
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Time:</span> ${params.sessionTime}
                  </div>
                </div>

                ${params.message ? `<div class="message"><strong>Personal Message:</strong><br/>${params.message}</div>` : ""}

                <p>Join your study partner and master high school mathematics together with Numeria.inc's comprehensive resources, video lessons, and practice materials.</p>
                
                <center>
                  <a href="https://numeria.inc/schedule" class="button">View Schedule</a>
                </center>
              </div>
              <div class="footer">
                <p>Powered by Numeria.inc - Master Math Together</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to send invitation")
  }
}

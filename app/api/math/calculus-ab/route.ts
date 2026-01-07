import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    courseName: "AP Calculus AB / Calculus 1",
    openstaxBookTitle: "Calculus Volume 1",
    pdfUrl: "https://assets.openstax.org/oscms-prodcms/media/documents/Calculus_Volume_1_-_WEB.pdf",
    license: "CC BY",
    source: "OpenStax",
  })
}

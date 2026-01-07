import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    courseName: "AP Calculus BC / Calculus 2",
    openstaxBookTitle: "Calculus Volume 2",
    pdfUrl: "https://assets.openstax.org/oscms-prodcms/media/documents/Calculus_Volume_2_-_WEB.pdf",
    license: "CC BY",
    source: "OpenStax",
  })
}

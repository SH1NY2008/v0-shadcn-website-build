import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    courseName: "Precalculus",
    openstaxBookTitle: "Precalculus 2e",
    pdfUrl: "https://assets.openstax.org/oscms-prodcms/media/documents/Precalculus2e-WEB.pdf",
    license: "CC BY",
    source: "OpenStax",
  })
}

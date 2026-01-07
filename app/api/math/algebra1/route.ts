import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    courseName: "Algebra 1",
    openstaxBookTitle: "Elementary Algebra 2e",
    pdfUrl: "https://assets.openstax.org/oscms-prodcms/media/documents/ElementaryAlgebra2e-WEB.pdf",
    license: "CC BY",
    source: "OpenStax",
  })
}

import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    courseName: "Algebra 2",
    openstaxBookTitle: "Intermediate Algebra 2e",
    pdfUrl: "https://assets.openstax.org/oscms-prodcms/media/documents/IntermediateAlgebra2e-WEB.pdf",
    license: "CC BY",
    source: "OpenStax",
  })
}

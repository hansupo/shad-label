import { NextRequest, NextResponse } from "next/server"
import puppeteer from "puppeteer"

export async function POST(request: NextRequest) {
  try {
    const { html, filename } = await request.json()

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      )
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    // Set viewport to A4 size
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 2 // Higher quality
    })

    // Create a complete HTML document with proper styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              color: black;
              background: white;
              padding: 20mm;
              width: 210mm;
              min-height: 297mm;
            }
            /* Override any problematic color functions */
            * {
              color: black !important;
              background-color: white !important;
              border-color: black !important;
            }
            .bg-primary, .bg-secondary, .bg-accent, .bg-muted {
              background-color: #f0f0f0 !important;
            }
            .text-primary, .text-secondary, .text-accent, .text-muted {
              color: black !important;
            }
            .border, .border-2, .border-4 {
              border-color: black !important;
            }
            h1, h2, h3, h4, h5, h6, p, div, span, a {
              color: black !important;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `

    // Set the HTML content
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    })

    await browser.close()

    // Return PDF as response
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename || 'label.pdf'}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}

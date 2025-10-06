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
          <!-- Tailwind CDN to render utility classes used in templates -->
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important; /* Chrome/Safari */
              print-color-adjust: exact !important; /* Standard */
            }
            html, body {
              height: 100%;
            }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji";
              font-size: 14px;
              line-height: 1.4;
              color: #111827;
              background: white;
              padding: 0;
              width: 210mm; /* A4 width */
              min-height: 297mm; /* A4 height */
            }
            @page {
              size: A4;
              margin: 0;
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

  // Match screen rendering (like the in-app preview)
  await page.emulateMediaType('screen')

    // Generate PDF
    const pdf = await page.pdf({
    format: 'A4',
      printBackground: true,
    preferCSSPageSize: true,
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

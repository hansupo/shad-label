import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample attributes
  const attributes = await Promise.all([
    prisma.attribute.create({
      data: {
        name: 'Color',
        label: 'Color',
        type: 'text',
        required: true,
        priority: 90
      }
    }),
    prisma.attribute.create({
      data: {
        name: 'Size',
        label: 'Size',
        type: 'text',
        required: false,
        priority: 80
      }
    }),
    prisma.attribute.create({
      data: {
        name: 'Material',
        label: 'Material',
        type: 'text',
        required: true,
        priority: 70
      }
    }),
    prisma.attribute.create({
      data: {
        name: 'Product URL',
        label: 'Product URL',
        type: 'url',
        required: false,
        priority: 60
      }
    }),
    prisma.attribute.create({
      data: {
        name: 'QR Code',
        label: 'QR Code',
        type: 'qrcode',
        required: false,
        priority: 50
      }
    }),
    prisma.attribute.create({
      data: {
        name: 'Barcode',
        label: 'Barcode',
        type: 'barcode',
        required: true,
        priority: 40
      }
    })
  ])

  console.log(`Created ${attributes.length} attributes`)

  // Create default label template
  const defaultTemplate = await prisma.labelTemplate.create({
    data: {
      name: 'A4 with 2x A6 (labels)',
      html: `
      <style>
        .sheet { width: 210mm; height: 297mm; position: relative; font-family: Arial, sans-serif; background: white; }
        .half { width: 210mm; height: 148.5mm; position: relative; }
        .center-a6 { width: 148mm; height: 105mm; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 0.2mm solid black; }
        .fold-line-h { position: absolute; left: 0; right: 0; top: 148.5mm; border-top: 0.2mm dashed black; }
        .fold-line-v-left { position: absolute; top: 0; bottom: 0; left: 30mm; border-left: 0.2mm dashed black; }
        .fold-line-v-right { position: absolute; top: 0; bottom: 0; right: 30mm; border-right: 0.2mm dashed black; }
        .a6 { width: 148mm; height: 105mm; padding: 6mm; box-sizing: border-box; }
        .row { display: flex; justify-content: space-between; align-items: center; }
        .muted { color: black; opacity: 0.7; font-size: 3mm; }
        .title { font-size: 8mm; font-weight: 800; line-height: 1.1; }
        .attrs p { margin: 0 0 1.5mm 0; font-size: 3.5mm; }
        .price { font-size: 8mm; font-weight: 800; }
        .tiny { font-size: 3mm; }
        .qr { width: 22mm; height: 22mm; border: 0.2mm solid black; display: flex; align-items: center; justify-content: center; font-size: 3mm; }
      </style>
      <div class="sheet">
        <div class="fold-line-h"></div>
        <div class="fold-line-v-left"></div>
        <div class="fold-line-v-right"></div>

        <!-- Top half: customer-facing -->
        <div class="half">
          <div class="center-a6 a6">
            <div class="row" style="margin-bottom: 4mm;">
              <div style="text-align:center; width:100%;">
                <div class="title">{{productName}}</div>
              </div>
            </div>
            <div class="row" style="gap: 6mm; margin-bottom: 4mm;">
              <div class="attrs" style="flex:1;">
                <p><strong>Color:</strong> {{Color}}</p>
                <p><strong>Size:</strong> {{Size}}</p>
                <p><strong>Material:</strong> {{Material}}</p>
              </div>
              <div class="qr">{{QR Code}}</div>
            </div>
            <div class="row" style="border-top:0.2mm solid black; padding-top:2mm;">
              <div class="tiny" style="text-align:center; width:100%;">{{Product URL}}</div>
            </div>
          </div>
        </div>

        <!-- Bottom half: internal info -->
        <div class="half" style="top: 148.5mm; position: absolute;">
          <div class="center-a6 a6">
            <div class="row" style="margin-bottom: 4mm;">
              <div class="title">{{productName}}</div>
            </div>
            <div class="attrs" style="margin-bottom: auto;">
              <p><strong>Color:</strong> {{Color}}</p>
              <p><strong>Size:</strong> {{Size}}</p>
              <p><strong>Material:</strong> {{Material}}</p>
              <p><strong>Barcode:</strong> {{Barcode}}</p>
            </div>
            <div class="row" style="align-items: flex-end;">
              <div class="tiny">EAN: {{Barcode}}</div>
              <div class="price">{{Price}}</div>
            </div>
          </div>
        </div>
      </div>
      `
    }
  })

  console.log(`Created default label template: ${defaultTemplate.name}`)
  
  // Create sample products
  await prisma.product.createMany({
    data: [
      {
        name: 'Sample Bike Helmet',
        attributes: {
          Nimi: 'Käva Helmet Pro',
          Artikkel: 'HELM-001',
          Klass: 'Accessories',
          Hind: '49.90',
          Color: 'Black',
          Size: 'M',
          Material: 'ABS',
          'QR Code': 'https://example.com/products/helm-001',
          'Product URL': 'https://example.com/products/helm-001',
          Barcode: '1234567890123',
          Price: '49.90€'
        }
      },
      {
        name: 'Sample Road Bike',
        attributes: {
          Nimi: 'Velomari RS 2.0',
          Artikkel: 'BIKE-100',
          Klass: 'Bikes',
          Hind: '1299.00',
          Color: 'Red',
          Size: '54',
          Material: 'Aluminium',
          'QR Code': 'https://example.com/products/bike-100',
          'Product URL': 'https://example.com/products/bike-100',
          Barcode: '9876543210987',
          Price: '1299.00€'
        }
      }
    ]
  })
  console.log('Created sample products')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

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

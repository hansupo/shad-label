import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/products/import - Import products from CSV data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Products array is required' }, { status: 400 })
    }

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products to import' }, { status: 400 })
    }

    // Validate each product
    for (const product of products) {
      if (!product.name || typeof product.name !== 'string') {
        return NextResponse.json({ error: 'Each product must have a valid name' }, { status: 400 })
      }
      if (!product.attributes || typeof product.attributes !== 'object') {
        return NextResponse.json({ error: 'Each product must have valid attributes' }, { status: 400 })
      }
    }

    // Create products in database
    const createdProducts = await prisma.product.createMany({
      data: products.map(product => ({
        name: product.name,
        attributes: product.attributes
      }))
    })

    return NextResponse.json({ 
      count: createdProducts.count,
      message: `Successfully imported ${createdProducts.count} products`
    })

  } catch (error) {
    console.error('Error importing products:', error)
    return NextResponse.json({ error: 'Failed to import products' }, { status: 500 })
  }
}

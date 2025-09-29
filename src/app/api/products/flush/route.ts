import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/products/flush - Delete all products (debug function)
export async function DELETE() {
  try {
    const result = await prisma.product.deleteMany({})
    
    return NextResponse.json({ 
      count: result.count,
      message: `Successfully deleted ${result.count} products`
    })
  } catch (error) {
    console.error('Error flushing products:', error)
    return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 })
  }
}

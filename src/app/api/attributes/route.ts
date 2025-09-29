import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/attributes - Get all attributes
export async function GET() {
  try {
    const attributes = await prisma.attribute.findMany({
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' }
      ]
    })
    return NextResponse.json(attributes)
  } catch (error) {
    console.error('Error fetching attributes:', error)
    return NextResponse.json({ error: 'Failed to fetch attributes' }, { status: 500 })
  }
}

// DELETE /api/attributes - Flush all attributes
export async function DELETE() {
  try {
    await prisma.attribute.deleteMany({})
    return NextResponse.json({ message: 'All attributes deleted successfully' })
  } catch (error) {
    console.error('Error flushing attributes:', error)
    return NextResponse.json({ error: 'Failed to delete attributes' }, { status: 500 })
  }
}

// POST /api/attributes - Create new attribute
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, label, type, required, priority } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    // Validate type
    const validTypes = ['text', 'url', 'qrcode', 'barcode']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be one of: text, url, qrcode, barcode' }, { status: 400 })
    }

    // Validate priority
    if (priority && (priority < 1 || priority > 100)) {
      return NextResponse.json({ error: 'Priority must be between 1 and 100' }, { status: 400 })
    }

    const attribute = await prisma.attribute.create({
      data: {
        name,
        label: label || name, // Use name as default if label not provided
        type,
        required: required || false,
        priority: priority || 50
      }
    })

    return NextResponse.json(attribute, { status: 201 })
  } catch (error) {
    console.error('Error creating attribute:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Attribute name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create attribute' }, { status: 500 })
  }
}

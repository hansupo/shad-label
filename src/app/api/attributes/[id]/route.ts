import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/attributes/[id] - Get single attribute
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid attribute ID' }, { status: 400 })
    }

    const attribute = await prisma.attribute.findUnique({
      where: { id }
    })

    if (!attribute) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 })
    }

    return NextResponse.json(attribute)
  } catch (error) {
    console.error('Error fetching attribute:', error)
    return NextResponse.json({ error: 'Failed to fetch attribute' }, { status: 500 })
  }
}

// PUT /api/attributes/[id] - Update attribute
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid attribute ID' }, { status: 400 })
    }

    const body = await request.json()
    const { name, label, type, required, priority } = body

    // Validate type if provided
    if (type) {
      const validTypes = ['text', 'url', 'qrcode', 'barcode']
      if (!validTypes.includes(type)) {
        return NextResponse.json({ error: 'Invalid type. Must be one of: text, url, qrcode, barcode' }, { status: 400 })
      }
    }

    // Validate priority if provided
    if (priority && (priority < 1 || priority > 100)) {
      return NextResponse.json({ error: 'Priority must be between 1 and 100' }, { status: 400 })
    }

    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(label !== undefined && { label: label || name }), // Use name as default if label is empty
        ...(type && { type }),
        ...(typeof required === 'boolean' && { required }),
        ...(priority && { priority })
      }
    })

    return NextResponse.json(attribute)
  } catch (error) {
    console.error('Error updating attribute:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Attribute name already exists' }, { status: 409 })
    }
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update attribute' }, { status: 500 })
  }
}

// DELETE /api/attributes/[id] - Delete attribute
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid attribute ID' }, { status: 400 })
    }

    await prisma.attribute.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Attribute deleted successfully' })
  } catch (error) {
    console.error('Error deleting attribute:', error)
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Attribute not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete attribute' }, { status: 500 })
  }
}

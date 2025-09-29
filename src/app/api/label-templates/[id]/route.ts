import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const template = await prisma.labelTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json(
        { error: "Label template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error fetching label template:", error)
    return NextResponse.json(
      { error: "Failed to fetch label template" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { name, html } = body

    if (!name || !html) {
      return NextResponse.json(
        { error: "Name and HTML are required" },
        { status: 400 }
      )
    }

    const template = await prisma.labelTemplate.update({
      where: { id },
      data: {
        name,
        html
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error("Error updating label template:", error)
    return NextResponse.json(
      { error: "Failed to update label template" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    await prisma.labelTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Label template deleted successfully" })
  } catch (error) {
    console.error("Error deleting label template:", error)
    return NextResponse.json(
      { error: "Failed to delete label template" },
      { status: 500 }
    )
  }
}

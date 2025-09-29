import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const templates = await prisma.labelTemplate.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching label templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch label templates" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, html } = body

    if (!name || !html) {
      return NextResponse.json(
        { error: "Name and HTML are required" },
        { status: 400 }
      )
    }

    const template = await prisma.labelTemplate.create({
      data: {
        name,
        html
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating label template:", error)
    return NextResponse.json(
      { error: "Failed to create label template" },
      { status: 500 }
    )
  }
}

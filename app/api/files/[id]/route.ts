import { type NextRequest, NextResponse } from "next/server"
import { FileProcessor } from "@/lib/fileProcessor"

// Import the files array from the main route
// In production, this would be a database query
const files: Array<{
  id: string
  name: string
  size: number
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  uploadedAt: string
  type: string
  content?: string
  jobId?: string
}> = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const file = files.find((f) => f.id === params.id)

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  return NextResponse.json({ file })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const fileIndex = files.findIndex((f) => f.id === params.id)

  if (fileIndex === -1) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const file = files[fileIndex]

  if (file.jobId) {
    FileProcessor.cancelJob(file.jobId)
  }

  files.splice(fileIndex, 1)

  return NextResponse.json({ message: "File deleted successfully" })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const fileIndex = files.findIndex((f) => f.id === params.id)

  if (fileIndex === -1) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const updates = await request.json()
  files[fileIndex] = { ...files[fileIndex], ...updates }

  return NextResponse.json({ file: files[fileIndex] })
}

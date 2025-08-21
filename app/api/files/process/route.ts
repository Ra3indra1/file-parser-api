import { type NextRequest, NextResponse } from "next/server"

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
}> = []

export async function POST(request: NextRequest) {
  const { fileId, operation } = await request.json()

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 })
  }

  const fileIndex = files.findIndex((f) => f.id === fileId)

  if (fileIndex === -1) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  const file = files[fileIndex]

  switch (operation) {
    case "reprocess":
      file.status = "processing"
      file.progress = 0
      // Start processing again
      setTimeout(() => processFile(fileId), 500)
      break

    case "cancel":
      if (file.status === "processing" || file.status === "uploading") {
        file.status = "error"
        file.progress = 0
      }
      break

    default:
      return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
  }

  return NextResponse.json({
    message: `File ${operation} initiated successfully`,
    file,
  })
}

// Simulate file processing
async function processFile(fileId: string) {
  const fileIndex = files.findIndex((f) => f.id === fileId)
  if (fileIndex === -1) return

  const progressInterval = setInterval(() => {
    const file = files[fileIndex]
    if (!file || file.status !== "processing") {
      clearInterval(progressInterval)
      return
    }

    file.progress = Math.min(file.progress + Math.random() * 20, 100)

    if (file.progress >= 100) {
      clearInterval(progressInterval)
      // Simulate processing result
      file.status = Math.random() > 0.15 ? "completed" : "error"
      file.progress = 100
    }
  }, 300)
}

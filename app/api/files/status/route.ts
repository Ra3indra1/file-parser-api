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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileIds = searchParams.get("ids")?.split(",") || []

  if (fileIds.length === 0) {
    return NextResponse.json({ error: "No file IDs provided" }, { status: 400 })
  }

  const fileStatuses = fileIds
    .map((id) => {
      const file = files.find((f) => f.id === id)
      return file
        ? {
            id: file.id,
            status: file.status,
            progress: file.progress,
          }
        : null
    })
    .filter(Boolean)

  return NextResponse.json({ statuses: fileStatuses })
}

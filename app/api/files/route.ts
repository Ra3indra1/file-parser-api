import { type NextRequest, NextResponse } from "next/server"
import { FileProcessor } from "@/lib/file-processor"

// In-memory storage for demo purposes
// In production, use a database like PostgreSQL
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

export async function GET() {
  return NextResponse.json({ files })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const content = await file.text()

    // Create file record
    const fileRecord = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: "processing" as const,
      progress: 0,
      uploadedAt: new Date().toISOString(),
      type: file.type || "application/octet-stream",
      content,
    }

    files.push(fileRecord)

    const jobId = await FileProcessor.queueJob(fileRecord.id, file.name, file.type, content)

    fileRecord.jobId = jobId

    // Start monitoring job progress
    monitorJobProgress(fileRecord.id, jobId)

    return NextResponse.json({
      message: "File uploaded successfully",
      fileId: fileRecord.id,
      jobId,
      file: fileRecord,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

async function monitorJobProgress(fileId: string, jobId: string) {
  const checkInterval = setInterval(() => {
    const job = FileProcessor.getJob(jobId)
    const fileIndex = files.findIndex((f) => f.id === fileId)

    if (!job || fileIndex === -1) {
      clearInterval(checkInterval)
      return
    }

    const file = files[fileIndex]

    // Update file status based on job status
    switch (job.status) {
      case "processing":
        file.status = "processing"
        file.progress = job.progress
        break
      case "completed":
        file.status = "completed"
        file.progress = 100
        clearInterval(checkInterval)
        break
      case "failed":
        file.status = "error"
        file.progress = 0
        clearInterval(checkInterval)
        break
    }
  }, 500)

  // Cleanup after 5 minutes
  setTimeout(() => clearInterval(checkInterval), 5 * 60 * 1000)
}

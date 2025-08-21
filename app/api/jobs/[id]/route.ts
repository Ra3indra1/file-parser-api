import { type NextRequest, NextResponse } from "next/server"
import { FileProcessor } from "@/lib/file-processor"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = FileProcessor.getJob(params.id)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Failed to fetch job:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cancelled = FileProcessor.cancelJob(params.id)

    if (!cancelled) {
      return NextResponse.json({ error: "Job not found or cannot be cancelled" }, { status: 404 })
    }

    return NextResponse.json({ message: "Job cancelled successfully" })
  } catch (error) {
    console.error("Failed to cancel job:", error)
    return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 })
  }
}

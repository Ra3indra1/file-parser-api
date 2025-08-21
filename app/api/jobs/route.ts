import { NextResponse } from "next/server"
import { FileProcessor } from "@/lib/file-processor"

export async function GET() {
  try {
    const jobs = FileProcessor.getAllJobs()
    const stats = FileProcessor.getQueueStats()

    return NextResponse.json({
      jobs: jobs.slice(-50), // Return last 50 jobs
      stats,
    })
  } catch (error) {
    console.error("Failed to fetch jobs:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}

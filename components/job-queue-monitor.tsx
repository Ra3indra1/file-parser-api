"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Job {
  id: string
  fileId: string
  fileName: string
  fileType: string
  status: "queued" | "processing" | "completed" | "failed"
  progress: number
  startedAt?: string
  completedAt?: string
  error?: string
}

interface JobQueueMonitorProps {
  className?: string
}

export function JobQueueMonitor({ className }: JobQueueMonitorProps) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
    const interval = setInterval(fetchJobs, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await apiClient.getJobs()
      setJobs(response.jobs || [])
      setStats(response.stats || stats)
    } catch (error) {
      console.error("Failed to fetch jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelJob = async (jobId: string) => {
    try {
      await apiClient.cancelJob(jobId)
      fetchJobs() // Refresh jobs
    } catch (error) {
      console.error("Failed to cancel job:", error)
    }
  }

  const getStatusIcon = (status: Job["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      case "processing":
        return <Loader2 className="h-4 w-4 text-accent animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusBadge = (status: Job["status"]) => {
    const variants = {
      queued: "secondary",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
    } as const

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading job queue...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-serif">Processing Queue Stats</CardTitle>
          <CardDescription>Real-time background job statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{stats.queued}</div>
              <div className="text-sm text-muted-foreground">Queued</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.processing}</div>
              <div className="text-sm text-muted-foreground">Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Recent Jobs</CardTitle>
          <CardDescription>Background processing job queue</CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No jobs in queue</p>
              <p className="text-muted-foreground">Upload files to see background processing jobs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 10).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    {getStatusIcon(job.status)}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{job.fileName}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Job ID: {job.id.slice(0, 8)}</span>
                        {job.startedAt && <span>Started: {new Date(job.startedAt).toLocaleTimeString()}</span>}
                      </div>
                      {job.error && <p className="text-sm text-destructive mt-1">{job.error}</p>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(job.status)}

                    {job.status === "processing" && (
                      <div className="flex items-center space-x-2">
                        <Progress value={job.progress} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground min-w-[3rem]">{job.progress}%</span>
                      </div>
                    )}

                    {(job.status === "queued" || job.status === "processing") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelJob(job.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

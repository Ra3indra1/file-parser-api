import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, FileText } from "lucide-react"

interface FileItem {
  id: string
  name: string
  size: number
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  uploadedAt: Date
  type: string
}

interface AnalyticsDashboardProps {
  files: FileItem[]
}

export function AnalyticsDashboard({ files }: AnalyticsDashboardProps) {
  // Calculate analytics
  const stats = {
    total: files.length,
    processing: files.filter((f) => f.status === "uploading" || f.status === "processing").length,
    completed: files.filter((f) => f.status === "completed").length,
    failed: files.filter((f) => f.status === "error").length,
  }

  const successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
  const totalSize = files.reduce((acc, file) => acc + file.size, 0)

  // File type distribution
  const fileTypes = files.reduce(
    (acc, file) => {
      const type = file.type.split("/")[0] || "unknown"
      acc[type] = (acc[type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Recent activity (last 24 hours)
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const recentFiles = files.filter((file) => file.uploadedAt >= yesterday)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Overview of your file processing activity and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{formatFileSize(totalSize)} total size</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <Progress value={successRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentFiles.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Processing Status</CardTitle>
            <CardDescription>Current status distribution of all files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{stats.completed}</span>
                <Badge variant="default">
                  {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-accent" />
                <span>Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{stats.processing}</span>
                <Badge variant="secondary">
                  {stats.total > 0 ? ((stats.processing / stats.total) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span>Failed</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{stats.failed}</span>
                <Badge variant="destructive">
                  {stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">File Types</CardTitle>
            <CardDescription>Distribution by file type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(fileTypes).length > 0 ? (
              Object.entries(fileTypes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{count}</span>
                      <Badge variant="outline">{((count / stats.total) * 100).toFixed(0)}%</Badge>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No files uploaded yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Files */}
      {recentFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recent Activity</CardTitle>
            <CardDescription>Files uploaded in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentFiles.slice(0, 5).map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{file.uploadedAt.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      file.status === "completed" ? "default" : file.status === "error" ? "destructive" : "secondary"
                    }
                  >
                    {file.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

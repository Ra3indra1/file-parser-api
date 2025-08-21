import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

interface ProgressIndicatorProps {
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  showPercentage?: boolean
}

export function ProgressIndicator({ status, progress, showPercentage = true }: ProgressIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-4 w-4 text-accent animate-spin" />
      case "processing":
        return <Clock className="h-4 w-4 text-accent" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusBadge = () => {
    const variants = {
      uploading: "secondary",
      processing: "secondary",
      completed: "default",
      error: "destructive",
    } as const

    const labels = {
      uploading: "Uploading",
      processing: "Processing",
      completed: "Completed",
      error: "Failed",
    }

    return (
      <Badge variant={variants[status]} className="capitalize">
        {labels[status]}
      </Badge>
    )
  }

  const getProgressColor = () => {
    switch (status) {
      case "completed":
        return "bg-green-600"
      case "error":
        return "bg-destructive"
      default:
        return "bg-accent"
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {getStatusIcon()}
      {getStatusBadge()}

      {(status === "uploading" || status === "processing") && (
        <div className="flex items-center space-x-2">
          <Progress
            value={progress}
            className="w-24 h-2"
            // Apply custom color based on status
          />
          {showPercentage && (
            <span className="text-xs text-muted-foreground min-w-[3rem]">{Math.round(progress)}%</span>
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileText, Trash2, RotateCcw, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useFileProgress } from "@/hooks/use-file-progress"
import { ProgressIndicator } from "@/components/progress-indicator"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobQueueMonitor } from "@/components/job-queue-monitor"

export default function FileParserDashboard() {
  const { files, uploadFiles, deleteFile, reprocessFile, cancelProcessing, isPolling } = useFileProgress()
  const [activeSection, setActiveSection] = useState("files")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = async (fileList: FileList) => {
    try {
      await uploadFiles(fileList)
      toast({
        title: "Files uploaded successfully",
        description: `${fileList.length} file(s) are being processed.`,
      })
      // Switch to files view after upload
      setActiveSection("files")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId)
      toast({
        title: "File deleted",
        description: "File has been removed from the system.",
      })
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the file.",
        variant: "destructive",
      })
    }
  }

  const handleReprocess = async (fileId: string) => {
    try {
      await reprocessFile(fileId)
      toast({
        title: "Reprocessing started",
        description: "File is being processed again.",
      })
    } catch (error) {
      toast({
        title: "Reprocess failed",
        description: "There was an error reprocessing the file.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async (fileId: string) => {
    try {
      await cancelProcessing(fileId)
      toast({
        title: "Processing cancelled",
        description: "File processing has been cancelled.",
      })
    } catch (error) {
      toast({
        title: "Cancel failed",
        description: "There was an error cancelling the process.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const stats = {
    total: files.length,
    processing: files.filter((f) => f.status === "uploading" || f.status === "processing").length,
    completed: files.filter((f) => f.status === "completed").length,
    failed: files.filter((f) => f.status === "error").length,
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || file.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderMainContent = () => {
    switch (activeSection) {
      case "upload":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Upload Files</h2>
              <p className="text-muted-foreground">Upload and process your files with real-time progress tracking</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">File Upload</CardTitle>
                <CardDescription>Drag and drop files here or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? "border-primary bg-card" : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop files here to upload</p>
                  <p className="text-muted-foreground mb-4">Supports all file types up to 10MB</p>
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Browse Files
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "analytics":
        return (
          <div className="space-y-6">
            <AnalyticsDashboard files={files} />
            <JobQueueMonitor />
          </div>
        )

      case "history":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Processing History</h2>
              <p className="text-muted-foreground">View completed and failed file processing history</p>
            </div>

            <div className="grid gap-4">
              {files.filter((f) => f.status === "completed" || f.status === "error").length === 0 ? (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No processing history yet</p>
                      <p className="text-muted-foreground">Upload files to see processing history</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                files
                  .filter((f) => f.status === "completed" || f.status === "error")
                  .map((file) => (
                    <Card key={file.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{file.name}</h3>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{file.uploadedAt.toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <ProgressIndicator status={file.status} progress={file.progress} showPercentage={false} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        )

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">Settings</h2>
              <p className="text-muted-foreground">
                Configure your file processing preferences and monitor background jobs
              </p>
            </div>

            <JobQueueMonitor />

            <Card>
              <CardHeader>
                <CardTitle>File Processing Settings</CardTitle>
                <CardDescription>Customize how files are processed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )

      default: // files
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold mb-2">My Files</h2>
                <p className="text-muted-foreground">Manage and monitor your uploaded files</p>
              </div>

              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    <SelectItem value="uploading">Uploading</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="error">Failed</SelectItem>
                  </SelectContent>
                </Select>

                {isPolling && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span>Live updates</span>
                  </div>
                )}
              </div>
            </div>

            {filteredFiles.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {files.length === 0 ? "No files uploaded yet" : "No files match your filters"}
                    </p>
                    <p className="text-muted-foreground">
                      {files.length === 0
                        ? "Upload your first file to get started"
                        : "Try adjusting your search or filter criteria"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{file.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              <span>{file.uploadedAt.toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <ProgressIndicator status={file.status} progress={file.progress} showPercentage={true} />

                          <div className="flex items-center space-x-2">
                            {file.status === "error" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => reprocessFile(file.id)}
                                className="text-accent hover:text-accent/90"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}

                            {(file.status === "processing" || file.status === "uploading") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelProcessing(file.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteFile(file.id)}
                              className="text-destructive hover:text-destructive/90"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        fileStats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8 max-w-6xl">{renderMainContent()}</div>
      </div>

      <Toaster />
    </div>
  )
}

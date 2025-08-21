"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

interface FileItem {
  id: string
  name: string
  size: number
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  uploadedAt: Date
  type: string
}

export function useFileProgress() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isPolling, setIsPolling] = useState(false)

  // Poll for progress updates
  useEffect(() => {
    if (!isPolling || files.length === 0) return

    const activeFiles = files.filter((file) => file.status === "uploading" || file.status === "processing")

    if (activeFiles.length === 0) {
      setIsPolling(false)
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const fileIds = activeFiles.map((file) => file.id)
        const { statuses } = await apiClient.getFileStatuses(fileIds)

        setFiles((prevFiles) =>
          prevFiles.map((file) => {
            const statusUpdate = statuses.find((s: any) => s.id === file.id)
            if (statusUpdate) {
              return {
                ...file,
                status: statusUpdate.status,
                progress: statusUpdate.progress,
              }
            }
            return file
          }),
        )

        // Stop polling if all files are complete
        const stillActive = statuses.some((s: any) => s.status === "uploading" || s.status === "processing")
        if (!stillActive) {
          setIsPolling(false)
        }
      } catch (error) {
        console.error("Failed to poll file statuses:", error)
      }
    }, 1000) // Poll every second

    return () => clearInterval(pollInterval)
  }, [isPolling, files])

  const uploadFiles = useCallback(async (fileList: FileList) => {
    const newFiles: FileItem[] = []

    // Create file records immediately for UI feedback
    Array.from(fileList).forEach((file) => {
      const newFile: FileItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        status: "uploading",
        progress: 0,
        uploadedAt: new Date(),
        type: file.type || "application/octet-stream",
      }
      newFiles.push(newFile)
    })

    setFiles((prev) => [...prev, ...newFiles])
    setIsPolling(true)

    // Upload files to API
    for (let i = 0; i < newFiles.length; i++) {
      const file = fileList[i]
      const fileRecord = newFiles[i]

      try {
        const response = await apiClient.uploadFile(file)

        // Update with real file ID from API
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileRecord.id
              ? {
                  ...f,
                  id: response.fileId,
                  status: "processing",
                  progress: 0,
                }
              : f,
          ),
        )
      } catch (error) {
        console.error("Upload failed:", error)
        setFiles((prev) => prev.map((f) => (f.id === fileRecord.id ? { ...f, status: "error", progress: 0 } : f)))
      }
    }
  }, [])

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await apiClient.deleteFile(fileId)
      setFiles((prev) => prev.filter((file) => file.id !== fileId))
    } catch (error) {
      console.error("Delete failed:", error)
      throw error
    }
  }, [])

  const reprocessFile = useCallback(async (fileId: string) => {
    try {
      await apiClient.processFile(fileId, "reprocess")
      setFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, status: "processing", progress: 0 } : file)),
      )
      setIsPolling(true)
    } catch (error) {
      console.error("Reprocess failed:", error)
      throw error
    }
  }, [])

  const cancelProcessing = useCallback(async (fileId: string) => {
    try {
      await apiClient.processFile(fileId, "cancel")
      setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, status: "error", progress: 0 } : file)))
    } catch (error) {
      console.error("Cancel failed:", error)
      throw error
    }
  }, [])

  return {
    files,
    uploadFiles,
    deleteFile,
    reprocessFile,
    cancelProcessing,
    isPolling,
  }
}

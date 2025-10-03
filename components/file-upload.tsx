"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, File, Trash2, Download, FileText, ImageIcon, Video, Music, Archive } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface FileItem {
  id: string
  name: string
  url: string
  size: number
  type: string
  created_at: string
}

interface FileUploadProps {
  projectId?: string
  taskId?: string
  files: FileItem[]
  title: string
}

const FILE_ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  text: FileText,
  application: Archive,
  default: File,
}

const getFileIcon = (type: string) => {
  const category = type.split("/")[0]
  return FILE_ICONS[category as keyof typeof FILE_ICONS] || FILE_ICONS.default
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileUpload({ projectId, taskId, files, title }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    Array.from(selectedFiles).forEach((file) => {
      uploadFile(file)
    })
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (projectId) formData.append("projectId", projectId)
      if (taskId) formData.append("taskId", taskId)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteFile = async (fileId: string, url: string, fileName: string) => {
    try {
      const response = await fetch("/api/files/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId, url }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Delete failed")
      }

      toast({
        title: "File deleted",
        description: `${fileName} has been deleted successfully.`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <File className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant="secondary">{files.length}</Badge>
        </div>
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">Drag and drop files here, or click to select files</p>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline">
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <p className="text-xs text-muted-foreground mt-2">Maximum file size: 10MB</p>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Uploading...</p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No files yet</h4>
            <p className="text-muted-foreground">
              Upload files to attach them to this {projectId ? "project" : "task"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type)

            return (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{file.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => window.open(file.url, "_blank")}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFile(file.id, file.url, file.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

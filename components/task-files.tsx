"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  File,
  Upload,
  Trash2,
  Download,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FileItem {
  id: string
  name: string
  url: string
  size: number
  type: string
  created_at: string
}

interface TaskFilesProps {
  taskId: string
  files: FileItem[]
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

export function TaskFiles({ taskId, files }: TaskFilesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("taskId", taskId)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }
      }

      toast({
        title: "Files uploaded",
        description: "Files have been uploaded successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ""
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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 p-0 h-auto">
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <File className="h-4 w-4" />
          <span className="text-sm">Files</span>
          {files.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {files.length}
            </Badge>
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3">
        <div className="space-y-3 pl-6">
          {/* Upload Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
              disabled={uploading}
              onClick={() => document.getElementById(`file-input-${taskId}`)?.click()}
            >
              <Upload className="h-3 w-3" />
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
            <input id={`file-input-${taskId}`} type="file" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          {/* File List */}
          {files.map((file) => {
            const FileIcon = getFileIcon(file.type)

            return (
              <Card key={file.id} className="bg-muted/30">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => deleteFile(file.id, file.url, file.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

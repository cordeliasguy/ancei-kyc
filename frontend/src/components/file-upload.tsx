import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, File, Trash2, Loader2, Sparkles } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  content?: string
}

interface FileUploadProps {
  clientId: string
  files: UploadedFile[]
  onFilesChange: (files: UploadedFile[]) => void
  onParseFiles: (files: UploadedFile[]) => Promise<unknown>
}

export function FileUpload({
  clientId,
  files,
  onFilesChange,
  onParseFiles
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      setUploadProgress(0)

      const newFiles: UploadedFile[] = []

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]

        // Simulate upload progress
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100)

        // Read file content for text files
        let content = ''
        if (
          file.type.includes('text') ||
          file.type.includes('pdf') ||
          file.type.includes('document')
        ) {
          try {
            content = await readFileContent(file)
          } catch (error) {
            console.error('Error reading file:', error)
          }
        }

        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          content
        }

        newFiles.push(uploadedFile)
      }

      const updatedFiles = [...files, ...newFiles]
      onFilesChange(updatedFiles)

      setUploading(false)
      setUploadProgress(0)
    },
    [files, onFilesChange]
  )

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId)
    onFilesChange(updatedFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    )
  }

  const handleParseFiles = async () => {
    if (files.length === 0) return

    setParsing(true)
    try {
      await onParseFiles(files)
    } catch (error) {
      console.error('Error parsing files:', error)
    } finally {
      setParsing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Document Upload
        </CardTitle>
        <CardDescription>
          Upload client documents (PDF, Word, images, etc.) to automatically
          extract KYC information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Drag & drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF, Word, images, text files (max 10MB each)
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading files...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}

        {/* AI Parse Button */}
        {files.length > 0 && (
          <div className="flex justify-center">
            <Button
              onClick={handleParseFiles}
              disabled={parsing}
              className="flex items-center gap-2 cursor-pointer"
            >
              {parsing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {parsing ? 'Parsing Documents...' : 'Parse with AI'}
            </Button>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Files ({files.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className="size-5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <Badge variant="outline" className="text-xs">
                          {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                        <span>
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

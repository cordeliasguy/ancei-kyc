import { FileText, ImageIcon, File } from 'lucide-react'

export const getFileIcon = (type: string) => {
  const lower = type.toLowerCase()

  if (lower.includes('pdf')) {
    return <FileText className="size-4 text-red-600" />
  } else if (lower.startsWith('image/')) {
    return <ImageIcon className="size-4 text-green-600" />
  } else {
    return <File className="size-4 text-gray-600" />
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)

  return `${value.toFixed(2)} ${units[i]}`
}

export const openOrDownloadFile = async (url: string, filename?: string) => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch file')

    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    // check MIME type to decide
    const previewableTypes = [
      'application/pdf',
      'image/',
      'text/',
      'audio/',
      'video/'
    ]

    const isPreviewable = previewableTypes.some(type =>
      blob.type.startsWith(type)
    )

    if (isPreviewable) {
      // Open in new tab
      window.open(blobUrl, '_blank')
    } else {
      // Trigger download
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || url.split('/').pop() || 'download'
      document.body.appendChild(link)
      link.click()
      link.remove()
    }

    // cleanup
    window.URL.revokeObjectURL(blobUrl)
  } catch (err) {
    console.error('Open/Download failed', err)
  }
}

export const deepCompare = (obj1: unknown, obj2: unknown): boolean => {
  // Check if both parameters are objects
  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return obj1 === obj2
  }

  // Get the keys of each object
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  // Check if the number of keys is the same
  if (keys1.length !== keys2.length) {
    return false
  }

  // Iterate through keys and recursively compare values
  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      !deepCompare(
        obj1[key as keyof typeof obj1],
        obj2[key as keyof typeof obj2]
      )
    ) {
      return false
    }
  }

  // If all checks passed, the objects are deeply equal
  return true
}

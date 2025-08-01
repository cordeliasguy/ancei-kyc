import type React from 'react'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RotateCcw, Check } from 'lucide-react'

interface SignaturePadProps {
  onSignature: (signature: string) => void
  signerName: string
  signerRole: string
  width?: number
  height?: number
}

export function SignaturePad({
  onSignature,
  signerName,
  signerRole,
  width = 400,
  height = 200
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Fill with white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }, [width, height])

  const getEventPos = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    if ('touches' in event) {
      // Touch event
      const touch = event.touches[0] || event.changedTouches[0]
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      }
    } else {
      // Mouse event
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    }
  }

  const startDrawing = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault()
    setIsDrawing(true)
    const pos = getEventPos(event)
    setLastPoint(pos)
  }

  const draw = (
    event:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault()
    if (!isDrawing || !lastPoint) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const currentPos = getEventPos(event)

    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(currentPos.x, currentPos.y)
    ctx.stroke()

    setLastPoint(currentPos)
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPoint(null)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    const dataURL = canvas.toDataURL('image/png')
    onSignature(dataURL)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Signature</CardTitle>
        <CardDescription>
          Please sign below to confirm your review and approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-600">
            Signer Information
          </Label>
          <div className="mt-1">
            <p className="font-semibold">{signerName}</p>
            <p className="text-sm text-gray-600">{signerRole}</p>
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
          <canvas
            ref={canvasRef}
            className="border border-gray-200 rounded cursor-crosshair touch-none w-full"
            style={{ maxWidth: '100%', height: 'auto' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <p className="text-xs text-gray-500 mt-2 text-center">
            Sign above using your mouse or finger
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex-1 bg-transparent"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={saveSignature}
            disabled={!hasSignature}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Sign & Approve
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          By signing, you confirm that you have reviewed all information and
          approve this document.
        </div>
      </CardContent>
    </Card>
  )
}

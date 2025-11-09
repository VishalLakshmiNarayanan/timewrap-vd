"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, RefreshCw, Check, Wand2 } from "lucide-react"

interface ImageCartoonizerProps {
  onImageProcessed: (imageDataUrl: string) => void
  onSkip: () => void
}

export function ImageCartoonizer({ onImageProcessed, onSkip }: ImageCartoonizerProps) {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [cartoonImage, setCartoonImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const cartoonizeImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    // Set canvas size to match image
    const maxSize = 512
    let width = img.width
    let height = img.height

    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }
    }

    canvas.width = width
    canvas.height = height

    // Draw original image
    ctx.drawImage(img, 0, 0, width, height)

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Step 1: Bilateral filter effect (simplify colors)
    const levels = 8 // Color quantization levels
    const step = Math.floor(256 / levels)

    for (let i = 0; i < data.length; i += 4) {
      // Quantize colors (posterization effect)
      data[i] = Math.floor(data[i] / step) * step // R
      data[i + 1] = Math.floor(data[i + 1] / step) * step // G
      data[i + 2] = Math.floor(data[i + 2] / step) * step // B
    }

    // Step 2: Enhance contrast and saturation
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Calculate HSL
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const l = (max + min) / 2

      // Increase contrast
      const contrast = 1.3
      data[i] = Math.min(255, Math.max(0, ((r - 128) * contrast) + 128))
      data[i + 1] = Math.min(255, Math.max(0, ((g - 128) * contrast) + 128))
      data[i + 2] = Math.min(255, Math.max(0, ((b - 128) * contrast) + 128))

      // Boost saturation
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      const saturation = 1.4
      data[i] = Math.min(255, Math.max(0, avg + (data[i] - avg) * saturation))
      data[i + 1] = Math.min(255, Math.max(0, avg + (data[i + 1] - avg) * saturation))
      data[i + 2] = Math.min(255, Math.max(0, avg + (data[i + 2] - avg) * saturation))
    }

    ctx.putImageData(imageData, 0, 0)

    // Step 3: Edge detection and darkening
    const edgeCanvas = document.createElement("canvas")
    edgeCanvas.width = width
    edgeCanvas.height = height
    const edgeCtx = edgeCanvas.getContext("2d")
    if (!edgeCtx) return

    const edges = ctx.getImageData(0, 0, width, height)
    const edgeData = edges.data

    // Simple Sobel edge detection
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4

        // Get surrounding pixels
        const gx = (
          -1 * data[((y - 1) * width + (x - 1)) * 4] +
          1 * data[((y - 1) * width + (x + 1)) * 4] +
          -2 * data[(y * width + (x - 1)) * 4] +
          2 * data[(y * width + (x + 1)) * 4] +
          -1 * data[((y + 1) * width + (x - 1)) * 4] +
          1 * data[((y + 1) * width + (x + 1)) * 4]
        )

        const gy = (
          -1 * data[((y - 1) * width + (x - 1)) * 4] +
          -2 * data[((y - 1) * width + x) * 4] +
          -1 * data[((y - 1) * width + (x + 1)) * 4] +
          1 * data[((y + 1) * width + (x - 1)) * 4] +
          2 * data[((y + 1) * width + x) * 4] +
          1 * data[((y + 1) * width + (x + 1)) * 4]
        )

        const edge = Math.sqrt(gx * gx + gy * gy)

        // If strong edge, darken the pixel
        if (edge > 30) {
          edgeData[idx] = Math.max(0, data[idx] - 100)
          edgeData[idx + 1] = Math.max(0, data[idx + 1] - 100)
          edgeData[idx + 2] = Math.max(0, data[idx + 2] - 100)
        } else {
          edgeData[idx] = data[idx]
          edgeData[idx + 1] = data[idx + 1]
          edgeData[idx + 2] = data[idx + 2]
        }
      }
    }

    ctx.putImageData(edges, 0, 0)

    // Convert to data URL
    const cartoonDataUrl = canvas.toDataURL("image/png")
    setCartoonImage(cartoonDataUrl)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string
      setOriginalImage(imageUrl)
      setCartoonImage(null)

      // Load and process image
      setIsProcessing(true)
      const img = new Image()
      img.onload = () => {
        cartoonizeImage(img)
        setIsProcessing(false)
      }
      img.src = imageUrl
    }
    reader.readAsDataURL(file)
  }

  const handleReselect = () => {
    setOriginalImage(null)
    setCartoonImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleConfirm = () => {
    if (cartoonImage) {
      onImageProcessed(cartoonImage)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="relative w-full max-w-2xl mx-4 p-8 bg-gradient-to-br from-background via-background to-amber-950/20 border-2 border-amber-500/30 shadow-2xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
              Upload Avatar Image
            </h2>
            <p className="text-muted-foreground">
              Upload a photo and we&apos;ll convert it into a cartoon avatar
            </p>
          </div>

          {/* Upload or Preview */}
          {!originalImage ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-500/50 rounded-lg p-12 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all duration-300"
              >
                <Upload className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                <p className="text-lg font-semibold mb-2">Click to upload image</p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, or GIF (max 5MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-center">Original</p>
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-48 object-cover rounded-lg border-2 border-border"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-2 text-center">Cartoon</p>
                  {isProcessing ? (
                    <div className="w-full h-48 flex items-center justify-center bg-muted rounded-lg border-2 border-border">
                      <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
                    </div>
                  ) : cartoonImage ? (
                    <img
                      src={cartoonImage}
                      alt="Cartoon"
                      className="w-full h-48 object-cover rounded-lg border-2 border-amber-500 shadow-lg"
                    />
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleReselect}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Different Image
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!cartoonImage}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Use This Avatar
                </Button>
              </div>
            </div>
          )}

          {/* Skip Option */}
          <div className="text-center">
            <Button
              onClick={onSkip}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </Card>
    </div>
  )
}

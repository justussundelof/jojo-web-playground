'use client'

import { useState, useRef, useEffect } from 'react'

interface ImageFile {
  id: string
  file: File
  preview: string
  isExisting?: boolean
  existingUrl?: string
}

interface ImageUploadMultipleProps {
  onImagesChange: (files: File[]) => void
  existingImages?: string[] // URLs of existing images
  maxImages?: number
}

export default function ImageUploadMultiple({
  onImagesChange,
  existingImages = [],
  maxImages = 8,
}: ImageUploadMultipleProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Counter for auto-generated filenames
  const [photoCounter, setPhotoCounter] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('jojo-photo-counter')
      return saved ? parseInt(saved) : 1
    }
    return 1
  })

  // Initialize with existing images
  useEffect(() => {
    if (existingImages.length > 0 && images.length === 0) {
      const existingImageFiles: ImageFile[] = existingImages.map((url, index) => ({
        id: `existing-${index}`,
        file: new File([], 'existing', { type: 'image/jpeg' }), // Dummy file
        preview: url,
        isExisting: true,
        existingUrl: url,
      }))
      setImages(existingImageFiles)
    }
  }, [existingImages])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      })
      setStream(mediaStream)
      setIsCapturing(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Camera error:', error)
      alert('Could not access camera. Please check permissions.')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsCapturing(false)
  }

  // Switch camera
  const switchCamera = () => {
    stopCamera()
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
    setTimeout(startCamera, 100)
  }

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = Date.now()
          const filename = `JOJO${String(photoCounter).padStart(4, '0')}-${timestamp}.jpg`
          const file = new File([blob], filename, { type: 'image/jpeg' })

          const newImage: ImageFile = {
            id: `${timestamp}`,
            file,
            preview: URL.createObjectURL(blob),
          }

          const updatedImages = [...images, newImage]
          setImages(updatedImages)
          setPhotoCounter(photoCounter + 1)
          localStorage.setItem('jojo-photo-counter', String(photoCounter + 1))

          // Notify parent of new files
          const newFiles = updatedImages.filter((img) => !img.isExisting).map((img) => img.file)
          onImagesChange(newFiles)

          stopCamera()
        }
      }, 'image/jpeg')
    }
  }

  // Handle file upload from file explorer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    const newImages: ImageFile[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
    }))

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)

    // Notify parent of new files
    const newFiles = updatedImages.filter((img) => !img.isExisting).map((img) => img.file)
    onImagesChange(newFiles)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove image
  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id)
    setImages(updatedImages)

    // Notify parent of new files
    const newFiles = updatedImages.filter((img) => !img.isExisting).map((img) => img.file)
    onImagesChange(newFiles)
  }

  // Move image up/down
  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= images.length) return

    const updatedImages = [...images]
    const temp = updatedImages[index]
    updatedImages[index] = updatedImages[newIndex]
    updatedImages[newIndex] = temp
    setImages(updatedImages)

    // Notify parent of new files
    const newFiles = updatedImages.filter((img) => !img.isExisting).map((img) => img.file)
    onImagesChange(newFiles)
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {/* Camera/Upload Controls */}
      {!isCapturing && canAddMore && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={startCamera}
            className="flex-1 px-4 py-3 border border-black hover:bg-black hover:text-white transition-colors"
          >
            📷 TAKE PHOTO
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 px-4 py-3 border border-black hover:bg-black hover:text-white transition-colors"
          >
            📁 UPLOAD FROM DEVICE
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera View */}
      {isCapturing && (
        <div className="relative aspect-[3/4] bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Camera Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-white text-black border border-black"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-black"
            />
            <button
              type="button"
              onClick={switchCamera}
              className="px-4 py-2 bg-white text-black border border-black"
            >
              🔄 SWITCH
            </button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="text-sm mb-2 opacity-60">
            IMAGES ({images.length}/{maxImages})
          </div>
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div key={image.id} className="relative aspect-[3/4] border border-black">
                <img
                  src={image.preview}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Image Controls */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'up')}
                      className="w-6 h-6 bg-white border border-black text-xs flex items-center justify-center"
                      title="Move up"
                    >
                      ↑
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, 'down')}
                      className="w-6 h-6 bg-white border border-black text-xs flex items-center justify-center"
                      title="Move down"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="w-6 h-6 bg-red-600 text-white text-xs flex items-center justify-center"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>

                {/* Primary badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black text-white text-xs">
                    PRIMARY
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No images state */}
      {images.length === 0 && !isCapturing && (
        <div className="aspect-[3/4] border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center opacity-60">
            <p className="text-sm">No images yet</p>
            <p className="text-xs mt-1">Take a photo or upload from device</p>
          </div>
        </div>
      )}
    </div>
  )
}

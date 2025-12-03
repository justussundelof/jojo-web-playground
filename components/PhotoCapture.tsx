'use client'

import { useRef, useState } from 'react'

interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void
  currentImage?: string
}

export default function PhotoCapture({ onPhotoCapture, currentImage }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Use back camera on mobile
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      alert('Could not access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const context = canvas.getContext('2d')
      if (context) {
        context.drawImage(video, 0, 0)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `product-${Date.now()}.jpg`, {
              type: 'image/jpeg',
            })
            const imageUrl = URL.createObjectURL(blob)
            setCapturedImage(imageUrl)
            onPhotoCapture(file)
            stopCamera()
          }
        }, 'image/jpeg', 0.9)
      }
    }
  }

  const retake = () => {
    setCapturedImage(null)
    startCamera()
  }

  const displayImage = capturedImage || currentImage

  return (
    <div>
      <div className="mb-4">
        {!isCameraActive && !displayImage && (
          <div className="aspect-[3/4] border border-black flex items-center justify-center bg-gray-50">
            <button
              type="button"
              onClick={startCamera}
              className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors"
            >
              TAKE PHOTO
            </button>
          </div>
        )}

        {isCameraActive && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-[3/4] object-cover border border-black"
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                CAPTURE
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {displayImage && !isCameraActive && (
          <div>
            <img
              src={displayImage}
              alt="Product"
              className="w-full aspect-[3/4] object-cover border border-black mb-4"
            />
            <button
              type="button"
              onClick={retake}
              className="w-full px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors"
            >
              RETAKE PHOTO
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

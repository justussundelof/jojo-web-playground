'use client'

import { useRef, useState, useEffect } from 'react'

interface PhotoCaptureProps {
  onPhotoCapture: (file: File) => void
  currentImage?: string
}

export default function PhotoCapture({ onPhotoCapture, currentImage }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment')
  const [flash, setFlash] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(() => {
    // Load counter from localStorage
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('photoIndex') || '1', 10)
    }
    return 1
  })

  // Start camera
  const startCamera = async (facing: 'user' | 'environment' = cameraFacing) => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }

        setStream(mediaStream)
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Camera error: ${errorMessage}. Please allow camera access.`)
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  // Switch camera
  const switchCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user'
    setCameraFacing(newFacing)

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    await startCamera(newFacing)
  }

  // Live overlay rendering
  useEffect(() => {
    if (!isCameraActive) return

    let animationFrame: number

    const renderOverlay = () => {
      const canvas = overlayCanvasRef.current
      const video = videoRef.current

      if (!canvas || !video || video.videoWidth === 0) {
        animationFrame = requestAnimationFrame(renderOverlay)
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Timestamp
      const timestamp = new Date().toLocaleString()
      ctx.font = `${canvas.width * 0.035}px Sans-Serif`
      ctx.fillStyle = 'white'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'bottom'
      ctx.shadowColor = 'rgba(0,0,0,0.7)'
      ctx.shadowBlur = 4
      ctx.fillText(timestamp, canvas.width - 20, canvas.height - 20)

      // Counter (JOJOxxxx)
      const indexString = String(photoIndex).padStart(4, '0')
      ctx.textAlign = 'left'
      ctx.fillText(`JOJO${indexString}`, 20, canvas.height - 20)

      animationFrame = requestAnimationFrame(renderOverlay)
    }

    renderOverlay()
    return () => cancelAnimationFrame(animationFrame)
  }, [isCameraActive, photoIndex])

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !captureCanvasRef.current) return

    const video = videoRef.current
    const canvas = captureCanvasRef.current

    // Make sure video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError('Camera not ready. Please wait a moment and try again.')
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Flash effect
    setFlash(true)
    setTimeout(() => setFlash(false), 150)

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Timestamp
    const timestamp = new Date().toLocaleString()
    ctx.font = `${canvas.width * 0.035}px Sans-Serif`
    ctx.fillStyle = 'white'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.shadowColor = 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = 4
    ctx.fillText(timestamp, canvas.width - 20, canvas.height - 20)

    // Counter (JOJOxxxx)
    const indexString = String(photoIndex).padStart(4, '0')
    ctx.textAlign = 'left'
    ctx.fillText(`JOJO${indexString}`, 20, canvas.height - 20)

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `JOJO${indexString}-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        })
        const imageUrl = URL.createObjectURL(blob)
        setCapturedImage(imageUrl)
        onPhotoCapture(file)
        stopCamera()

        // Increment and save counter
        const newIndex = photoIndex + 1
        setPhotoIndex(newIndex)
        if (typeof window !== 'undefined') {
          localStorage.setItem('photoIndex', String(newIndex))
        }
      }
    }, 'image/jpeg', 0.95)
  }

  // Retake photo
  const retake = () => {
    setCapturedImage(null)
    setError(null)
    startCamera()
  }

  const displayImage = capturedImage || currentImage

  return (
    <div>
      {/* Flash effect */}
      {flash && (
        <div className="fixed inset-0 bg-white opacity-90 pointer-events-none z-50" />
      )}

      <div className="mb-4">
        {/* Error message */}
        {error && (
          <div className="mb-4 border border-red-600 px-4 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Initial state - Take photo button */}
        {!isCameraActive && !displayImage && (
          <div className="aspect-[3/4] border border-black flex items-center justify-center bg-gray-50">
            <button
              type="button"
              onClick={() => startCamera()}
              className="px-6 py-3 border border-black hover:bg-black hover:text-white transition-colors"
            >
              TAKE PHOTO
            </button>
          </div>
        )}

        {/* Camera active - Show video with overlay */}
        {isCameraActive && (
          <div className="relative">
            {/* Video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[3/4] object-cover border border-black bg-black"
            />

            {/* Live overlay */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Camera switch button */}
            <button
              type="button"
              onClick={switchCamera}
              className="absolute top-4 right-4 px-3 py-2 bg-black/70 text-white text-xs hover:bg-black transition-colors"
            >
              SWITCH
            </button>

            {/* Capture controls */}
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

        {/* Captured image preview */}
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

      {/* Hidden canvas for capture */}
      <canvas ref={captureCanvasRef} className="hidden" />
    </div>
  )
}

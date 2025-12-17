"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CameraIcon,
  Cross1Icon,
  FileIcon,
} from "@radix-ui/react-icons";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isExisting?: boolean;
  existingUrl?: string;
}

interface ImageUploadMultipleProps {
  onImagesChange: (files: File[]) => void;
  onOrderChange?: (imageUrls: string[]) => void; // Called when image order changes
  existingImages?: string[]; // URLs of existing images
  maxImages?: number;
}

export default function ImageUploadMultiple({
  onImagesChange,
  onOrderChange,
  existingImages = [],
  maxImages = 8,
}: ImageUploadMultipleProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [isConverting, setIsConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Counter for auto-generated filenames
  const [photoCounter, setPhotoCounter] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jojo-photo-counter");
      return saved ? parseInt(saved) : 1;
    }
    return 1;
  });

  // Initialize with existing images - runs when existingImages prop changes
  useEffect(() => {
    if (existingImages.length > 0) {
      const existingImageFiles: ImageFile[] = existingImages.map(
        (url, index) => ({
          id: `existing-${index}`,
          file: new File([], "existing", { type: "image/jpeg" }),
          preview: url,
          isExisting: true,
          existingUrl: url,
        })
      );

      setImages(existingImageFiles);

      if (onOrderChange) {
        onOrderChange(existingImages);
      }
      return;
    }

    if (existingImages.length === 0 && images.length > 0) {
      setImages([]);
    }
  }, [existingImages, images.length, onOrderChange]);

  // Set video source when stream is available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      setIsCapturing(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Could not access camera. Please check permissions.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCapturing(false);
  };

  // Switch camera
  const switchCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(startCamera, 100);
  };

  // Helper to notify parent of changes
  const notifyParent = (updatedImages: ImageFile[]) => {
    // Notify about new files
    const newFiles = updatedImages
      .filter((img) => !img.isExisting)
      .map((img) => img.file);
    onImagesChange(newFiles);

    // Notify about image order (all images)
    if (onOrderChange) {
      const imageUrls = updatedImages.map((img) =>
        img.isExisting ? img.existingUrl! : img.preview
      );
      onOrderChange(imageUrls);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const timestamp = Date.now();
          const filename = `JOJO${String(photoCounter).padStart(
            4,
            "0"
          )}-${timestamp}.jpg`;
          const file = new File([blob], filename, { type: "image/jpeg" });

          const newImage: ImageFile = {
            id: `${timestamp}`,
            file,
            preview: URL.createObjectURL(blob),
          };

          const updatedImages = [...images, newImage];
          setImages(updatedImages);
          setPhotoCounter(photoCounter + 1);
          localStorage.setItem("jojo-photo-counter", String(photoCounter + 1));

          // Notify parent
          notifyParent(updatedImages);

          stopCamera();
        }
      }, "image/jpeg");
    }
  };

  // Convert HEIC to JPEG
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    try {
      // Check if file is HEIC/HEIF
      const isHeic =
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");

      if (!isHeic) return file;

      setConversionError(null);
      setIsConverting(true);

      // Dynamically import heic2any (only on client)
      const heic2any = (await import("heic2any")).default;

      // Convert HEIC to JPEG
      const convertedBlob = (await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.95,
      })) as Blob;

      // Create new File object
      const convertedFile = new File(
        [convertedBlob],
        file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"),
        { type: "image/jpeg" }
      );

      setIsConverting(false);
      return convertedFile;
    } catch (error) {
      console.error("HEIC conversion failed:", error);
      setIsConverting(false);
      setConversionError(
        "Failed to convert HEIC image. Please try a different file."
      );
      throw error;
    }
  };

  // Handle file upload from file explorer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      setConversionError(null);

      // Process each file (convert HEIC if needed)
      const processedFiles: File[] = [];
      for (const file of files) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          continue;
        }

        // Convert HEIC if needed
        const processedFile = await convertHeicToJpeg(file);
        processedFiles.push(processedFile);
      }

      // Create image objects
      const newImages: ImageFile[] = processedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        preview: URL.createObjectURL(file),
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Notify parent
      notifyParent(updatedImages);
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    setImages(updatedImages);

    // Notify parent
    notifyParent(updatedImages);
  };

  // Move image up/down
  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[newIndex];
    updatedImages[newIndex] = temp;
    setImages(updatedImages);

    // Notify parent
    notifyParent(updatedImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3 ">
      {/* Camera/Upload Controls */}
      {!isCapturing && canAddMore && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={startCamera}
            className="w-full "
          >
            <CameraIcon /> Open camera
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <FileIcon /> Upload from device
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Conversion Loading State */}
      {isConverting && (
        <div className="border border-black p-6 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <span className="font-serif-book text-sm">
              Converting HEIC image to JPEG...
            </span>
          </div>
        </div>
      )}

      {/* Conversion Error */}
      {conversionError && (
        <div className="border border-destructive p-4 bg-red-50 text-destructive">
          {conversionError}
        </div>
      )}

      {/* Camera View */}
      {isCapturing && (
        <div className="relative aspect-3/4 bg-foreground">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Camera Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
            <Button onClick={stopCamera} className="">
              CANCEL
            </Button>
            <button
              onClick={capturePhoto}
              className="w-16 h-16 rounded-full bg-background border-4 border-foreground"
            />
            <Button onClick={switchCamera} className="">
              🔄 SWITCH
            </Button>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <Label className="">
            IMAGES ({images.length}/{maxImages})
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {images.map((image, index) => (
              <div key={image.id} className="relative aspect-3/4] ">
                <img
                  src={image.preview}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Image Controls */}
                <div className="absolute top-2 right-2 flex gap-1">
                  {index > 0 && (
                    <Button
                      onClick={() => moveImage(index, "up")}
                      size="icon"
                      title="Move up"
                    >
                      <ArrowUpIcon />
                    </Button>
                  )}
                  {index < images.length - 1 && (
                    <Button
                      type="button"
                      onClick={() => moveImage(index, "down")}
                      size="icon"
                      title="Move down"
                    >
                      <ArrowDownIcon />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => removeImage(image.id)}
                    size="icon"
                    title="Remove"
                  >
                    <Cross1Icon />
                  </Button>
                </div>

                {/* Primary badge */}
                {index === 0 && (
                  <Badge className="absolute top-2 left-2 px-2 py-1 bg-black text-white text-xs">
                    PRIMARY
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No images state */}
      {images.length === 0 && !isCapturing && (
        <div className="aspect-square  border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center opacity-60">
            <p className="text-sm">No images yet</p>
            <p className="text-xs mt-1">Take a photo or upload from device</p>
          </div>
        </div>
      )}
    </div>
  );
}

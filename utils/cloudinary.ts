/**
 * Optimize Cloudinary image URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 */
export function optimizeCloudinaryImage(
  url: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | number
    crop?: 'fill' | 'fit' | 'scale' | 'crop'
    gravity?: 'auto' | 'face' | 'center'
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }

  const {
    width,
    height,
    quality = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options

  // Build transformation string
  const transformations = []

  if (width || height) {
    const dimensions = []
    if (width) dimensions.push(`w_${width}`)
    if (height) dimensions.push(`h_${height}`)
    dimensions.push(`c_${crop}`)
    if (gravity && crop === 'fill') dimensions.push(`g_${gravity}`)
    transformations.push(dimensions.join(','))
  }

  // Add quality
  transformations.push(`q_${quality}`)

  // Add format auto
  transformations.push('f_auto')

  const transformString = transformations.join('/')

  // Insert transformations into URL
  // Example: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg
  // Becomes: https://res.cloudinary.com/demo/image/upload/w_400,h_500,c_fill/q_auto/f_auto/v1234/sample.jpg
  return url.replace('/upload/', `/upload/${transformString}/`)
}

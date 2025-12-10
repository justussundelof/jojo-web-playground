'use client'

import type { ProductMeasurements, TopMeasurements, PantsMeasurements, SkirtMeasurements, DressMeasurements } from '@/types/database'

interface MeasurementFieldsProps {
  categoryName?: string | null
  measurements: ProductMeasurements | null | undefined
  onChange: (measurements: ProductMeasurements) => void
}

export default function MeasurementFields({
  categoryName,
  measurements,
  onChange,
}: MeasurementFieldsProps) {
  // Determine which fields to show based on category name
  const getMeasurementType = (): 'tops' | 'pants' | 'skirt' | 'dress' | null => {
    if (!categoryName) return null

    const lowerName = categoryName.toLowerCase()

    // Tops: Jacka, Tröja, Topp, Blus, Skjorta
    if (
      lowerName.includes('jacka') ||
      lowerName.includes('tröja') ||
      lowerName.includes('topp') ||
      lowerName.includes('blus') ||
      lowerName.includes('skjorta') ||
      lowerName.includes('jacket') ||
      lowerName.includes('sweater') ||
      lowerName.includes('top') ||
      lowerName.includes('blouse') ||
      lowerName.includes('shirt')
    ) {
      return 'tops'
    }

    // Pants: Byxor
    if (lowerName.includes('byxor') || lowerName.includes('pants') || lowerName.includes('trousers')) {
      return 'pants'
    }

    // Skirt: Kjol
    if (lowerName.includes('kjol') || lowerName.includes('skirt')) {
      return 'skirt'
    }

    // Dress: Klänning
    if (lowerName.includes('klänning') || lowerName.includes('dress')) {
      return 'dress'
    }

    return null
  }

  const measurementType = getMeasurementType()

  const handleChange = (field: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    onChange({
      ...(measurements || {}),
      [field]: numValue,
    })
  }

  if (!measurementType) {
    return (
      <div className="border-t border-black pt-6 mt-6">
        <h3 className="text-sm mb-3 opacity-60">MEASUREMENTS</h3>
        <p className="text-sm opacity-60">
          Select a clothing category to add measurements
        </p>
      </div>
    )
  }

  return (
    <div className="border-t border-black pt-6 mt-6">
      <h3 className="text-sm mb-4 opacity-60">MEASUREMENTS (cm)</h3>

      <div className="space-y-4">
        {/* Tops: Jacka, Tröja, Topp, Blus, Skjorta */}
        {measurementType === 'tops' && (
          <>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Axel till axel (Shoulder width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as TopMeasurements)?.shoulder_width || ''}
                onChange={(e) => handleChange('shoulder_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="42"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Bröstbredd / Armhåla till armhåla (Chest width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as TopMeasurements)?.chest_width || ''}
                onChange={(e) => handleChange('chest_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="52"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Ärmlängd (Sleeve length)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as TopMeasurements)?.sleeve_length || ''}
                onChange={(e) => handleChange('sleeve_length', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="64"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Plagglängd (Garment length)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as TopMeasurements)?.garment_length || ''}
                onChange={(e) => handleChange('garment_length', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="68"
              />
            </div>
          </>
        )}

        {/* Pants: Byxor */}
        {measurementType === 'pants' && (
          <>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Midjebredd (Waist width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as PantsMeasurements)?.waist_width || ''}
                onChange={(e) => handleChange('waist_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="40"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Höftbredd (Hip width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as PantsMeasurements)?.hip_width || ''}
                onChange={(e) => handleChange('hip_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Innerbenslängd (Inseam)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as PantsMeasurements)?.inseam || ''}
                onChange={(e) => handleChange('inseam', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="75"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Ytterbenslängd (Outseam)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as PantsMeasurements)?.outseam || ''}
                onChange={(e) => handleChange('outseam', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Grenhöjd (Rise)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as PantsMeasurements)?.rise || ''}
                onChange={(e) => handleChange('rise', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="28"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Benslut / Vidd nertill (Leg opening)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as PantsMeasurements)?.leg_opening || ''}
                onChange={(e) => handleChange('leg_opening', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="18"
              />
            </div>
          </>
        )}

        {/* Skirt: Kjol */}
        {measurementType === 'skirt' && (
          <>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Midjebredd (Waist width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as SkirtMeasurements)?.waist_width || ''}
                onChange={(e) => handleChange('waist_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="38"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Längd (Garment length)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as SkirtMeasurements)?.garment_length || ''}
                onChange={(e) => handleChange('garment_length', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="60"
              />
            </div>
          </>
        )}

        {/* Dress: Klänning */}
        {measurementType === 'dress' && (
          <>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Axel till axel (Shoulder width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as DressMeasurements)?.shoulder_width || ''}
                onChange={(e) => handleChange('shoulder_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="40"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Armhåla till armhåla (Chest width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as DressMeasurements)?.chest_width || ''}
                onChange={(e) => handleChange('chest_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="48"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Midjebredd (Waist width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as DressMeasurements)?.waist_width || ''}
                onChange={(e) => handleChange('waist_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="38"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Höftbredd (Hip width)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as DressMeasurements)?.hip_width || ''}
                onChange={(e) => handleChange('hip_width', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Plagglängd (Garment length)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as DressMeasurements)?.garment_length || ''}
                onChange={(e) => handleChange('garment_length', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="90"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Ärmlängd (Sleeve length - optional)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as DressMeasurements)?.sleeve_length || ''}
                onChange={(e) => handleChange('sleeve_length', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="60"
              />
            </div>
            <div>
              <label className="block text-xs mb-2 opacity-60">
                Slits (Slit length - optional)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="200"
                value={(measurements as DressMeasurements)?.slit_length || ''}
                onChange={(e) => handleChange('slit_length', e.target.value)}
                className="w-full px-4 py-2 border border-black focus:outline-none text-sm"
                placeholder="20"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

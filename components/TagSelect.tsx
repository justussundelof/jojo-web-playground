'use client'

import { useState } from 'react'
import type { Tag } from '@/types/database'

interface TagSelectProps {
  tags: Tag[]
  selectedTagId: string
  onChange: (tagId: string) => void
  onTagCreated: (newTag: Tag) => void
}

export default function TagSelect({
  tags,
  selectedTagId,
  onChange,
  onTagCreated,
}: TagSelectProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError('Tag name is required')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTagName.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create tag')
      }

      const newTag = await response.json()

      // Notify parent component of new tag
      onTagCreated(newTag)

      // Auto-select the newly created tag
      onChange(newTag.id.toString())

      // Close modal and reset
      setShowCreateModal(false)
      setNewTagName('')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value

    if (value === '__create_new__') {
      setShowCreateModal(true)
    } else {
      onChange(value)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setNewTagName('')
    setError(null)
  }

  return (
    <>
      <select
        value={selectedTagId}
        onChange={handleSelectChange}
        className="w-full px-4 py-3 border border-black focus:outline-none bg-white"
      >
        <option value="">Select tag</option>
        {tags.map((tag) => (
          <option key={tag.id} value={tag.id}>
            {tag.name}
          </option>
        ))}
        <option value="__create_new__" className="font-medium">
          + Skapa ny tagg
        </option>
      </select>

      {/* Create Tag Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white border-2 border-black max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-black px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg tracking-tight">Skapa ny tagg</h2>
              <button
                onClick={handleCloseModal}
                className="text-xl hover:opacity-50 transition-opacity leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {error && (
                <div className="mb-4 border border-red-600 px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 opacity-60">TAG NAME</label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateTag()
                    }
                  }}
                  className="w-full px-4 py-3 border border-black focus:outline-none"
                  placeholder="Vintage, Y2K, etc."
                  autoFocus
                  disabled={isCreating}
                />
              </div>

              <p className="text-xs opacity-60 mt-2">
                Exempel: Vintage, Sommar, Y2K
              </p>
            </div>

            {/* Actions */}
            <div className="border-t border-black px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={isCreating}
                className="px-6 py-2 border border-black hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleCreateTag}
                disabled={isCreating || !newTagName.trim()}
                className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {isCreating ? 'Skapar...' : 'Skapa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, X, FileText, Loader2, Download, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { deleteMenuDocuments, uploadMenuDocuments } from '@/app/admin/menu/actions'

interface DocumentItem {
  url: string
  title: string
}

interface UnifiedDocumentManagerProps {
  value: DocumentItem[]
  onChange: (documents: DocumentItem[]) => void
  onSave?: (documents: DocumentItem[]) => Promise<void>
  menuItemId: string
  maxFiles?: number
}

export function UnifiedDocumentManager({
  value = [],
  onChange,
  onSave,
  menuItemId,
  maxFiles = 5,
}: UnifiedDocumentManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    // Validate file types
    const invalidFiles = files.filter(file => file.type !== 'application/pdf')
    if (invalidFiles.length > 0) {
      alert(`Only PDF files are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    // Validate file sizes
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      alert(`Some files are too large. Maximum file size is 10MB. Large files: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    setUploading(true)
    try {
      const remainingSlots = Math.max(0, maxFiles - value.length)
      const filesToUpload = files.slice(0, remainingSlots)
      if (filesToUpload.length === 0) return

      const formData = new FormData()
      formData.append('menuItemId', menuItemId)
      filesToUpload.forEach(file => formData.append('files', file))

      const { urls } = await uploadMenuDocuments(formData)

      // Create document items with default titles based on filenames
      const newDocumentItems = urls.map(url => ({
        url,
        title: getFileName(url)
      }))

      const updatedDocuments = [...value, ...newDocumentItems].slice(0, maxFiles)
      onChange(updatedDocuments)
    } finally {
      setUploading(false)
    }
  }, [value, maxFiles, menuItemId, onChange])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      void handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return

    // Validate file types
    const invalidFiles = files.filter(file => file.type !== 'application/pdf')
    if (invalidFiles.length > 0) {
      alert(`Only PDF files are allowed. Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`)
      return
    }

    // Validate file sizes
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      alert(`Some files are too large. Maximum file size is 10MB. Large files: ${oversizedFiles.map(f => f.name).join(', ')}`)
      return
    }

    setUploading(true)
    try {
      const remainingSlots = Math.max(0, maxFiles - value.length)
      const filesToUpload = files.slice(0, remainingSlots)
      if (filesToUpload.length === 0) return

      const formData = new FormData()
      formData.append('menuItemId', menuItemId)
      filesToUpload.forEach(file => formData.append('files', file))

      const { urls } = await uploadMenuDocuments(formData)

      // Create document items with default titles based on filenames
      const newDocumentItems = urls.map(url => ({
        url,
        title: getFileName(url)
      }))

      const updatedDocuments = [...value, ...newDocumentItems].slice(0, maxFiles)
      onChange(updatedDocuments)
    } finally {
      setUploading(false)
    }
  }

  const removeDocument = async (index: number) => {
    const documentToDelete = value[index]
    if (!documentToDelete) return

    setDeletingIndex(index)
    try {
      await deleteMenuDocuments([documentToDelete.url])

      const updatedDocuments = value.filter((_, i) => i !== index)
      onChange(updatedDocuments)
    } finally {
      setDeletingIndex(null)
    }
  }

  const startEditingTitle = (index: number) => {
    setEditingIndex(index)
    setEditingTitle(value[index].title)
  }

  const saveTitle = async () => {
    if (editingIndex === null) return

    const updatedDocuments = value.map((doc, index) =>
      index === editingIndex ? { ...doc, title: editingTitle } : doc
    )

    // Update local state immediately
    onChange(updatedDocuments)

    // Save to database if onSave is provided
    if (onSave) {
      try {
        await onSave(updatedDocuments)
      } catch (error) {
        console.error('Failed to save document title:', error)
        // Revert local state on error
        onChange(value)
        return
      }
    }

    setEditingIndex(null)
    setEditingTitle('')
  }

  const cancelEditing = () => {
    setEditingIndex(null)
    setEditingTitle('')
  }

  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const parts = pathname.split('/')
      return parts[parts.length - 1]?.split('-').slice(2).join('-') || 'Document'
    } catch {
      return 'Document'
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-colors text-center',
          uploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
        )}
      >
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <h3 className="text-sm font-medium">Drag and drop PDF files here</h3>
          <p className="text-xs text-gray-600">or click to select files</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => { e.preventDefault(); fileInputRef.current?.click() }}
            disabled={uploading || value.length >= maxFiles}
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Choose PDFs
          </Button>
          <div className="text-xs text-gray-400">
            <p>Supports PDF files only. Max {maxFiles} documents, 10MB each.</p>
          </div>
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((document, index) => (
            <Card key={`${document.url}-${index}`} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 h-8 text-sm"
                          placeholder="Enter document title"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle()
                            if (e.key === 'Escape') cancelEditing()
                          }}
                          autoFocus
                        />
                        <Button size="sm" onClick={saveTitle} className="h-8 px-2">
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing} className="h-8 px-2">
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium truncate">
                          {document.title}
                        </p>
                        <p className="text-xs text-gray-500">PDF Document</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {editingIndex !== index && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditingTitle(index)}
                      className="h-8 w-8 p-0"
                      title="Edit title"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(document.url, '_blank')}
                    className="h-8 w-8 p-0"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void removeDocument(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    disabled={deletingIndex === index}
                    title="Delete"
                  >
                    {deletingIndex === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        {value.length} of {maxFiles} documents uploaded
      </div>
    </div>
  )
}
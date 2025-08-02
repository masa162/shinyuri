'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void
  maxFiles?: number
}

export default function ImageUpload({ onImagesChange, maxFiles = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const validateFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return 'JPG, PNG, GIF形式のファイルのみ対応しています'
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return 'ファイルサイズは5MB以下にしてください'
    }

    return null
  }

  const resizeImage = (file: File, maxWidth: number = 800): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const width = img.width * ratio
        const height = img.height * ratio

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          } else {
            resolve(file)
          }
        }, file.type, 0.9)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      const { error } = await supabase.storage
        .from('post-images')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    if (files.length === 0) return
    
    // Check total files limit
    if (imageUrls.length + files.length > maxFiles) {
      alert(`最大${maxFiles}枚まで投稿できます`)
      return
    }

    // Validate files
    for (const file of files) {
      const error = validateFile(file)
      if (error) {
        alert(error)
        return
      }
    }

    setUploading(true)

    try {
      const newImageUrls: string[] = []
      const newPreviewUrls: string[] = []

      for (const file of files) {
        // Create preview
        const previewUrl = URL.createObjectURL(file)
        newPreviewUrls.push(previewUrl)

        // Resize and upload
        const resizedFile = await resizeImage(file)
        const uploadedUrl = await uploadImage(resizedFile)
        
        if (uploadedUrl) {
          newImageUrls.push(uploadedUrl)
        }
      }

      const updatedImageUrls = [...imageUrls, ...newImageUrls]
      const updatedPreviewUrls = [...previewUrls, ...newPreviewUrls]

      setImageUrls(updatedImageUrls)
      setPreviewUrls(updatedPreviewUrls)
      onImagesChange(updatedImageUrls)

    } catch (error) {
      console.error('Error uploading images:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const updatedImageUrls = imageUrls.filter((_, i) => i !== index)
    const updatedPreviewUrls = previewUrls.filter((_, i) => i !== index)
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index])
    
    setImageUrls(updatedImageUrls)
    setPreviewUrls(updatedPreviewUrls)
    onImagesChange(updatedImageUrls)
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || imageUrls.length >= maxFiles}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span>アップロード中...</span>
          ) : (
            <span>
              📷 画像を選択 ({imageUrls.length}/{maxFiles})
            </span>
          )}
        </button>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
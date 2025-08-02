'use client'

import { useState } from 'react'
import { createPost } from '@/app/posts/actions'
import ImageUpload from './ImageUpload'

export default function PostForm() {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    
    // Add images data to form
    formData.append('images', JSON.stringify(images))
    
    try {
      await createPost(formData)
      // Reset form
      setContent('')
      setImages([])
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages)
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="border rounded-md p-2 min-h-[100px]"
        placeholder="いまどうしてる？"
        required
      />
      
      <ImageUpload onImagesChange={handleImagesChange} />
      
      <button 
        type="submit" 
        disabled={isSubmitting || !content.trim()}
        className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? '投稿中...' : '投稿する'}
      </button>
    </form>
  )
}
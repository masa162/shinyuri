'use client'

import { useState } from 'react'
import { createComment } from '@/app/posts/actions'

interface CommentFormProps {
  postId: number
  parentId?: number
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
}

export default function CommentForm({ 
  postId, 
  parentId, 
  onSuccess, 
  onCancel,
  placeholder = "コメントを入力..." 
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      await createComment(formData)
      setContent('')
      setAuthorName('')
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {/* Hidden fields for server action */}
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="authorName" value={authorName} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      
      <div className="flex gap-2">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="名前（任意）"
          className="flex-shrink-0 w-24 sm:w-32 border rounded px-2 py-1 text-sm"
          maxLength={50}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          className="flex-1 border rounded px-2 py-1 text-sm min-h-[60px] resize-none"
          maxLength={500}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '投稿中...' : (parentId ? '返信' : 'コメント')}
        </button>
      </div>
    </form>
  )
}
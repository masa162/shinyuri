'use client'

import { useState } from 'react'
import { likeComment } from '@/app/posts/actions'

interface CommentLikeButtonProps {
  commentId: number
  initialLikeCount: number
}

export default function CommentLikeButton({ commentId, initialLikeCount }: CommentLikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    try {
      const newCount = await likeComment(commentId)
      setLikeCount(newCount)
    } catch (error) {
      console.error('Failed to like comment:', error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isLiking}
      className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <span className="text-sm">❤️</span>
      <span className="text-xs">{likeCount}</span>
    </button>
  )
}
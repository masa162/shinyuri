'use client'

import { useState } from 'react'
import { likePost } from '@/app/posts/actions'

interface LikeButtonProps {
  postId: number
  initialLikeCount: number
}

export default function LikeButton({ postId, initialLikeCount }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    
    setIsLiking(true)
    try {
      const newCount = await likePost(postId)
      setLikeCount(newCount)
    } catch (error) {
      console.error('Failed to like post:', error)
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
      <span className="text-lg">❤️</span>
      <span className="text-sm">{likeCount}</span>
    </button>
  )
}
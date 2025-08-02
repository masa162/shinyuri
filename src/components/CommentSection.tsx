'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import CommentForm from './CommentForm'
import CommentLikeButton from './CommentLikeButton'

interface Comment {
  id: number
  content: string
  author_name: string | null
  like_count: number
  created_at: string
  parent_id: number | null
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: number
  initialComments: Comment[]
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [replyToId, setReplyToId] = useState<number | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)

  // コメントを階層構造に変換
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>()
    const rootComments: Comment[] = []

    // まず全てのコメントをマップに追加
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] })
    })

    // 親子関係を構築
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!
      
      if (comment.parent_id) {
        const parent = commentMap.get(comment.parent_id)
        if (parent) {
          parent.replies!.push(commentWithReplies)
        }
      } else {
        rootComments.push(commentWithReplies)
      }
    })

    return rootComments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  const organizedComments = organizeComments(comments)

  const refreshComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (data) {
      setComments(data)
    }
  }

  const handleCommentSuccess = () => {
    setShowCommentForm(false)
    setReplyToId(null)
    refreshComments()
  }

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`border-l-2 border-gray-100 pl-3 ${isReply ? 'ml-4 mt-2' : 'mb-3'}`}>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className="font-medium">
            {comment.author_name || '匿名'}
          </span>
          <span>•</span>
          <span>{new Date(comment.created_at).toLocaleDateString('ja-JP')}</span>
        </div>
        
        <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
            className="text-xs text-gray-500 hover:text-blue-500"
          >
            返信
          </button>
          <CommentLikeButton commentId={comment.id} initialLikeCount={comment.like_count} />
        </div>
      </div>

      {/* 返信フォーム */}
      {replyToId === comment.id && (
        <div className="mt-2 ml-4">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={handleCommentSuccess}
            onCancel={() => setReplyToId(null)}
            placeholder={`${comment.author_name || '匿名'}さんに返信...`}
          />
        </div>
      )}

      {/* 返信表示 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  )

  const commentCount = comments.length

  return (
    <div className="space-y-3">
      {/* コメント数と表示切り替えボタン */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          💬 コメント {commentCount}件 {isCollapsed ? '▼' : '▲'}
        </button>
        
        {!isCollapsed && (
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            {showCommentForm ? 'キャンセル' : 'コメント'}
          </button>
        )}
      </div>

      {/* コメント表示エリア */}
      {!isCollapsed && (
        <div className="space-y-2">
          {/* 新規コメントフォーム */}
          {showCommentForm && (
            <div className="mb-4">
              <CommentForm
                postId={postId}
                onSuccess={handleCommentSuccess}
                onCancel={() => setShowCommentForm(false)}
              />
            </div>
          )}

          {/* コメント一覧 */}
          {organizedComments.length > 0 ? (
            <div className="space-y-2">
              {organizedComments.map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">
              まだコメントがありません
            </p>
          )}
        </div>
      )}
    </div>
  )
}
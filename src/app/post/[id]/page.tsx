import { createClient } from '@/utils/supabase/client'
import LikeButton from '@/components/LikeButton'
import CommentSection from '@/components/CommentSection'
import ShareButtons from '@/components/ShareButtons'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = createClient()
  
  // 投稿を取得
  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !post) {
    notFound()
  }

  // コメントを取得
  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', post.id)
    .order('created_at', { ascending: true })

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            ← 新ゆりポストに戻る
          </Link>
        </div>

        {/* 投稿カード */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <p className="text-gray-800 mb-4 text-lg leading-relaxed">{post.content}</p>
          
          {/* 画像表示 */}
          {post.images && post.images.length > 0 && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {post.images.map((imageUrl: string, index: number) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Post image ${index + 1}`}
                  className="rounded-lg w-full h-auto max-h-96 object-cover"
                />
              ))}
            </div>
          )}
          
          {/* 投稿情報 */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>{new Date(post.created_at).toLocaleString('ja-JP')}</span>
            <LikeButton postId={post.id} initialLikeCount={post.like_count || 0} />
          </div>

          {/* SNSシェアボタン */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <ShareButtons 
              postId={post.id} 
              content={post.content}
              images={post.images}
            />
          </div>

          {/* コメント機能 */}
          <CommentSection 
            postId={post.id} 
            initialComments={comments || []}
          />
        </div>
      </div>
    </main>
  )
}

// メタデータ生成（SEO対応）
export async function generateMetadata({ params }: PageProps) {
  const supabase = createClient()
  
  const { data: post } = await supabase
    .from('posts')
    .select('content, created_at')
    .eq('id', params.id)
    .single()

  if (!post) {
    return {
      title: '投稿が見つかりません - 新ゆりポスト',
    }
  }

  const truncatedContent = post.content.length > 100 
    ? post.content.substring(0, 100) + '...' 
    : post.content

  return {
    title: `${truncatedContent} - 新ゆりポスト`,
    description: `新百合ヶ丘エリアの投稿: ${truncatedContent}`,
    openGraph: {
      title: `${truncatedContent} - 新ゆりポスト`,
      description: `新百合ヶ丘エリアの投稿: ${truncatedContent}`,
      type: 'article',
      publishedTime: post.created_at,
    },
    twitter: {
      card: 'summary',
      title: `${truncatedContent} - 新ゆりポスト`,
      description: `新百合ヶ丘エリアの投稿: ${truncatedContent}`,
    },
  }
}
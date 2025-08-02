import { createClient } from '@/utils/supabase/client'
import LikeButton from '@/components/LikeButton'
import PostForm from '@/components/PostForm'
import CommentSection from '@/components/CommentSection'
import ShareButtons from '@/components/ShareButtons'

export default async function Home() {
  const supabase = createClient()
  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  
  // 各投稿のコメントを取得
  const postsWithComments = await Promise.all(
    (posts || []).map(async (post) => {
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })
      
      return {
        ...post,
        comments: comments || []
      }
    })
  )

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">新ゆりポスト</h1>
      <p className="text-gray-600">新ゆりの『今』をキャッチ！</p>

      <div className="mt-8">
        <PostForm />
      </div>

      <div className="mt-8 w-full max-w-2xl">
        {postsWithComments?.map((post) => (
          <div key={post.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
            <p className="text-gray-800 mb-3">{post.content}</p>
            
            {/* Display images if any */}
            {post.images && post.images.length > 0 && (
              <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
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
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>{new Date(post.created_at).toLocaleDateString('ja-JP')}</span>
              <LikeButton postId={post.id} initialLikeCount={post.like_count || 0} />
            </div>

            {/* SNSシェアボタン */}
            <div className="mb-3 p-2 bg-gray-50 rounded">
              <ShareButtons 
                postId={post.id} 
                content={post.content}
                images={post.images}
              />
            </div>

            {/* コメント機能 */}
            <CommentSection 
              postId={post.id} 
              initialComments={post.comments}
            />
          </div>
        ))}
      </div>
    </main>
  )
}
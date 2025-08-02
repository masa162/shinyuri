'use server'

import { createClient } from '@/utils/supabase/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = createClient()

  const content = formData.get('content') as string
  const imagesJson = formData.get('images') as string
  const images = imagesJson ? JSON.parse(imagesJson) : []

  const { error } = await supabase
    .from('posts')
    .insert([
      { 
        content,
        images 
      },
    ])

  if (error) {
    // Handle error
    console.error(error)
    return
  }

  revalidatePath('/')
  redirect('/')
}

export async function likePost(postId: number): Promise<number> {
  const supabase = createClient()

  // いいね数を増加
  const { error } = await supabase
    .rpc('increment_like_count', { post_id: postId })

  if (error) {
    console.error('Failed to like post:', error)
    throw error
  }

  // 更新されたいいね数を取得
  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('like_count')
    .eq('id', postId)
    .single()

  if (fetchError) {
    console.error('Failed to fetch updated like count:', fetchError)
    throw fetchError
  }

  revalidatePath('/')
  return post.like_count
}

export async function createComment(formData: FormData) {
  const supabase = createClient()

  const postId = parseInt(formData.get('postId') as string)
  const content = formData.get('content') as string
  const authorName = formData.get('authorName') as string || null
  const parentId = formData.get('parentId') ? parseInt(formData.get('parentId') as string) : null

  const { error } = await supabase
    .from('comments')
    .insert([
      {
        post_id: postId,
        parent_id: parentId,
        content,
        author_name: authorName
      }
    ])

  if (error) {
    console.error('Failed to create comment:', error)
    throw new Error('Failed to create comment')
  }

  revalidatePath('/')
}

export async function likeComment(commentId: number): Promise<number> {
  const supabase = createClient()

  // いいね数を増加
  const { error } = await supabase
    .rpc('increment_comment_like_count', { comment_id: commentId })

  if (error) {
    console.error('Failed to like comment:', error)
    throw error
  }

  // 更新されたいいね数を取得
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('like_count')
    .eq('id', commentId)
    .single()

  if (fetchError) {
    console.error('Failed to fetch updated comment like count:', fetchError)
    throw fetchError
  }

  revalidatePath('/')
  return comment.like_count
}

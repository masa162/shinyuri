'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  postId: number
  content: string
  images?: string[]
}

export default function ShareButtons({ postId, content }: ShareButtonsProps) {
  const [showCopyMessage, setShowCopyMessage] = useState(false)

  // サイトのベースURL（本番環境では実際のドメインに変更）
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const postUrl = `${baseUrl}/post/${postId}`
  
  // 投稿内容を適切な長さにトリミング
  const trimContent = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  // Twitter(X)シェア
  const shareToTwitter = () => {
    const text = `${trimContent(content, 200)}\n\n#新百合ヶ丘 #新ゆりポスト`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
  }

  // LINEシェア
  const shareToLine = () => {
    const text = `${trimContent(content, 300)}\n\n${postUrl}`
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'width=500,height=500')
  }

  // Instagram用テキストコピー（直接投稿不可のため）
  const copyForInstagram = async () => {
    const text = `${content}\n\n📍新百合ヶ丘エリア\n#新百合ヶ丘 #新ゆりポスト #地域情報\n\n詳細: ${postUrl}`
    
    try {
      await navigator.clipboard.writeText(text)
      setShowCopyMessage(true)
      setTimeout(() => setShowCopyMessage(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      // フォールバック: テキストエリアを使用
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowCopyMessage(true)
      setTimeout(() => setShowCopyMessage(false), 2000)
    }
  }

  // URLをクリップボードにコピー
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setShowCopyMessage(true)
      setTimeout(() => setShowCopyMessage(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL: ', err)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">シェア:</span>
        
        {/* Twitter */}
        <button
          onClick={shareToTwitter}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-black text-white hover:bg-gray-800 transition-colors"
          title="Twitter(X)でシェア"
        >
          <span>𝕏</span>
          <span className="hidden sm:inline">Twitter</span>
        </button>

        {/* LINE */}
        <button
          onClick={shareToLine}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500 text-white hover:bg-green-600 transition-colors"
          title="LINEでシェア"
        >
          <span>💬</span>
          <span className="hidden sm:inline">LINE</span>
        </button>

        {/* Instagram */}
        <button
          onClick={copyForInstagram}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-colors"
          title="Instagram用テキストをコピー"
        >
          <span>📷</span>
          <span className="hidden sm:inline">Instagram</span>
        </button>

        {/* URL コピー */}
        <button
          onClick={copyUrl}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-500 text-white hover:bg-gray-600 transition-colors"
          title="URLをコピー"
        >
          <span>🔗</span>
          <span className="hidden sm:inline">URL</span>
        </button>
      </div>

      {/* コピー完了メッセージ */}
      {showCopyMessage && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-green-500 text-white text-xs rounded shadow-lg">
          コピーしました！
        </div>
      )}
    </div>
  )
}
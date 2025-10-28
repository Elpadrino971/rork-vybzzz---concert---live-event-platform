'use client'

import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  streamUrl: string
  isLive: boolean
}

export default function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && streamUrl) {
      // For AWS IVS, we would use the IVS Player
      // For now, we'll use a basic video player
      videoRef.current.src = streamUrl
      videoRef.current.load()
    }
  }, [streamUrl])

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      {isLive && (
        <div className="absolute top-4 left-4 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          EN DIRECT
        </div>
      )}

      <video
        ref={videoRef}
        controls
        autoPlay
        className="w-full h-full"
        playsInline
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isLive && (
              <div className="flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">DIRECT</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

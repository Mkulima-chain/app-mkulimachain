"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  audioUrl: string
  nftId: string
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  progress: number
  onProgressChange: (progress: number) => void
}

export function AudioPlayer({
  audioUrl,
  nftId,
  isPlaying,
  onPlay,
  onPause,
  progress,
  onProgressChange
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
      const progressPercent = (audio.currentTime / audio.duration) * 100
      onProgressChange(progressPercent)
    }

    const updateDuration = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", () => {
      onPause()
      setCurrentTime(0)
      onProgressChange(0)
    })

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [onPause, onProgressChange])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const togglePlayPause = () => {
    if (isPlaying) {
      onPause()
    } else {
      onPlay()
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = clickX / rect.width
    const newTime = percent * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
    onProgressChange(percent * 100)
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Play/Pause Button and Progress */}
      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlayPause}
          size="icon"
          className="h-12 w-12 rounded-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          {/* Progress Bar */}
          <div
            className="relative h-2 bg-[#004D73]/20 dark:bg-white/20 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="absolute h-full bg-[#3A8F4C] dark:bg-[#3A8F4C] rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#3A8F4C] dark:bg-[#3A8F4C] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-xs text-[#004D73] dark:text-white/70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-9 w-9 text-[#5A3E36] dark:text-white/90"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          {!isMuted && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-20 h-1 bg-[#004D73]/20 dark:bg-white/20 rounded-full appearance-none cursor-pointer accent-[#3A8F4C]"
            />
          )}
        </div>
      </div>
    </div>
  )
}


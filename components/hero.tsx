"use client";
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle } from "lucide-react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { ImageErrorBoundaryWrapper } from "@/components/ui/image-error-boundary"
import { motion } from "framer-motion"

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  return (
    <section className="relative bg-gray-50 overflow-hidden" role="banner" aria-label="Hero section">
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 text-center relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight">
            UnisonAI unifies recruiting, CRM & projects in one powerful platform
          </h1>
          <p className="mx-auto max-w-3xl text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 leading-relaxed">
            Advance your entire organization with intelligent 
            automation and AI-driven people analytics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-4">
            <Button 
              size="lg" 
              className="text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              Watch Video
            </Button>
          </div>
        </div>
      </motion.div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 md:pb-20 lg:pb-32 relative z-10 flex flex-col items-center">
        <ImageErrorBoundaryWrapper>
          <OptimizedImage
            src="/hero page find your next role1.png"
            alt="Find your next role preview - UnisonAI dashboard interface showing job matching and candidate profiles"
            width={1920}
            height={600}
            className="w-full max-w-7xl mx-auto rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg"
            priority
            draggable={false}
            fallbackSrc="/placeholder.svg"
            showLoadingState={true}
            validateImageExists={true}
            style={{
              width: "100%",
              maxWidth: "1920px",
              height: "auto",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </ImageErrorBoundaryWrapper>
      </div>
    </section>
  )
}
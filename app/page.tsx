"use client";

import { Hero } from "@/components/hero"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header-landing"
import { UniModules } from "@/components/uni-modules-landing"
import { Features } from "@/components/features-landing"
import Image from "next/image"
import { motion } from "framer-motion"

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      <Header />
      <main id="main-content">
        <Hero />
        <section 
          className="w-full py-8 px-4 sm:px-6 lg:px-8"
          aria-label="Product demonstration video"
        >
          <div className="max-w-7xl mx-auto">
            <video
              src="/Main_1.mp4"
              className="w-full h-auto rounded-lg shadow-lg"
              controls
              aria-label="UnisonAI platform demonstration video"
              preload="metadata"
            >
              <track kind="captions" srcLang="en" label="English captions" />
              Your browser does not support the video tag.
            </video>
          </div>
        </section>
        <Features />
        <UniModules />
        <section 
          className="w-full px-4 sm:px-6 lg:px-8 py-8"
          aria-label="Tools and pricing sections"
        >
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
            <motion.div
              id="tools"
              className="w-full flex justify-center scroll-mt-16"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <Image
                src="/tools (3).png"
                alt="Available tools and integrations for UnisonAI platform"
                width={1920}
                height={900}
                className="w-full h-auto object-contain rounded-lg"
                priority
              />
            </motion.div>
            <motion.div
              id="pricing"
              className="w-full flex justify-center scroll-mt-16"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <Image
                src="/price (2).png"
                alt="Pricing plans and options for UnisonAI platform"
                width={1920}
                height={900}
                className="w-full h-auto object-contain rounded-lg"
                priority
              />
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
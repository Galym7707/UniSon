"use client";

import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageErrorBoundaryWrapper } from "@/components/ui/image-error-boundary";
import { motion, easeInOut } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.15, duration: 0.6, ease: easeInOut },
  }),
};

export function Features() {
  return (
    <section 
      id="features" 
      className="bg-white py-12 md:py-16 lg:py-20"
      aria-label="Platform features"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-20">
        {/* Unified Digital Platform */}
        <motion.div
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={0}
        >
          <div className="space-y-4 lg:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
              Unified digital platform
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
              All-in-one business solution to manage people, projects, and documents. A single working environment that unites the entire team and creates a common information space.
            </p>
          </div>
          <div className="px-2">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
              <ImageErrorBoundaryWrapper>
                <OptimizedImage
                  src="/unified digital platform2.png"
                  alt="Project Overview Dashboard showing unified platform interface with team management and project tracking features"
                  width={1600}
                  height={1100}
                  className="w-full h-auto mx-auto rounded-lg shadow-lg"
                  priority
                  draggable={false}
                  fallbackSrc="/placeholder.svg"
                  showLoadingState={true}
                  validateImageExists={true}
                />
              </ImageErrorBoundaryWrapper>
            </motion.div>
          </div>
        </motion.div>

        {/* AI-Powered Features */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {[
            {
              title: "AI-Powered Hiring with HR Capital Precision",
              desc: "Automate your recruitment process and reduce risks with intelligent candidate screening and assessment.",
              src: "/ai worker suggestions.png",
              alt: "AI Worker Suggestions interface showing automated candidate recommendations and matching algorithms",
            },
            {
              title: "Smart Team Assembly",
              desc: "AI builds project teams based on skills, workload, and project requirements for optimal performance.",
              src: "/team management.png",
              alt: "Team Management dashboard displaying skill-based team composition and workload distribution",
            },
          ].map((block, i) => (
            <motion.article
              key={block.title}
              className="space-y-4 lg:space-y-6 p-6 lg:p-8 xl:p-10 bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={i + 1}
            >
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {block.title}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                {block.desc}
              </p>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <ImageErrorBoundaryWrapper>
                  <OptimizedImage
                    src={block.src}
                    alt={block.alt}
                    width={block.src === "/team management.png" ? 1800 : 1300}
                    height={block.src === "/team management.png" ? 900 : 900}
                    className="w-full h-auto mx-auto rounded-lg shadow-md"
                    fallbackSrc="/placeholder.svg"
                    showLoadingState={true}
                    validateImageExists={true}
                  />
                </ImageErrorBoundaryWrapper>
              </motion.div>
            </motion.article>
          ))}
        </div>

        {/* CRM Analytics & AI Automation */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {[
            {
              title: "24/7 CRM-Driven Analytics",
              desc: "Sales, tasks, and workload reports for data-driven insights and strategic decision making.",
              src: "/uni crm tasks.png",
              alt: "CRM Analytics Chart showing comprehensive sales and task performance metrics with data visualization",
            },
            {
              title: "End-to-End AI Automation",
              desc: "AI handles routine data entry, task assignments, and progress reports to keep projects moving efficiently.",
              src: "/ai assistant insights.png",
              alt: "AI Assistant Insights dashboard displaying automated task management and intelligent progress tracking",
            },
          ].map((block, i) => (
            <motion.article
              key={block.title}
              className="space-y-4 lg:space-y-6 p-6 lg:p-8 xl:p-10 bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              custom={i + 3}
            >
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {block.title}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                {block.desc}
              </p>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
                <ImageErrorBoundaryWrapper>
                  <OptimizedImage
                    src={block.src}
                    alt={block.alt}
                    width={1300}
                    height={900}
                    className="w-full h-auto mx-auto rounded-lg shadow-md"
                    fallbackSrc="/placeholder.svg"
                    showLoadingState={true}
                    validateImageExists={true}
                  />
                </ImageErrorBoundaryWrapper>
              </motion.div>
            </motion.article>
          ))}
        </div>

        {/* Transparent Audit & Trust */}
        <motion.article
          className="text-center space-y-6 lg:space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={5}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
            Transparent Audit & Trust
          </h2>
          <p className="mx-auto max-w-3xl text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
            Full transparency of factors, tracking HR processes via web3, and anti-ghost protocols for complete accountability.
          </p>
          <div className="px-2">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
              <ImageErrorBoundaryWrapper>
                <OptimizedImage
                  src="/team management.png"
                  alt="Team Management Dashboard showcasing transparent audit trail and trust verification systems"
                  width={1800}
                  height={900}
                  className="w-full h-auto mx-auto rounded-lg shadow-lg"
                  fallbackSrc="/placeholder.svg"
                  showLoadingState={true}
                  validateImageExists={true}
                />
              </ImageErrorBoundaryWrapper>
            </motion.div>
          </div>
        </motion.article>

        {/* Continuous Growth Engine */}
        <motion.article
          className="text-center space-y-6 lg:space-y-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          custom={6}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
            Continuous Growth Engine
          </h2>
          <p className="mx-auto max-w-3xl text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
            Use Profile as a main growth driver for employees. AI analyzes skills, defines goals, and builds progress back into productivity and deal success.
          </p>
          <div className="px-2">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
              <ImageErrorBoundaryWrapper>
                <OptimizedImage
                  src="/team productivity trend.png"
                  alt="Team Productivity Trend Graph displaying continuous growth metrics and performance analytics over time"
                  width={1800}
                  height={600}
                  className="w-full h-auto mx-auto rounded-lg shadow-lg"
                  fallbackSrc="/placeholder.svg"
                  showLoadingState={true}
                  validateImageExists={true}
                />
              </ImageErrorBoundaryWrapper>
            </motion.div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
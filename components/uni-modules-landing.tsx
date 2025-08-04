// components/UniModules.tsx

"use client";

import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageErrorBoundaryWrapper } from "@/components/ui/image-error-boundary";
import { motion } from "framer-motion";


// Module data
const programData = [
  {
    logo: (
      <OptimizedImage
        src="/uni hiring.png"
        alt="Uni-Hiring program logo"
        width={75}
        height={75}
        fallbackSrc="/placeholder-logo.svg"
        showLoadingState={false}
        validateImageExists={true}
      />
    ),
    title: "Uni-Hiring",
    image: "/unihiring_tests.png",
    alt: "UnisonAI Hiring dashboard interface showing candidate assessment and evaluation tools",
    features: [
      {
        name: "Smart Entry & Deep Assessment",
        description: "A candidate completes an adaptive application, uploads their résumé, and goes through HR Capital's verified suite: Productivity, Motivation, Expertise, and Tool checks, topped off with role-specific personality diagnostics."
      },
      {
        name: "AI Analysis & Work-Sample Simulation",
        description: "The neural engine 'x-rays' every datapoint, forecasting KPI potential and attrition risk, then—when relevant—auto-generates short work-sample tasks that mirror real duties, doubling as a built-in trial period."
      },
      {
        name: "Ranking & Insight Handoff",
        description: "An unbiased algorithm produces the short list and passes structured insights to Uni-Profile, so onboarding, training, and career paths align with each hire's proven strengths from day one."
      }
    ]
  },
  {
    logo: (
      <OptimizedImage
        src="/uni mngmnt.png"
        alt="Uni-Management program logo"
        width={48}
        height={48}
        fallbackSrc="/placeholder-logo.svg"
        showLoadingState={false}
        validateImageExists={true}
      />
    ),
    title: "Uni-Management",
    image: "/uni management_ calendar.png",
    alt: "UnisonAI Management dashboard showing project scheduling and team coordination calendar",
    features: [
      {
        name: "Real-Time Command Center",
        description: "Sales, service, and partnerships flow through a single pipeline that enriches every lead with external data, scores it in real time, and queues perfectly timed follow-ups."
      },
      {
        name: "AI Briefing & Task Design",
        description: "Leveraging skill data from Uni-Profile, the engine selects the ideal contributor—or blend of contributors—for each initiative, auto-drafts a precise brief, and breaks large scopes into sub-tasks with milestones and dependencies."
      },
      {
        name: "Balanced Execution & Insight Sync",
        description: "The system schedules each slice, equalizes workloads, protects deadlines, and continuously surfaces bottlenecks. All activity streams to live dashboards and synchronizes with Uni-CRM."
      }
    ]
  },
  {
    logo: (
      <OptimizedImage
        src="/uni profile.png"
        alt="Uni-Profile program logo"
        width={90}
        height={90}
        fallbackSrc="/placeholder-logo.svg"
        showLoadingState={false}
        validateImageExists={true}
      />
    ),
    title: "Uni-Profile",
    image: "/uni profile courses screen.png",
    alt: "UnisonAI Profile dashboard displaying personalized learning courses and skill development tracking",
    features: [
      {
        name: "Skill Mapping & Benchmarking",
        description: "AI fuses assessment results, task history, and 360° feedback into a live skill map, then benchmarks each profile against company goals and external market trends to spotlight growth gaps."
      },
      {
        name: "Targeted Development & Real-Time Badging",
        description: "The engine fills those gaps with curated learning—Coursera-level courses, in-house micro-modules, or short stretch projects auto-scheduled around existing commitments."
      },
      {
        name: "Career Pathing & Portfolio Sync",
        description: "AI projects next-best career moves, recommends mentors or rotations, and auto-curates a portfolio of completed work, streamlining reviews and internal job matches."
      }
    ]
  },
  {
    logo: (
      <OptimizedImage
        src="/uni crm.png"
        alt="Uni-CRM program logo"
        width={50}
        height={50}
        fallbackSrc="/placeholder-logo.svg"
        showLoadingState={false}
        validateImageExists={true}
      />
    ),
    title: "Uni-CRM",
    image: "/uni crm tasks.png",
    alt: "UnisonAI CRM dashboard showing customer relationship management and task tracking interface",
    features: [
      {
        name: "Unified Pipeline & Lead Intelligence",
        description: "Sales, service, and partnerships flow through a single pipeline that enriches every lead with external data, scores it in real time, and queues perfectly timed follow-ups."
      },
      {
        name: "Predictive Forecasting & AI Engagement",
        description: "Demand and win-probability models factor in live workloads from Uni-Management and skill maps from Uni-Profile, so commitments never exceed true capacity."
      },
      {
        name: "Transparent Audit & Data Loop",
        description: "All communications, documents, and KPIs are written to an immutable audit log, transforming the entire customer journey into a transparent, data-rich asset."
      }
    ]
  }
];

// Component
export function UniModules() {
  return (
    <section 
      id="uni-modules" 
      className="bg-white py-16 md:py-20 lg:py-28"
      aria-label="UnisonAI programs and modules"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">
            Our programs:
          </h2>
        </motion.div>

        <div className="space-y-20 lg:space-y-28">
          {programData.map((program, index) => (
            <motion.article
              key={program.title}
              className={`grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
            >
              <div className={`space-y-8 lg:space-y-10 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <header className="flex items-center gap-6 lg:gap-8">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="transition-transform duration-300 ease-out flex-shrink-0"
                  >
                    {program.logo}
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    {program.title}
                  </h3>
                </header>
                <div className="space-y-6 lg:space-y-8">
                  {program.features.map((feature, idx) => (
                    <motion.div
                      key={feature.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.15 }}
                      className="space-y-2 lg:space-y-3"
                    >
                      <h4 className="font-semibold text-lg sm:text-xl lg:text-2xl text-gray-900">
                        {feature.name}
                      </h4>
                      <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={`flex justify-center ${index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}
              >
                <ImageErrorBoundaryWrapper>
                  <OptimizedImage
                    src={program.image}
                    alt={program.alt}
                    width={2340}
                    height={1560}
                    className="rounded-lg lg:rounded-xl xl:rounded-2xl w-full max-w-4xl shadow-lg"
                    style={{ maxHeight: 910, objectFit: "contain" }}
                    priority={index === 0}
                    fallbackSrc="/placeholder.svg"
                    showLoadingState={true}
                    validateImageExists={true}
                  />
                </ImageErrorBoundaryWrapper>
              </motion.div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
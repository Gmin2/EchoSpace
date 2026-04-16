import { ArrowRight, Check } from 'lucide-react';
import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { WordsPullUp } from '../components/WordsPullUp';
import { WordsPullUpMultiStyle } from '../components/WordsPullUpMultiStyle';
import { AnimatedText } from '../components/AnimatedText';

export default function Landing() {
  return (
    <div className="bg-black min-h-screen text-primary selection:bg-primary selection:text-black">
      {/* Hero Section */}
      <section className="h-screen p-4 md:p-6">
        <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-black">
          {/* Background Video */}
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlays */}
          <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
              <div className="lg:col-span-8">
                <WordsPullUp
                  text="EchoSpace"
                  showAsterisk
                  className="text-[16vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] xl:text-[9vw] 2xl:text-[10vw] font-medium leading-[0.85] tracking-[-0.07em]"
                  style={{ color: '#E1E0CC' }}
                />
              </div>
              <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-6 lg:pb-8">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-primary/70 text-xs sm:text-sm md:text-base leading-[1.2] max-w-sm"
                >
                  EchoSpace turns your room into a persistent 3D memory map. Scan once, speak naturally, and let an AI agent anchor notes, voice clips, and ideas exactly where they belong.
                </motion.p>
                <Link to="/spaces">
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="group flex items-center gap-2 hover:gap-3 bg-primary text-black rounded-full pl-6 pr-2 py-2 transition-all duration-300"
                  >
                    <span className="font-medium text-sm sm:text-base">Explore spaces</span>
                    <div className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-black px-4 py-24 md:py-32">
        <div className="max-w-6xl mx-auto bg-[#101010] rounded-[2rem] p-8 md:p-16 lg:p-24 flex flex-col items-center text-center">
          <span className="text-primary text-[10px] sm:text-xs uppercase tracking-widest mb-8">SPATIAL MEMORY AI</span>
          
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9] mb-12">
            <WordsPullUpMultiStyle
              className="justify-center"
              segments={[
                { text: "EchoSpace is your room-scale second brain. ", className: "font-normal text-[#E1E0CC]" },
                { text: "Persistent, voice-first, and context-aware.", className: "font-serif italic text-[#E1E0CC]" }
              ]}
            />
          </div>

          <div className="max-w-2xl mx-auto text-[#DEDBC8] text-xs sm:text-sm md:text-base leading-relaxed">
            <AnimatedText text="Built for creators, founders, and teams who think in space. Capture decisions, tasks, and insights where they happen, then revisit them in an interactive 3D scene anytime." />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="min-h-screen bg-black relative py-24 px-4 md:px-6">
        <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="mb-16 md:mb-24 flex flex-col gap-2">
            <WordsPullUpMultiStyle
              className="justify-start text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal"
              segments={[
                { text: "Studio-grade workflows for spatial thinking.", className: "text-[#E1E0CC]" }
              ]}
            />
            <WordsPullUpMultiStyle
              className="justify-start text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal"
              segments={[
                { text: "Built for real rooms. Powered by multimodal AI.", className: "text-gray-500" }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:h-[480px]">
            <FeatureCard delay={0}>
              <div className="relative w-full h-full rounded-2xl overflow-hidden group min-h-[300px]">
                <video
                  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-[#E1E0CC] font-medium">Your room becomes your memory interface.</p>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard delay={0.15}>
              <div className="w-full h-full bg-[#212121] rounded-2xl p-6 flex flex-col min-h-[300px]">
                <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85" alt="Icon" className="w-10 h-10 sm:w-12 sm:h-12 rounded mb-6" />
                <h3 className="text-[#E1E0CC] font-medium text-lg mb-6 flex items-center gap-2">
                  Spatial Memory Anchors. <span className="text-gray-500 text-sm">(01)</span>
                </h3>
                <ul className="space-y-4 flex-grow">
                  {[
                    "Pin notes to exact 3D locations",
                    "Capture ideas using natural voice",
                    "Store text, audio, and generated visuals",
                    "Persist memory anchors across sessions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-gray-400 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="#" className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm font-medium mt-8 group w-fit">
                  Explore anchors
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 -rotate-45" />
                </a>
              </div>
            </FeatureCard>

            <FeatureCard delay={0.3}>
              <div className="w-full h-full bg-[#212121] rounded-2xl p-6 flex flex-col min-h-[300px]">
                <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85" alt="Icon" className="w-10 h-10 sm:w-12 sm:h-12 rounded mb-6" />
                <h3 className="text-[#E1E0CC] font-medium text-lg mb-6 flex items-center gap-2">
                  Agentic Connections. <span className="text-gray-500 text-sm">(02)</span>
                </h3>
                <ul className="space-y-4 flex-grow">
                  {[
                    "Reason across related memories",
                    "Auto-summarize key decisions",
                    "Surface links by context and location"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-gray-400 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="#" className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm font-medium mt-8 group w-fit">
                  See reasoning
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 -rotate-45" />
                </a>
              </div>
            </FeatureCard>

            <FeatureCard delay={0.45}>
              <div className="w-full h-full bg-[#212121] rounded-2xl p-6 flex flex-col min-h-[300px]">
                <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85" alt="Icon" className="w-10 h-10 sm:w-12 sm:h-12 rounded mb-6" />
                <h3 className="text-[#E1E0CC] font-medium text-lg mb-6 flex items-center gap-2">
                  Focused Recall Mode. <span className="text-gray-500 text-sm">(03)</span>
                </h3>
                <ul className="space-y-4 flex-grow">
                  {[
                    "Ask: \"What did I note here?\"",
                    "Replay voice memories instantly",
                    "Get proactive next-step suggestions"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-gray-400 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <a href="#" className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm font-medium mt-8 group w-fit">
                  Try recall
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 -rotate-45" />
                </a>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

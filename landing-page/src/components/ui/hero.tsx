"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center bg-background text-foreground overflow-hidden px-6">
      {/* Brutalist Cinematic Noise Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-difference" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-6">
          <span className="text-accent font-mono uppercase tracking-[0.3em] text-sm md:text-base font-bold">
            The Next Evolution
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.9] tracking-tighter uppercase mb-8"
        >
          Absolute <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground to-[#444444]">
            Focus.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-2xl text-foreground/70 max-w-2xl font-light mb-12 tracking-wide"
        >
          Cut through the noise. Design interfaces that perform with brutal efficiency and unquestionable style.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="group relative flex items-center justify-center gap-2 h-16 px-10 bg-accent text-foreground text-lg font-bold uppercase tracking-widest overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <span className="relative z-10">Deploy Now</span>
            <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          </button>

          <button className="group h-16 px-10 bg-transparent border border-muted text-foreground text-lg font-bold uppercase tracking-widest hover:border-foreground/50 transition-colors">
            Read Docs
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

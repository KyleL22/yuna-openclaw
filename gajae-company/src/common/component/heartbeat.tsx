"use client";

import { motion } from "framer-motion";

export const Heartbeat = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full abyssal-glass abyssal-border">
      <motion.div
        className="w-2 h-2 rounded-full bg-abyssal-accent"
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
          boxShadow: [
            "0 0 0px rgba(56, 189, 248, 0)",
            "0 0 10px rgba(56, 189, 248, 0.8)",
            "0 0 0px rgba(56, 189, 248, 0)"
          ]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <span className="text-[10px] font-mono tracking-tighter text-abyssal-accent opacity-80 uppercase">
        System Live
      </span>
    </div>
  );
};

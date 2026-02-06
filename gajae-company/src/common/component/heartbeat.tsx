"use client";

import { motion } from "framer-motion";
import { Heart, ShieldCheck } from "lucide-react";

export const Heartbeat = () => {
  return (
    <div className="flex items-center gap-4 bg-white/40 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-ghibli-accent/10 shadow-sm">
      <div className="flex flex-col items-end mr-1">
        <div className="flex items-center gap-1.5 text-green-600 font-black">
            <ShieldCheck size={12} />
            <span className="text-[9px] uppercase tracking-tighter">System Health</span>
        </div>
        <span className="text-[11px] font-black text-ghibli-text leading-tight">무결성 수호 중</span>
      </div>
      
      <div className="w-[2px] h-8 bg-ghibli-accent/10" />

      <div className="flex items-center gap-3">
        <div className="relative">
            <motion.div
            animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[#ff7eb9] rounded-full blur-md"
            />
            <Heart size={20} fill="#ff7eb9" className="text-[#ff7eb9] relative z-10" />
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] font-black text-ghibli-accent uppercase tracking-tighter leading-none">Live</span>
            <span className="text-[12px] font-black text-ghibli-text leading-none mt-1">박동 중</span>
        </div>
      </div>
    </div>
  );
};

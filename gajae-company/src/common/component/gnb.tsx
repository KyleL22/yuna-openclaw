"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, History } from "lucide-react";
import { Heartbeat } from "./heartbeat";

export const GNB = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Timeline", href: "/timeline", icon: History },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 abyssal-glass border-b border-abyssal-accent/10">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-abyssal-accent to-abyssal-glow flex items-center justify-center"
          >
            <span className="text-abyssal-950 font-bold text-lg">G</span>
          </motion.div>
          <span className="font-bold tracking-tight text-lg hidden md:block">GAJAE-BIP</span>
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`relative px-4 py-2 rounded-md transition-colors flex items-center gap-2 group ${isActive ? 'text-abyssal-accent' : 'text-slate-400 hover:text-white'}`}>
                  <item.icon size={18} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute inset-0 bg-abyssal-accent/5 rounded-md border border-abyssal-accent/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Heartbeat />
    </nav>
  );
};

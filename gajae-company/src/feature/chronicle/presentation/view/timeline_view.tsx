"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSanctuaryStore } from "../store/sanctuary_store";
import { Chronicle } from "../../domain/model/chronicle";
import { Calendar, ChevronRight, Clock, FileText } from "lucide-react";

export const TimelineView = ({ initialDates }: { initialDates: string[] }) => {
  const { 
    selectedDate, 
    setSelectedDate, 
    timeline, 
    setTimeline, 
    isLoading, 
    setIsLoading 
  } = useSanctuaryStore();

  const fetchChronicles = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chronicle/${date}`);
      const data = await response.json();
      setTimeline(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialDates.length > 0 && !selectedDate) {
      handleDateSelect(initialDates[0]);
    }
  }, [initialDates]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    fetchChronicles(date);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
      {/* Sidebar: Date List */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-abyssal-accent" />
          CHRONICLE INDEX
        </h2>
        <div className="space-y-2">
          {initialDates.map((date) => (
            <button
              key={date}
              onClick={() => handleDateSelect(date)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                selectedDate === date 
                  ? "abyssal-glass border border-abyssal-accent/30 text-abyssal-accent" 
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <span className="font-mono">{date}</span>
              <ChevronRight size={16} className={`transition-transform ${selectedDate === date ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main: Timeline Details */}
      <div className="lg:col-span-3">
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedDate ? `${selectedDate.slice(0, 4)}년 ${selectedDate.slice(4, 6)}월 ${selectedDate.slice(6, 8)}일` : "날짜를 선택하세요"}
            </h1>
            <p className="text-slate-400 mt-2">오늘의 성역 기록 (Daily Chronicles)</p>
          </div>
          {isLoading && (
            <div className="text-abyssal-accent text-sm font-mono animate-pulse">
              SYNCING...
            </div>
          )}
        </header>

        <div className="relative border-l border-slate-800 ml-4 pl-10 space-y-12 py-4">
          <AnimatePresence mode="wait">
            {timeline.length > 0 ? (
              timeline.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -left-[53px] top-1 w-6 h-6 rounded-full bg-slate-900 border-2 border-abyssal-accent flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-abyssal-accent" />
                  </div>
                  
                  <div className="abyssal-glass abyssal-border rounded-2xl p-6 hover:border-abyssal-accent/40 transition-all">
                    <div className="flex items-center gap-3 text-abyssal-accent text-sm font-mono mb-3">
                      <Clock size={14} />
                      {item.time}
                    </div>
                    <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{item.title}</h3>
                    <div className="flex gap-4">
                      <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                        <FileText size={14} />
                        VIEW MARKDOWN
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-500 font-medium py-20 text-center italic"
              >
                No chronicles found for this date.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

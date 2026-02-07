"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Zap, MessageSquare, Clock, ArrowRight, User, Brain, Target, Activity, Quote, ChevronRight, PlayCircle, Terminal, CheckCircle, MessageSquareQuote, LayoutGrid, CheckCircle2, Circle, GitPullRequest, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { firebaseApp } from "@/core/config/firebase-config";
import { getFirestore, collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import Image from "next/image";

/**
 * [가재 컴퍼니] Swarm Activity Stream v8.5 (Intelligence Graph Flow)
 * 의도: 대표님의 지시에 따라 '그래프 공정'을 직관적인 비주얼 플로우로 개선함.
 */

const TaskPill = ({ taskId }: { taskId: string }) => {
    const [task, setTask] = useState<any>(null);
    const db = getFirestore(firebaseApp);

    useEffect(() => {
        const fetch = async () => {
            const snap = await getDoc(doc(db, "all_tasks", taskId));
            if (snap.exists()) setTask(snap.data());
        };
        fetch();
    }, [taskId]);

    if (!task) return <div className="w-full h-8 bg-slate-50 animate-pulse rounded-lg" />;

    return (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-ghibli-blue/20 transition-all">
            <div className={`shrink-0 w-2 h-2 rounded-full ${
                task.status === 'DONE' ? 'bg-green-500' : 'bg-ghibli-blue animate-pulse'
            }`} />
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-black truncate ${task.status === 'DONE' ? 'text-slate-300 line-through' : 'text-slate-600'}`}>
                    {task.title}
                </p>
            </div>
            <span className="text-[7px] font-mono text-slate-300 font-bold uppercase">{task.assigneeId}</span>
        </div>
    );
};

export const LiveActivityStream = () => {
  const [commands, setCommands] = useState<any[]>([]);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const q = query(collection(db, "commands"), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, (snap) => {
        setCommands(snap.docs.map(doc => doc.data()));
    });
  }, [db]);

  const profileImg = "/assets/media/gajae-cute-chef.jpg";

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col gap-3 mb-16 px-2">
        <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <h2 className="text-3xl md:text-5xl font-black text-ghibli-text tracking-tighter uppercase italic">
                지능 팩토리 <span className="text-slate-300 font-mono text-xl md:text-3xl not-italic ml-1 tracking-normal">GRAPH_SYSTEM</span>
            </h2>
        </div>
        <p className="text-sm md:text-lg text-slate-500 font-bold italic border-l-8 border-ghibli-accent pl-6">
            "명령은 그래프로 분해되고, 가재들은 동적 태스크를 조립하여 무결성을 완성합니다."
        </p>
      </div>

      <div className="space-y-40">
        <AnimatePresence mode="popLayout">
          {commands.length > 0 ? commands.map((cmd) => (
            <motion.div key={cmd.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="relative">
                {/* 👑 ROOT: COMMAND & TOPOLOGY */}
                <div className="mb-16 relative">
                    <div className="flex items-start md:items-center gap-6 mb-10">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-ghibli-orange text-white flex items-center justify-center shadow-2xl border-4 border-white shrink-0 relative z-10">
                            <MessageSquareQuote size={40} />
                            <div className="absolute -inset-2 bg-ghibli-orange/20 rounded-[2.8rem] animate-pulse -z-10" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="px-4 py-1 rounded-full bg-orange-100 text-ghibli-orange text-[10px] font-black uppercase tracking-widest border border-ghibli-orange/20">KING_COMMAND</span>
                                <span className="text-slate-300 font-mono text-xs font-bold">{cmd.date} | {cmd.time}</span>
                            </div>
                            <h3 className="text-2xl md:text-4xl font-black text-ghibli-text uppercase italic tracking-tighter decoration-ghibli-accent/20 underline underline-offset-8 decoration-4">{cmd.title}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* 01. Instruction Bubble */}
                        <div className="lg:col-span-5 bg-orange-50/40 p-10 rounded-[4rem] border-2 border-ghibli-orange/10 shadow-inner flex flex-col justify-center relative min-h-[300px]">
                            <div className="absolute top-8 left-8 opacity-10">
                                <Quote size={64} fill="currentColor" className="text-ghibli-orange" />
                            </div>
                            <p className="text-xl md:text-2xl text-ghibli-text font-black leading-tight italic whitespace-pre-wrap relative z-10 pl-4">
                                "{cmd.instruction}"
                            </p>
                        </div>

                        {/* 02. VISUAL GRAPH TOPOLOGY (Improved) */}
                        <div className="lg:col-span-7 space-y-8 relative">
                            <div className="flex items-center justify-between px-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <GitPullRequest size={16} className="text-ghibli-blue" /> Intelligence Topology
                                </span>
                                <div className="px-4 py-1.5 rounded-2xl bg-ghibli-blue/10 text-[10px] font-black text-ghibli-blue font-mono uppercase tracking-widest border border-ghibli-blue/20">
                                    Graph_v5.2
                                </div>
                            </div>

                            <div className="flex flex-col gap-0 relative">
                                {cmd.steps?.map((step: any, sIdx: number) => (
                                    <div key={step.id} className="relative group">
                                        {/* Connecting Line */}
                                        {sIdx < cmd.steps.length - 1 && (
                                            <div className="absolute left-[23px] top-[48px] bottom-[-24px] w-1 bg-slate-100 group-hover:bg-ghibli-blue/20 transition-colors z-0" />
                                        )}
                                        
                                        <div className="flex items-start gap-6 relative z-10 pb-12">
                                            {/* Node Circle */}
                                            <div className={`mt-2 w-12 h-12 rounded-2xl flex items-center justify-center border-4 shadow-xl transition-all duration-500 group-hover:scale-110 shrink-0 ${
                                                step.status === 'DONE' ? 'bg-green-500 border-white text-white' : 
                                                (step.status === 'INPROGRESS' ? 'bg-ghibli-blue border-white text-white animate-pulse' : 'bg-white border-slate-100 text-slate-200')
                                            }`}>
                                                {step.status === 'DONE' ? <CheckCircle2 size={24} /> : <span className="font-mono font-black text-lg">{sIdx + 1}</span>}
                                            </div>

                                            {/* Node Content Card */}
                                            <div className={`flex-1 ghibli-card p-6 border-2 transition-all duration-500 ${
                                                step.status === 'INPROGRESS' ? 'bg-white border-ghibli-blue/30 shadow-2xl ring-4 ring-ghibli-blue/5' : 'bg-slate-50/50 border-slate-100 hover:bg-white'
                                            }`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className={`text-sm md:text-lg font-black uppercase tracking-tighter ${step.status === 'DONE' ? 'text-slate-400' : 'text-ghibli-text'}`}>
                                                        {step.name}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase">Lead:</span>
                                                        <div className="px-2 py-1 rounded-lg bg-white border border-slate-100 shadow-sm text-[9px] font-black text-ghibli-blue">@{step.assigneeId}</div>
                                                    </div>
                                                </div>

                                                {/* Criteria Chip */}
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-[9px] font-bold text-slate-500 mb-5">
                                                    <Target size={12} className="opacity-40" />
                                                    <span className="uppercase tracking-widest">D.O.D:</span>
                                                    <span className="italic">{step.criteria}</span>
                                                </div>

                                                {/* Dynamic Tasks for this Node */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                                                    {step.taskIds?.map((tid: string) => (
                                                        <TaskPill key={tid} taskId={tid} />
                                                    ))}
                                                    {(!step.taskIds || step.taskIds.length === 0) && (
                                                        <p className="text-[10px] text-slate-300 italic py-2">연산 대기 중...</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🐝 VIBE CHAT STREAM (The Dialogue) */}
                <div className="relative mt-24">
                    <div className="flex items-center gap-4 mb-12 px-2">
                        <MessageSquare size={24} className="text-ghibli-blue" />
                        <h4 className="text-2xl font-black text-ghibli-text tracking-tighter uppercase italic">
                            지능 격돌 로그 <span className="text-slate-300 font-mono text-lg not-italic">Dialogue_Stream</span>
                        </h4>
                    </div>

                    <div className="ml-8 md:ml-32 border-l-4 border-slate-100 pl-10 md:pl-16 space-y-20 relative">
                        {cmd.activities?.map((act: any) => (
                            <motion.div key={act.id} className="relative group">
                                <div className="absolute -left-[54px] md:-left-[82px] top-10 w-6 h-6 rounded-full bg-white border-8 border-slate-100 group-hover:border-ghibli-blue transition-colors duration-500" />

                                <div className="ghibli-card p-10 bg-white border border-slate-100 shadow-2xl rounded-[4rem] relative overflow-hidden transition-all duration-700 hover:-translate-y-2">
                                    {/* Profile Header */}
                                    <div className="flex items-center gap-6 mb-10 pb-6 border-b border-slate-50">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0">
                                            <Image src={profileImg} alt="G" width={64} height={64} className="object-cover" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-2xl font-black text-ghibli-text tracking-tighter leading-none mb-2">{act.authorName}</h4>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black text-ghibli-blue uppercase tracking-[0.2em] bg-blue-50 px-2 py-0.5 rounded-lg">{act.authorId} SYNC</span>
                                                <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />
                                                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">{act.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Brain Exposure */}
                                    <div className="space-y-12">
                                        <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border-l-[16px] border-ghibli-accent relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-10 text-ghibli-accent"><Activity size={100} /></div>
                                            <div className="flex items-center gap-2 mb-4 text-ghibli-accent/60 relative z-10 uppercase font-black text-[11px] tracking-widest">04. Final Response</div>
                                            <p className="text-lg md:text-2xl text-white font-black leading-tight whitespace-pre-wrap underline decoration-ghibli-accent/20 decoration-8 underline-offset-[12px] relative z-10">
                                                "{act.response?.message || act.response || "-"}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="bg-ghibli-bg/30 p-8 rounded-[3rem] border-2 border-white shadow-inner relative overflow-hidden">
                                                <div className="absolute -top-4 -left-4 opacity-5 text-ghibli-blue"><Brain size={120} /></div>
                                                <span className="text-[9px] font-black text-ghibli-blue/30 uppercase tracking-widest block mb-4 relative z-10">Neural Thought Process</span>
                                                <p className="text-sm md:text-lg text-slate-600 font-bold leading-relaxed italic whitespace-pre-wrap relative z-10">
                                                    {act.thought}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
          )) : (
            <div className="py-60 text-center">
                <div className="w-20 h-20 rounded-[3rem] border-8 border-ghibli-accent/10 border-t-ghibli-accent animate-spin mx-auto mb-10" />
                <p className="text-slate-400 font-black uppercase tracking-[0.8em] text-xl animate-pulse italic">Establishing Neural Swarm Stream...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

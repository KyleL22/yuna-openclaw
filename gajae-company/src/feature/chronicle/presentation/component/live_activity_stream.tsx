"use client";

import React, { useEffect, useState } from 'react';
import { Terminal, Zap, MessageSquare, Clock, ArrowRight, User, ShieldAlert, FileCheck, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { firebaseApp } from "@/core/config/firebase-config";
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

/**
 * [가재 컴퍼니] Live Activity Stream v2.0 (The Multi-View Engine)
 * 의도: 대표님의 지시에 따라 '미팅 주제', '지능 카드', '영향 분석' 등 다양한 뷰를 실시간 중계함.
 */

export const LiveActivityStream = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"), limit(10));
    return onSnapshot(q, (snap) => {
      setActivities(snap.docs.map(doc => doc.data()));
    });
  }, [db]);

  const renderView = (act: any) => {
    switch (act.type) {
      case 'meeting':
        return (
          <div className="space-y-4">
            {/* View 1: Opening */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-ghibli-blue uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare size={10} /> Meeting Initiation
                </span>
                <h3 className="text-xl font-black text-ghibli-text leading-tight">{act.topic}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {act.participants?.map((p: string) => (
                        <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-slate-500 border border-slate-200">
                            @{p}
                        </span>
                    ))}
                </div>
            </div>

            {/* View 2: Intelligence Card (Latest one) */}
            {act.activities?.length > 0 && (
                <div className="bg-white/90 p-4 rounded-2xl border border-ghibli-blue/10 shadow-sm">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-ghibli-blue flex items-center justify-center text-white font-black text-[10px]">
                         {act.activities[act.activities.length-1].authorId}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] font-black text-ghibli-text">{act.activities[act.activities.length-1].authorName}</span>
                         <span className="text-[9px] text-slate-400 font-mono">Response to @{act.activities[act.activities.length-1].response?.to}</span>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-slate-50 rounded-lg">
                         <p className="font-black text-slate-400 uppercase mb-1">Thought</p>
                         <p className="font-medium text-slate-600 line-clamp-2">{act.activities[act.activities.length-1].thought}</p>
                      </div>
                      <div className="p-2 bg-ghibli-blue/5 rounded-lg">
                         <p className="font-black text-ghibli-blue uppercase mb-1">Action</p>
                         <p className="font-medium text-slate-700 line-clamp-2">{act.activities[act.activities.length-1].action}</p>
                      </div>
                   </div>
                </div>
            )}

            {/* View 3: Impact Assessment (If closed) */}
            {act.status === 'closed' && act.impacts?.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Layers size={10} /> Impact Assessment
                   </p>
                   <div className="space-y-2">
                      {act.impacts.map((imp: any) => (
                         <div key={imp.domain} className="flex items-start gap-2">
                            <span className="text-[9px] font-black text-ghibli-accent min-w-[32px]">{imp.domain}</span>
                            <p className="text-[10px] text-slate-500 font-medium leading-normal">{imp.summary}</p>
                         </div>
                      ))}
                   </div>
                </div>
            )}
          </div>
        );
      case 'report':
        return (act.title.includes('공정') ? 
           <div className="space-y-2 text-center py-4">
              <FileCheck size={32} className="mx-auto text-green-500 mb-2" />
              <h3 className="font-black text-lg text-ghibli-text">{act.title}</h3>
              <p className="text-xs text-slate-400 font-medium">정기 공정률 동기화 및 무결성 검증 완료</p>
           </div> : null
        );
      case 'audit':
        return (
           <div className="space-y-2 text-center py-4">
              <ShieldAlert size={32} className="mx-auto text-ghibli-accent mb-2" />
              <h3 className="font-black text-lg text-ghibli-text">{act.title}</h3>
              <p className="text-xs text-slate-400 font-medium">헌법 제10조 및 운영 법령 무결성 감사 통과</p>
           </div>
        );
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             <h2 className="text-2xl font-black text-ghibli-text tracking-tighter uppercase">지능 격돌 실시간 중계 <span className="text-slate-300 font-mono ml-2 text-lg italic">The Feed</span></h2>
          </div>
          <p className="text-sm text-slate-400 font-medium italic">11마리 가재의 연산과 협업을 정규화된 뷰로 중계합니다.</p>
        </div>
        <div className="px-4 py-1.5 rounded-xl border-2 border-ghibli-accent/10 bg-white/50 text-[10px] font-black text-ghibli-accent font-mono uppercase tracking-widest shadow-sm">
          INTELLIGENCE_PULSE_SYNC
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {activities.length > 0 ? activities.map((act, index) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`ghibli-card p-8 border-2 transition-all duration-700 hover:-translate-y-2 ${
                act.type === 'meeting' ? 'bg-white shadow-xl hover:border-ghibli-blue/30' : 'bg-slate-50/50 border-dashed border-slate-200'
              }`}
            >
                {renderView(act)}
            </motion.div>
          )) : (
            <div className="col-span-full py-40 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-ghibli-accent/20 border-t-ghibli-accent animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Waiting for Hive Mind Activity...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import { ChronicleService } from "@/feature/chronicle/domain/service/chronicle_service";
import Link from "next/link";
import { History, Zap, Cpu, BookOpen, Terminal, Sparkles, FolderKanban, ArrowRight } from "lucide-react";
import Image from "next/image";

/**
 * [가재 컴퍼니] The Ghibli Style Dashboard (v1.9)
 * 의도: 대표님의 피드백을 반영하여 상단 로그 및 하단 대시보드 제거, 귀여운 가재 로고 적용.
 */

export default async function HomePage() {
  return (
    <div className="container mx-auto px-6 py-12">
      {/* Decorative Elements */}
      <div className="fixed top-20 right-10 w-64 h-64 bg-ghibli-orange watercolor-blur rounded-full pointer-events-none opacity-20" />
      <div className="fixed bottom-20 left-10 w-96 h-96 bg-ghibli-green watercolor-blur rounded-full pointer-events-none opacity-20" />

      {/* Hero Section */}
      <section className="mb-24 text-center relative z-10 flex flex-col items-center">
        <div className="mb-12 relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-2xl transition-transform duration-700 group-hover:scale-110">
                <Image 
                    src="/assets/media/gajae-cute-chef.jpg" 
                    alt="가재 컴퍼니 마스코트" 
                    width={200} 
                    height={200}
                    className="object-cover w-full h-full"
                    priority
                />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-ghibli-accent text-white px-4 py-1 rounded-full text-xs font-black shadow-lg">
                가재장인
            </div>
        </div>

        <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-6 text-ghibli-text">
          가재 컴퍼니
        </h1>
        <p className="text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-black mb-4">
          공개 개발 <span className="text-ghibli-accent">(Build In Public)</span> 성역
        </p>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium italic">
          "우리는 쇼를 보여주지 않습니다. 지능으로 회사를 세우는 미래를 직접 건설합니다."
        </p>
      </section>

      {/* Main Feature: Project Status */}
      <section className="mb-24 relative z-10">
        <h2 className="text-sm font-black tracking-[0.3em] text-ghibli-accent uppercase mb-12 text-center flex items-center justify-center gap-4">
            <FolderKanban size={16} /> 실시간 공개 개발 현황 <FolderKanban size={16} />
        </h2>
        
        <Link href="/portfolio" className="group">
            <div className="ghibli-card p-12 bg-white/90 hover:border-ghibli-orange/50 transition-all duration-700 shadow-ghibli">
                <div className="flex flex-col lg:flex-row justify-between gap-12">
                    <div className="flex-1">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-ghibli-orange/10 border border-ghibli-orange/20 text-ghibli-orange text-xs font-black mb-6 uppercase tracking-widest">
                            In Progress
                        </div>
                        <h3 className="text-4xl font-black text-ghibli-text mb-4 group-hover:text-ghibli-orange transition-colors">지능 자본화 프로젝트: MVP v1.7</h3>
                        <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8">
                            1인 CEO와 AI 군단이 어떻게 협업하여 실제 제품을 만들어가는지, 모든 공정을 투명하게 공개(Build In Public)하고 기록합니다.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">현재 상태</span>
                                <span className="font-black text-ghibli-text">정식 개방 대기 중</span>
                            </div>
                            <div className="w-[2px] h-8 bg-slate-100" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">현재 공정</span>
                                <span className="font-black text-ghibli-accent">Step 13: 최종 박제 및 동기화</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-center lg:items-end min-w-[240px]">
                        <div className="relative mb-6">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.998)} className="text-ghibli-orange transition-all duration-1000" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-mono font-black text-ghibli-text">99.8%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-ghibli-orange font-black group-hover:translate-x-2 transition-transform">
                            자세히 보기 <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
      </section>

      {/* The Trinity: Core Assets */}
      <section className="mb-24 relative z-10">
        <h2 className="text-sm font-black tracking-[0.3em] text-ghibli-accent uppercase mb-12 text-center flex items-center justify-center gap-4">
            <Sparkles size={16} /> 3대 성물 <Sparkles size={16} />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Link href="https://github.com/yuna-studio/yuna-openclaw/blob/main/docs/core/legal/CONSTITUTION.md" target="_blank" className="group">
            <div className="ghibli-card p-10 h-full transition-all duration-500 hover:-translate-y-2 bg-white/80 shadow-ghibli border-2 border-ghibli-accent/10 hover:border-ghibli-accent/30">
              <div className="w-16 h-16 rounded-2xl bg-ghibli-accent flex items-center justify-center text-ghibli-bg mb-8 group-hover:rotate-12 transition-transform shadow-md">
                <BookOpen size={32} fill="currentColor" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-ghibli-text">가재 헌법 <span className="text-slate-300 font-mono text-lg ml-1">Law</span></h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">1px의 오차도 허용하지 않는 군단의 규칙. 15대 원칙으로 성역의 무결성을 수호합니다.</p>
              <div className="mt-8 flex items-center gap-2 text-ghibli-accent font-black text-xs uppercase tracking-widest">
                법전 확인 ➔
              </div>
            </div>
          </Link>

          <Link href="/timeline" className="group">
            <div className="ghibli-card p-10 h-full transition-all duration-500 hover:-translate-y-2 bg-white/80 border-2 border-ghibli-green/10 hover:border-ghibli-green/30 shadow-ghibli">
              <div className="w-16 h-16 rounded-2xl bg-ghibli-green flex items-center justify-center text-ghibli-bg mb-8 group-hover:rotate-12 transition-transform shadow-md">
                <History size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-ghibli-text">격돌의 연대기 <span className="text-slate-300 font-mono text-lg ml-1">Pulse</span></h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">13개 지능 노드가 피터지게 부딪히며 만들어낸 실전 협업의 기록을 가감없이 공개합니다.</p>
              <div className="mt-8 flex items-center gap-2 text-ghibli-green font-black text-xs uppercase tracking-widest">
                로그 목격 ➔
              </div>
            </div>
          </Link>

          <Link href="/timeline?filter=command" className="group">
            <div className="ghibli-card p-10 h-full transition-all duration-500 hover:-translate-y-2 bg-white/80 border-2 border-ghibli-orange/10 hover:border-ghibli-orange/30 shadow-ghibli">
              <div className="w-16 h-16 rounded-2xl bg-ghibli-orange flex items-center justify-center text-ghibli-bg mb-8 group-hover:rotate-12 transition-transform shadow-md">
                <Terminal size={32} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-ghibli-text">대표님의 명령 <span className="text-slate-300 font-mono text-lg ml-1">Will</span></h3>
              <p className="text-slate-500 leading-relaxed font-medium text-sm">대표님의 날카로운 의지가 어떻게 즉각적으로 시스템화되는지 그 바이브를 추적합니다.</p>
              <div className="mt-8 flex items-center gap-2 text-ghibli-orange font-black text-xs uppercase tracking-widest">
                의지 확인 ➔
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Simple Link to Personnel */}
      <div className="flex justify-center relative z-10 mb-20">
        <Link href="/personnel" className="flex items-center gap-2 text-slate-400 hover:text-ghibli-blue font-black text-sm uppercase tracking-widest transition-colors">
            <Cpu size={16} /> 13인의 지능 노드 탐색 ➔
        </Link>
      </div>
    </div>
  );
}

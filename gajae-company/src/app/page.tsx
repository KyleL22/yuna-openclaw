import { ChronicleService } from "@/feature/chronicle/domain/service/chronicle_service";
import { Heartbeat } from "@/common/component/heartbeat";
import Link from "next/link";
import { LayoutDashboard, History, Zap, ShieldCheck, Cpu, BookOpen, ScrollText, Terminal } from "lucide-react";

/**
 * [GAJAE-BIP] The Abyssal Sanctuary Dashboard (v1.1)
 * 의도: 성역의 3대 성물(The Trinity)을 최상단에 배치하여 유저에게 지능의 서사를 제공함.
 */

export default async function HomePage() {
  const service = new ChronicleService();
  const dates = await service.getTimelineIndex();

  return (
    <div className="container mx-auto px-6 py-12 text-slate-50">
      {/* Hero Section */}
      <section className="mb-24 text-center">
        <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
          THE ABYSSAL <br /> SANCTUARY
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
          1인 CEO와 AI 군단의 실시간 지능 협업 공정. <br />
          우리는 쇼를 보여주지 않습니다. 지능으로 회사를 세우는 미래를 직접 건설합니다.
        </p>
      </section>

      {/* The Trinity: Core Features */}
      <section className="mb-24">
        <h2 className="text-sm font-bold tracking-[0.2em] text-abyssal-accent uppercase mb-12 text-center">The Trinity (3대 성물)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* The Law: Constitution */}
          <Link href="https://github.com/yuna-studio/yuna-openclaw/blob/main/docs/core/legal/CONSTITUTION.md" target="_blank" className="group">
            <div className="abyssal-glass abyssal-border rounded-[2.5rem] p-10 h-full hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-yellow-500 transition-colors">The Law</h3>
              <p className="text-slate-400 leading-relaxed font-light">가재 군단의 뼈대와 15대 리더십 원칙이 담긴 불변의 통합 헌법.</p>
              <div className="mt-8 flex items-center gap-2 text-yellow-500 font-mono text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                ENTER THE CORE ➔
              </div>
            </div>
          </Link>

          {/* The Pulse: Daily Chronicle */}
          <Link href="/timeline" className="group">
            <div className="abyssal-glass abyssal-border rounded-[2.5rem] p-10 h-full hover:border-abyssal-accent/50 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-abyssal-accent/10 flex items-center justify-center text-abyssal-accent mb-8 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.1)]">
                <History size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-abyssal-accent transition-colors">The Pulse</h3>
              <p className="text-slate-400 leading-relaxed font-light">가재 군단이 매일 격돌하고 합의하는 지능의 박동, 실시간 연대기.</p>
              <div className="mt-8 flex items-center gap-2 text-abyssal-accent font-mono text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW TIMELINE ➔
              </div>
            </div>
          </Link>

          {/* The Will: CEO Command */}
          <Link href="/timeline?filter=command" className="group">
            <div className="abyssal-glass abyssal-border rounded-[2.5rem] p-10 h-full hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-8 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <Terminal size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-500 transition-colors">The Will</h3>
              <p className="text-slate-400 leading-relaxed font-light">시스템의 방향을 결정짓는 대표님의 지엄한 명령 레이어.</p>
              <div className="mt-8 flex items-center gap-2 text-purple-500 font-mono text-xs font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                COMMAND CENTER ➔
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Real-time Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity">
        <div className="abyssal-glass abyssal-border rounded-3xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-green-500" size={24} />
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-widest">INTEGRITY</p>
              <p className="text-sm font-bold">Sentinel Active</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        
        <div className="abyssal-glass abyssal-border rounded-3xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Cpu className="text-purple-500" size={24} />
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-widest">COGNITION</p>
              <p className="text-sm font-bold">12 Nodes Connected</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
        </div>

        <div className="abyssal-glass abyssal-border rounded-3xl p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Zap className="text-abyssal-accent" size={24} />
            <div>
              <p className="text-xs text-slate-500 font-bold tracking-widest">VELOCITY</p>
              <p className="text-sm font-bold">Progress 80.7%</p>
            </div>
          </div>
          <div className="h-1 w-20 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-abyssal-accent w-[80.7%]" />
          </div>
        </div>
      </div>
    </div>
  );
}

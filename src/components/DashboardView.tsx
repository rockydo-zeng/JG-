import React from 'react';
import { WBSTask, EVMMetrics, FaultReport, User } from '../types/project';
import { getEVMRecommendation } from '../utils/evm';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldCheck,
  Zap,
  DollarSign,
  Activity,
  ArrowRight,
  ChevronRight,
  FileText,
  Building2,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  currentUser: User;
  tasks: WBSTask[];
  evm: EVMMetrics;
  sCurveData: { date: string; pvCum: number; evCum: number; acCum: number }[];
  faults: FaultReport[];
  users: User[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  tasks,
  evm,
  sCurveData,
  faults,
  users,
  onNavigateTab,
}) => {
  const recommendation = getEVMRecommendation(evm);

  // Critical path tasks
  const criticalTasks = tasks.filter((t) => t.isCritical);

  // Process group completion calculation
  const processGroupStats = [
    { key: 'initiating', label: '1. 启动过程组' },
    { key: 'planning', label: '2. 规划过程组' },
    { key: 'executing', label: '3. 执行过程组' },
    { key: 'monitoring', label: '4. 监控过程组' },
    { key: 'closing', label: '5. 收尾过程组' },
  ].map((pg) => {
    const pgTasks = tasks.filter((t) => t.processGroup === pg.key);
    const avgProgress =
      pgTasks.length > 0
        ? Math.round(
            pgTasks.reduce((acc, curr) => acc + curr.progress, 0) / pgTasks.length
          )
        : 0;
    return {
      ...pg,
      count: pgTasks.length,
      progress: avgProgress,
    };
  });

  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="dashboard" />

      {/* Top Banner: Role-Tailored Decision Notice */}
      <div
        className={`p-5 rounded-2xl border ${
          recommendation.level === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : recommendation.level === 'warning'
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
        } shadow-lg relative overflow-hidden`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                {recommendation.level === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                ) : recommendation.level === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                )}
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {currentUser.role === 'EXECUTIVE'
                    ? '集团决策层 - 研制绩效与战略成本指导'
                    : currentUser.role === 'QA'
                    ? '质量保障部 - 军工双归零质量风险报告'
                    : currentUser.role === 'ARCHITECT'
                    ? '总师办 - 技术基线与实时架构控制'
                    : currentUser.role === 'ENGINEER'
                    ? '研发中心 - 任务执行与工效进展'
                    : '项目指挥部 - EVM 挣值综合决策建议'}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  某兵器军工专用平台建设项目 - {recommendation.headline}
                </h2>
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-xs sm:text-sm pl-11 text-slate-300 list-disc list-inside">
              {recommendation.details.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Health Score Gauge Box */}
          <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-800 p-4 rounded-xl min-w-[190px] justify-center">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">研制健康度综合得分</div>
              <div
                className={`text-3xl font-black ${
                  evm.healthScore >= 80
                    ? 'text-emerald-400'
                    : evm.healthScore >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {evm.healthScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                SPI {evm.spi} | CPI {evm.cpi}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EVM Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PV */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start text-xs text-slate-400">
            <span>计划值 (PV)</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white mt-1">
            ¥{(evm.pv / 10000).toFixed(1)} <span className="text-xs text-slate-400">万</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">按研制计划的计划预算累计</div>
        </div>

        {/* EV */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start text-xs text-slate-400">
            <span>挣值 (EV)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            ¥{(evm.ev / 10000).toFixed(1)} <span className="text-xs text-slate-400">万</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">实际完成战术节点工效价值</div>
        </div>

        {/* AC */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start text-xs text-slate-400">
            <span>实际成本 (AC)</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            ¥{(evm.ac / 10000).toFixed(1)} <span className="text-xs text-slate-400">万</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">财务与工时实际支出成本</div>
        </div>

        {/* Variances SV & CV */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>进度偏差 (SV)</span>
              <span className={evm.sv >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {evm.sv >= 0 ? '+' : ''}{(evm.sv / 10000).toFixed(1)}万
              </span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
              <span>成本偏差 (CV)</span>
              <span className={evm.cv >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {evm.cv >= 0 ? '+' : ''}{(evm.cv / 10000).toFixed(1)}万
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 mt-2 flex justify-between font-mono">
            <span>SPI: {evm.spi}</span>
            <span>CPI: {evm.cpi}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: EVM S-Curve & Process Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EVM S-Curve Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-cyan-400" />
                某兵器专用平台研制 EVM 挣值 S-曲线 (PV vs EV vs AC)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                精确对比计划价值(PV)、完成价值(EV)与实际支出成本(AC)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('evm')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center"
            >
              深度分析 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `¥${(val / 10000).toFixed(0)}万`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`¥${(Number(value) / 10000).toFixed(1)}万`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="pvCum"
                  name="计划价值 PV"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorPv)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="evCum"
                  name="挣值 EV"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorEv)"
                  strokeWidth={2.5}
                />
                <Area
                  type="monotone"
                  dataKey="acCum"
                  name="实际成本 AC"
                  stroke="#f59e0b"
                  fillOpacity={1}
                  fill="url(#colorAc)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Process Group Execution Status (1 col) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center mb-4">
              <Zap className="w-4 h-4 mr-2 text-indigo-400" />
              PMBOK 五大过程组研制推进
            </h3>

            <div className="space-y-3">
              {processGroupStats.map((pg) => (
                <div key={pg.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{pg.label}</span>
                    <span className="text-slate-400">
                      {pg.progress}% ({pg.count}项任务)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pg.progress === 100
                          ? 'bg-emerald-500'
                          : pg.progress > 50
                          ? 'bg-blue-500'
                          : pg.progress > 0
                          ? 'bg-amber-500'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${pg.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>研制总任务数: {tasks.length} 项</span>
            <button
              onClick={() => onNavigateTab('wbs')}
              className="text-blue-400 hover:underline flex items-center"
            >
              查看 WBS 详情 <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section: CPM Critical Path & Quality Zeroing Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CPM Critical Path Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-rose-400" />
              关键路径任务网络 (CPM Total Float = 0)
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
              {criticalTasks.length} 项关键战术任务
            </span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {criticalTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-slate-950/80 border border-rose-900/40 rounded-xl flex items-center justify-between hover:border-rose-500/50 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-rose-400 font-bold">
                      [{t.wbsCode}]
                    </span>
                    <span className="text-xs text-slate-200 font-medium">{t.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                    <span>工期: {t.durationDays}天</span>
                    <span>最早开始: Day {t.earlyStart}</span>
                    <span>总时差: {t.totalFloat}天</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-400">{t.progress}%</div>
                  <div className="text-[10px] text-slate-500">{t.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Fault & Zeroing Review Status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-amber-400" />
              军工故障双归零评审进度 (CAPA)
            </h3>
            <button
              onClick={() => onNavigateTab('quality')}
              className="text-xs text-amber-400 hover:underline flex items-center"
            >
              管理归零评审 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {faults.map((f) => {
              // Count completed zeroing standards
              const tzCount = Object.values(f.techZeroing).filter((v) => v === true).length;
              const mzCount = Object.values(f.mgmtZeroing).filter((v) => v === true).length;

              return (
                <div
                  key={f.id}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          f.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {f.code}
                      </span>
                      <span className="text-xs font-medium text-slate-200 line-clamp-1">
                        {f.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {f.status === 'tech_zeroing' ? '技术归零中' : f.status === 'mgmt_zeroing' ? '管理归零中' : '排查中'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                      技术归零 (5条): <span className="font-bold text-cyan-400">{tzCount}/5</span> 已确认
                    </div>
                    <div className="bg-slate-900/90 p-1.5 rounded border border-slate-800">
                      管理归零 (5条): <span className="font-bold text-amber-400">{mzCount}/5</span> 已确认
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

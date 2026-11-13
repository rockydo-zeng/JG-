import React, { useState } from 'react';
import { EVMMetrics, WBSTask, User } from '../types/project';
import { getEVMRecommendation } from '../utils/evm';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';
import {
  TrendingUp,
  Activity,
  DollarSign,
  AlertTriangle,
  Sliders,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface EVMViewProps {
  currentUser: User;
  evm: EVMMetrics;
  sCurveData: { date: string; pvCum: number; evCum: number; acCum: number }[];
  tasks: WBSTask[];
}

export const EVMView: React.FC<EVMViewProps> = ({ currentUser, evm, sCurveData, tasks }) => {
  const [productivitySim, setProductivitySim] = useState(100); // 100% baseline, range 70% to 130%
  const [costMultiplierSim, setCostMultiplierSim] = useState(100); // 100% baseline, range 80% to 150%

  // Simulated metrics based on sliders
  const simSpi = Number((evm.spi * (productivitySim / 100)).toFixed(2));
  const simCpi = Number((evm.cpi * (100 / costMultiplierSim)).toFixed(2));
  const simEac = Math.round(simCpi > 0 ? evm.bac / simCpi : evm.bac);
  const simEtc = Math.max(0, simEac - evm.ac);
  const simVac = evm.bac - simEac;

  const recommendation = getEVMRecommendation({
    ...evm,
    spi: simSpi,
    cpi: simCpi,
    eac: simEac,
  });

  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="evm" />

      {/* EVM Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
            EVM 挣值管理分析与完工预测 (Earned Value Management)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            符合 ANSI/EIA-748 挣值管理标准，精确把控进度偏差 (SV)、成本偏差 (CV) 与完工估算 (EAC)
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500">完工预算 BAC:</span>{' '}
            <span className="text-slate-200 font-bold">¥{(evm.bac / 10000).toFixed(1)}万</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500">预测完工成本 EAC:</span>{' '}
            <span className="text-amber-400 font-bold">¥{(simEac / 10000).toFixed(1)}万</span>
          </div>
        </div>
      </div>

      {/* 4 Primary Formula Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* SV Schedule Variance */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>进度偏差 (SV = EV - PV)</span>
            {evm.sv >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="text-2xl font-bold mt-2 font-mono">
            <span className={evm.sv >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {evm.sv >= 0 ? '+' : ''}¥{(evm.sv / 10000).toFixed(2)} <span className="text-xs text-slate-400">万</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {evm.sv >= 0 ? '进度超前 (EV > PV)' : '进度滞后 (EV < PV)'}
          </div>
        </div>

        {/* SPI Schedule Performance Index */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>进度绩效指数 (SPI = EV / PV)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold mt-2 font-mono">
            <span className={evm.spi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}>
              {simSpi.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            基准 1.00 ({simSpi >= 1.0 ? '按期/超前推进' : '工作效率低于计划'})
          </div>
        </div>

        {/* CV Cost Variance */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>成本偏差 (CV = EV - AC)</span>
            {evm.cv >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="text-2xl font-bold mt-2 font-mono">
            <span className={evm.cv >= 0 ? 'text-emerald-400' : 'text-amber-400'}>
              {evm.cv >= 0 ? '+' : ''}¥{(evm.cv / 10000).toFixed(2)} <span className="text-xs text-slate-400">万</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {evm.cv >= 0 ? '成本节约 (EV > AC)' : '成本超支 (EV < AC)'}
          </div>
        </div>

        {/* CPI Cost Performance Index */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>成本绩效指数 (CPI = EV / AC)</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold mt-2 font-mono">
            <span className={simCpi >= 1.0 ? 'text-emerald-400' : 'text-amber-400'}>
              {simCpi.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            基准 1.00 ({simCpi >= 1.0 ? '资金使用效能良好' : '单位资金价值产出偏低'})
          </div>
        </div>

      </div>

      {/* Main Analysis Chart & Forecast Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Full S-Curve Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-emerald-400" />
                挣值 S-曲线对比与历史演进 (S-Curve Trend)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                蓝色线: PV (计划) | 绿色线: EV (挣值) | 橙色线: AC (实际)
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `¥${(val / 10000).toFixed(0)}万`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`¥${(Number(val) / 10000).toFixed(1)}万`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="pvCum"
                  name="计划价值 PV"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="evCum"
                  name="挣值 EV"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="acCum"
                  name="实际成本 AC"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Forecasting & Scenario Simulation Slider */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center mb-3">
              <Sliders className="w-4 h-4 mr-2 text-indigo-400" />
              情境推演与完工预测 (EAC / ETC / VAC)
            </h3>

            {/* Simulation Sliders */}
            <div className="space-y-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>后续团队生产率系数</span>
                  <span className="font-bold text-blue-400">{productivitySim}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="5"
                  value={productivitySim}
                  onChange={(e) => setProductivitySim(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>后续工时单价/外包成本调整</span>
                  <span className="font-bold text-amber-400">{costMultiplierSim}%</span>
                </div>
                <input
                  type="range"
                  min="80"
                  max="150"
                  step="5"
                  value={costMultiplierSim}
                  onChange={(e) => setCostMultiplierSim(Number(e.target.value))}
                  className="w-full cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Calculated Forecasts */}
            <div className="space-y-2.5 mt-4 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">完工尚需估算 (ETC = EAC - AC)</span>
                <span className="text-slate-200 font-bold">¥{(simEtc / 10000).toFixed(1)}万</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">预测完工成本 (EAC = BAC / CPI)</span>
                <span className="text-amber-400 font-bold">¥{(simEac / 10000).toFixed(1)}万</span>
              </div>

              <div className="flex justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">完工偏差 (VAC = BAC - EAC)</span>
                <span className={simVac >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {simVac >= 0 ? '+' : ''}¥{(simVac / 10000).toFixed(1)}万
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-cyan-400">推演结论:</div>
            <div>{recommendation.headline}</div>
          </div>
        </div>

      </div>

    </div>
  );
};

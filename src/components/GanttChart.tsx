import React, { useState } from 'react';
import { WBSTask, ProcessGroup, KnowledgeArea, User } from '../types/project';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  Layers,
  ChevronRight,
  Info,
  Flag,
  User as UserIcon,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react';

interface GanttChartProps {
  currentUser: User;
  tasks: WBSTask[];
  users: User[];
  onTaskClick: (task: WBSTask) => void;
  selectedProcessGroup: ProcessGroup | 'all';
  selectedKnowledgeArea: KnowledgeArea | 'all';
}

export const GanttChart: React.FC<GanttChartProps> = ({
  currentUser,
  tasks,
  users,
  onTaskClick,
  selectedProcessGroup,
  selectedKnowledgeArea,
}) => {
  const [zoomLevel, setZoomLevel] = useState<'days' | 'weeks' | 'months'>('days');
  const [highlightCriticalOnly, setHighlightCriticalOnly] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedProcessGroup !== 'all' && t.processGroup !== selectedProcessGroup) return false;
    if (selectedKnowledgeArea !== 'all' && t.knowledgeArea !== selectedKnowledgeArea) return false;
    if (highlightCriticalOnly && !t.isCritical) return false;
    return true;
  });

  // Calculate timeline start and end bounds
  const startDate = new Date('2026-06-01');
  const totalDays = 110;

  // Generate date columns for timeline header
  const daysArray: { date: Date; label: string; isWeekend: boolean }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    daysArray.push({
      date: d,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  // Calculate day position (0 to totalDays) for a YYYY-MM-DD date string
  const getDayOffset = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffTime = d.getTime() - startDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const dayWidth = zoomLevel === 'days' ? 24 : zoomLevel === 'weeks' ? 12 : 6;

  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="gantt" />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      
      {/* Gantt Header Controls */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <h2 className="text-sm font-bold text-slate-100 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-cyan-400" />
            甘特图与 CPM 关键网络 (Gantt & Critical Path)
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            红色描边代表 CPM 关键路径 (Total Float = 0)
          </span>
        </div>

        {/* Zoom & Critical Toggle & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <label className="flex items-center space-x-1.5 cursor-pointer bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl text-slate-300">
            <input
              type="checkbox"
              checked={highlightCriticalOnly}
              onChange={(e) => setHighlightCriticalOnly(e.target.checked)}
              className="accent-rose-500 rounded cursor-pointer"
            />
            <span className="text-rose-400 font-semibold">仅看关键路径 ({tasks.filter(t=>t.isCritical).length})</span>
          </label>

          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-slate-300">
            <button
              onClick={() => setZoomLevel('days')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                zoomLevel === 'days' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              日
            </button>
            <button
              onClick={() => setZoomLevel('weeks')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                zoomLevel === 'weeks' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              周
            </button>
            <button
              onClick={() => setZoomLevel('months')}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                zoomLevel === 'months' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800'
              }`}
            >
              月
            </button>
          </div>

          {/* Export Action Group */}
          <div className="flex items-center space-x-1.5 border-l border-slate-800 pl-2">
            <button
              onClick={() => exportToExcel(filteredTasks, '某兵器军工专用平台_甘特图分析表')}
              className="px-2.5 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-xl font-bold flex items-center space-x-1 transition-all"
              title="导出当前甘特图任务数据至 Excel .xls 格式"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>导出 .xls</span>
            </button>

            <button
              onClick={() => exportToPDF(filteredTasks, users, '某兵器军工专用平台建设项目 - 全流程甘特图与CPM关键路径报表')}
              className="px-2.5 py-1.5 bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 rounded-xl font-bold flex items-center space-x-1 transition-all"
              title="导出当前甘特图至 PDF 清晰报表"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>导出 PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Body: Task Table Left + Timeline Right */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[680px] flex">
        
        {/* Left Sticky Task Columns */}
        <div className="w-[320px] sm:w-[380px] min-w-[320px] bg-slate-950 border-r border-slate-800 sticky left-0 z-20 shadow-md flex flex-col">
          {/* Table Header */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-20">
            <span className="w-16">WBS</span>
            <span className="flex-1">任务名称</span>
            <span className="w-16 text-center">工期</span>
            <span className="w-14 text-right">进度</span>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-slate-800/60">
            {filteredTasks.map((t) => {
              const owner = users.find((u) => u.id === t.ownerId);
              return (
                <div
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  className={`h-11 px-3 flex items-center text-xs cursor-pointer hover:bg-slate-800/80 transition-colors ${
                    t.isCritical ? 'bg-rose-950/10' : ''
                  }`}
                >
                  <span
                    className={`w-16 font-mono font-bold ${
                      t.isCritical ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {t.wbsCode}
                  </span>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="truncate font-medium text-slate-200 flex items-center">
                      {t.isMilestone && <Flag className="w-3 h-3 text-amber-400 mr-1 flex-shrink-0" />}
                      <span className="truncate">{t.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {owner?.name || '团队组'}
                    </div>
                  </div>
                  <span className="w-16 text-center text-slate-400">{t.durationDays}天</span>
                  <span
                    className={`w-14 text-right font-bold ${
                      t.progress === 100
                        ? 'text-emerald-400'
                        : t.progress > 0
                        ? 'text-blue-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {t.progress}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Scrollable Timeline */}
        <div className="flex-1 min-w-[800px] bg-slate-900 relative">
          
          {/* Header Row Days */}
          <div className="h-10 bg-slate-950 border-b border-slate-800 flex sticky top-0 z-10">
            {daysArray.map((day, idx) => (
              <div
                key={idx}
                style={{ width: `${dayWidth}px` }}
                className={`flex-shrink-0 h-full border-r border-slate-800/60 text-[10px] flex items-center justify-center font-mono ${
                  day.isWeekend ? 'bg-slate-900/80 text-slate-600' : 'text-slate-400'
                }`}
              >
                {zoomLevel === 'days' ? day.label : idx % 7 === 0 ? day.label : ''}
              </div>
            ))}
          </div>

          {/* Timeline Grid Rows & Task Bars */}
          <div className="relative divide-y divide-slate-800/60">
            {filteredTasks.map((t) => {
              const startOffset = getDayOffset(t.startDate);
              const barWidth = t.durationDays * dayWidth;
              const leftPos = startOffset * dayWidth;

              return (
                <div key={t.id} className="h-11 relative flex items-center hover:bg-slate-800/40">
                  {/* Grid background lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {daysArray.map((day, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${dayWidth}px` }}
                        className={`flex-shrink-0 h-full border-r border-slate-800/30 ${
                          day.isWeekend ? 'bg-slate-950/30' : ''
                        }`}
                      />
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div
                    onClick={() => onTaskClick(t)}
                    style={{
                      left: `${leftPos}px`,
                      width: `${Math.max(16, barWidth)}px`,
                    }}
                    className={`absolute h-6 rounded-md cursor-pointer group transition-all duration-200 flex items-center px-2 text-[11px] font-semibold text-white shadow-md z-10 overflow-hidden ${
                      t.isCritical
                        ? 'bg-rose-600/90 border-2 border-rose-400 shadow-rose-900/50'
                        : t.isMilestone
                        ? 'bg-amber-600/90 border border-amber-400'
                        : 'bg-blue-600/90 border border-blue-400/50'
                    }`}
                  >
                    {/* Inner Progress Shading */}
                    <div
                      style={{ width: `${t.progress}%` }}
                      className="absolute inset-y-0 left-0 bg-white/25 pointer-events-none"
                    />

                    {/* Label inside or floating */}
                    <span className="relative z-10 truncate text-white drop-shadow-sm font-medium">
                      {t.name} ({t.progress}%)
                    </span>
                  </div>

                  {/* Dependency connector hint indicator */}
                  {t.dependencies.length > 0 && (
                    <div
                      style={{ left: `${leftPos - 12}px` }}
                      className="absolute text-[10px] text-slate-500 font-mono pointer-events-none"
                    >
                      ←
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer Legend */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-rose-600 border border-rose-400 inline-block" />
            <span>CPM 关键路径 (零时差)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 border border-blue-400 inline-block" />
            <span>普通规划任务</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>里程碑节点</span>
          </div>
        </div>
        <div className="text-slate-500">
          点击任意任务条查看/修改时间、工时与 CPM 计算浮动时间 (Float)
        </div>
      </div>
    </div>
    </div>
  );
};

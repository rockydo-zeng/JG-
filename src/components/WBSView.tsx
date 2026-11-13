import React, { useState } from 'react';
import {
  WBSTask,
  ProcessGroup,
  KnowledgeArea,
  PROCESS_GROUP_LABELS,
  KNOWLEDGE_AREA_LABELS,
  User,
} from '../types/project';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  AlertCircle,
  CheckCircle2,
  List,
  FolderTree,
  User as UserIcon,
  Filter,
  Network,
  ArrowRight,
  HelpCircle,
  FileSpreadsheet,
  FileText,
  Activity,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

interface WBSViewProps {
  currentUser: User;
  tasks: WBSTask[];
  users: User[];
  onAddTask: (newTask: Partial<WBSTask>) => void;
  onUpdateTask: (task: WBSTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const WBSView: React.FC<WBSViewProps> = ({
  currentUser,
  tasks,
  users,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'tree' | 'diagram'>('table');
  const [filterMyTasksOnly, setFilterMyTasksOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WBSTask | null>(null);

  // Role perspective task filtering
  const displayedTasks = tasks.filter((t) => {
    if (filterMyTasksOnly) {
      return t.ownerId === currentUser.id || t.assignedResourceIds?.includes(currentUser.id);
    }
    return true;
  });

  // Critical tasks sorted by early start / sequence
  const criticalTasks = [...tasks]
    .filter((t) => t.isCritical)
    .sort((a, b) => (a.earlyStart ?? 0) - (b.earlyStart ?? 0));

  // Non-critical tasks sorted by float
  const nonCriticalTasks = [...tasks]
    .filter((t) => !t.isCritical)
    .sort((a, b) => (a.totalFloat ?? 0) - (b.totalFloat ?? 0));

  // New task form state
  const [formData, setFormData] = useState({
    wbsCode: '',
    name: '',
    processGroup: 'planning' as ProcessGroup,
    knowledgeArea: 'scope' as KnowledgeArea,
    ownerId: users[0]?.id || '',
    durationDays: 5,
    startDate: '2026-08-15',
    endDate: '2026-08-20',
    plannedCost: 80000,
    actualCost: 0,
    progress: 0,
    dependencies: [] as string[],
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask(formData);
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onUpdateTask(editingTask);
      setEditingTask(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="wbs" />

      {/* View Header & Action Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <Layers className="w-5 h-5 mr-2 text-blue-400" />
            WBS 工作分解结构与 CPM 关键路径网络 (Scope & Schedule)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            某兵器军工专用平台建设项目 - 按 PMBOK 及 GJB 标准分解交付物，实时计算 CPM 关键路径与浮动时差 (Float)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter my tasks toggle */}
          <button
            onClick={() => setFilterMyTasksOnly(!filterMyTasksOnly)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              filterMyTasksOnly
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>只看我的任务 ({tasks.filter(t => t.ownerId === currentUser.id || t.assignedResourceIds?.includes(currentUser.id)).length})</span>
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all ${
                viewMode === 'table' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>CPM 列表视图</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all ${
                viewMode === 'tree' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>WBS 树状结构</span>
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-all ${
                viewMode === 'diagram' ? 'bg-rose-600 text-white font-bold shadow-lg shadow-rose-600/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>关键路径网络图</span>
            </button>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
            <button
              onClick={() => exportToExcel(displayedTasks, '某兵器军工专用平台_WBS关键路径分析表')}
              className="px-3 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
              title="导出当前 WBS 数据至 Excel .xls 格式"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>导出 .xls</span>
            </button>

            <button
              onClick={() => exportToPDF(displayedTasks, users, '某兵器军工专用平台建设项目 - WBS分解与关键路径分析')}
              className="px-3 py-2 bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
              title="导出当前 WBS 至 PDF 报表"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>导出 PDF</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新增 WBS 任务</span>
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5">WBS 编码</th>
                  <th className="p-3.5">战术任务名称</th>
                  <th className="p-3.5">过程组</th>
                  <th className="p-3.5">知识领域</th>
                  <th className="p-3.5">负责人</th>
                  <th className="p-3.5 text-center">工期</th>
                  <th className="p-3.5 text-right">计划(PV) / 实际(AC)</th>
                  <th className="p-3.5 text-center">CPM 时差 (TF/FF)</th>
                  <th className="p-3.5 text-center">进度</th>
                  <th className="p-3.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {displayedTasks.map((task) => {
                  const owner = users.find((u) => u.id === task.ownerId);
                  const isMine = task.ownerId === currentUser.id || task.assignedResourceIds?.includes(currentUser.id);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        task.isCritical ? 'bg-rose-950/10' : ''
                      } ${isMine ? 'border-l-2 border-l-indigo-500' : ''}`}
                    >
                      {/* WBS Code */}
                      <td className="p-3.5 font-mono font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            task.isCritical
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {task.wbsCode}
                        </span>
                      </td>

                      {/* Name & Badges */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                          <span>{task.name}</span>
                          {task.isCritical && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-600 text-white rounded">
                              关键路径
                            </span>
                          )}
                          {isMine && (
                            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                              与我相关
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>前置: {task.dependencies.length > 0 ? task.dependencies.join(', ') : '无'}</span>
                          <span>•</span>
                          <span>{task.startDate} ~ {task.endDate}</span>
                        </div>
                      </td>

                      {/* Process Group */}
                      <td className="p-3.5">
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                          {PROCESS_GROUP_LABELS[task.processGroup]}
                        </span>
                      </td>

                      {/* Knowledge Area */}
                      <td className="p-3.5">
                        <span className="text-[11px] bg-slate-800/80 text-blue-300 px-2 py-1 rounded-md border border-blue-900/40">
                          {KNOWLEDGE_AREA_LABELS[task.knowledgeArea]}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="p-3.5">
                        <div className="flex items-center space-x-1.5">
                          <img
                            src={owner?.avatar}
                            alt={owner?.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{owner?.name || '未指定'}</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="p-3.5 text-center text-slate-300">
                        {task.durationDays} 天
                      </td>

                      {/* Planned & Actual Cost */}
                      <td className="p-3.5 text-right font-mono">
                        <div className="text-slate-200">¥{(task.plannedCost / 10000).toFixed(1)}万</div>
                        <div className="text-[10px] text-amber-400">
                          实际: ¥{(task.actualCost / 10000).toFixed(1)}万
                        </div>
                      </td>

                      {/* CPM Float Metrics */}
                      <td className="p-3.5 text-center font-mono text-[11px]">
                        <div
                          className={`font-bold ${
                            task.isCritical ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          TF: {task.totalFloat ?? 0}d | FF: {task.freeFloat ?? 0}d
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ES:{task.earlyStart}d / EF:{task.earlyFinish}d
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="p-3.5 text-center">
                        <div className="font-bold text-slate-200 mb-1">{task.progress}%</div>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                          <div
                            className={`h-full ${
                              task.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg"
                            title="编辑任务"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                            title="删除任务"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tree View */}
      {viewMode === 'tree' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 mb-2">WBS 树状节点层次分解</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 bg-slate-950 border rounded-xl space-y-2 relative overflow-hidden ${
                  task.isCritical
                    ? 'border-rose-500/50 shadow-rose-950/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-400">
                    WBS {task.wbsCode}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.isCritical
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {task.isCritical ? '关键路径' : '普通路径'}
                  </span>
                </div>

                <div className="text-sm font-bold text-slate-100">{task.name}</div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>{PROCESS_GROUP_LABELS[task.processGroup]}</span>
                  <span>{task.durationDays} 天</span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical Path Network Diagram View */}
      {viewMode === 'diagram' && (
        <div className="space-y-6">
          {/* Critical Path Sequential Flowchart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center">
                  <Network className="w-5 h-5 text-rose-500 mr-2" />
                  关键路径拓扑网络图 (Critical Path Sequential Flow)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  按最早开始时间 (ES) 顺序展现贯穿项目生命周期的全量关键节点，所有关键节点总时差与自由时差均为 0
                </p>
              </div>
              <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>关键路径任务数: {criticalTasks.length} 项 (总工期 102 天)</span>
              </span>
            </div>

            {/* Horizontal / Grid Flowchart Cards */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-300 flex items-center">
                <Activity className="w-4 h-4 mr-1.5 text-rose-400" />
                <span>战术任务依赖时序链 (Start → End):</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalTasks.map((task, idx) => {
                  const owner = users.find((u) => u.id === task.ownerId);

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-950 border-2 border-rose-500/40 rounded-2xl p-4 space-y-3 relative shadow-lg shadow-rose-950/20 group hover:border-rose-500 transition-all"
                    >
                      {/* Step Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="font-mono font-bold text-xs text-rose-400">
                            WBS {task.wbsCode}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold rounded-md">
                          TF = 0d (零时差)
                        </span>
                      </div>

                      {/* Task Name */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-rose-300 transition-colors">
                          {task.name}
                        </h4>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{task.startDate} ~ {task.endDate}</span>
                          <span className="text-slate-500">({task.durationDays} 天)</span>
                        </div>
                      </div>

                      {/* Process & Owner */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                        <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-slate-400">
                          {PROCESS_GROUP_LABELS[task.processGroup]}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <img
                            src={owner?.avatar}
                            alt={owner?.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="text-slate-300 text-[11px]">{owner?.name || '未分配'}</span>
                        </div>
                      </div>

                      {/* CPM Floating Math */}
                      <div className="bg-slate-900/80 p-2 rounded-xl text-[10px] font-mono text-slate-400 flex justify-between items-center border border-slate-800">
                        <span>ES:{task.earlyStart}d / EF:{task.earlyFinish}d</span>
                        <span className="text-rose-400 font-bold">LS:{task.lateStart}d / LF:{task.lateFinish}d</span>
                      </div>

                      {/* Next Arrow Indicator */}
                      {idx < criticalTasks.length - 1 && (
                        <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900 border border-rose-500/50 p-1 rounded-full text-rose-400 shadow-md">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Non-Critical Path Comparison Section */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-emerald-400" />
              非关键路径任务 (具备时差缓冲与进度弹性)
            </h3>
            <p className="text-xs text-slate-400">
              以下任务具备总时差 (Total Float &gt; 0)，在浮动天数范围内延迟调整不会影响项目总体交付日期
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {nonCriticalTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400 font-bold">WBS {task.wbsCode}</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                      时差缓冲 TF = {task.totalFloat} 天
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200">{task.name}</div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>工期: {task.durationDays} 天</span>
                    <span>自由时差 FF: {task.freeFloat} 天</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "Why is this the Critical Path?" Deep Analysis Panel */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-rose-900/40 p-6 rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center">
                  为什么该路径是关键路径？(Critical Path Analysis & Decision Logic)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  PMBOK 关键路径法 (CPM) 理论公式与某兵器军工专用平台建设项目的工程判定解析
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Card 1 */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5" />
                  1. 数学判读条件 (Total Float = 0)
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  经过 CPM 正向推算（Forward Pass，确定 ES/EF）与反向推算（Backward Pass，确定 LS/LF），关键路径上所有任务节点的<strong className="text-rose-300">总时差 (Total Float = LS - ES) 与自由时差 (Free Float) 均等于 0</strong>。这意味着最早开始时间严格等于最迟开始时间，没有任何时间宽度冗余。
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="font-bold text-amber-400 flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1.5" />
                  2. 专用平台交付瓶颈链 (Completion Date Bottleneck)
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  关键路径是贯穿启动至收尾的<strong className="text-slate-100">最长依赖路径链</strong>（立项 → SRS规格书 → 总体架构基线 → 战术多源融合算法 → 质量双归零评审 → PBL军检终验），链条总时长决定了项目最短工期（102天，预计 2026-09-10 竣工）。该链条上任何一个关键节点的延误都将 <strong className="text-rose-400">1:1 直接推迟专用平台的总交付时间</strong>。
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="font-bold text-blue-400 flex items-center">
                  <Network className="w-4 h-4 mr-1.5" />
                  3. 逻辑强依赖与时差弹性对比 (Slack Comparison)
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  非关键节点（如 WBS 2.4 『加固硬件采购规程』Total Float = 11天）具备机动缓冲，即使由于供应链推迟 5 天也不会推迟终验交付；而关键节点如 WBS 3.1 『战术多源融合算法』为后续『质量双归零评审』的前置强约束，一旦延误全盘后推。
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="font-bold text-emerald-400 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  4. GJB-9001C 质量管控与资源保全指导
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  依据军工质量管理体系，项目总指挥张立明与平台总设计师陈威博士需对关键路径节点实施 <strong className="text-emerald-300">最高优先级资源倾斜与零延误闭环管控</strong>，确保战术多源融合算法研发与双归零评审顺利通过。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">新增 WBS 任务节点</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">WBS 编码 (如 2.5)</label>
                <input
                  type="text"
                  required
                  value={formData.wbsCode}
                  onChange={(e) => setFormData({ ...formData, wbsCode: e.target.value })}
                  placeholder="2.5"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">任务名称</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入任务名称"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">过程组</label>
                  <select
                    value={formData.processGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, processGroup: e.target.value as ProcessGroup })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  >
                    {(Object.keys(PROCESS_GROUP_LABELS) as ProcessGroup[]).map((pg) => (
                      <option key={pg} value={pg}>
                        {PROCESS_GROUP_LABELS[pg]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">知识领域</label>
                  <select
                    value={formData.knowledgeArea}
                    onChange={(e) =>
                      setFormData({ ...formData, knowledgeArea: e.target.value as KnowledgeArea })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  >
                    {(Object.keys(KNOWLEDGE_AREA_LABELS) as KnowledgeArea[]).map((ka) => (
                      <option key={ka} value={ka}>
                        {KNOWLEDGE_AREA_LABELS[ka]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">负责人</label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">工期 (天)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) =>
                      setFormData({ ...formData, durationDays: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">计划成本 PV (元)</label>
                  <input
                    type="number"
                    value={formData.plannedCost}
                    onChange={(e) =>
                      setFormData({ ...formData, plannedCost: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">当前完成度 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) =>
                      setFormData({ ...formData, progress: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                >
                  保存创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              编辑任务: {editingTask.wbsCode} {editingTask.name}
            </h3>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">任务名称</label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">工期 (天)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingTask.durationDays}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, durationDays: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">进度 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingTask.progress}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, progress: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">计划成本 PV (元)</label>
                  <input
                    type="number"
                    value={editingTask.plannedCost}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, plannedCost: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">实际花费 AC (元)</label>
                  <input
                    type="number"
                    value={editingTask.actualCost}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, actualCost: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

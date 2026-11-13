import React from 'react';
import {
  UserRole,
  User,
  ProcessGroup,
  KnowledgeArea,
  PROCESS_GROUP_LABELS,
  KNOWLEDGE_AREA_LABELS,
} from '../types/project';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  selectedProcessGroup: ProcessGroup | 'all';
  onSelectProcessGroup: (pg: ProcessGroup | 'all') => void;
  selectedKnowledgeArea: KnowledgeArea | 'all';
  onSelectKnowledgeArea: (ka: KnowledgeArea | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  selectedProcessGroup,
  onSelectProcessGroup,
  selectedKnowledgeArea,
  onSelectKnowledgeArea,
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'dashboard', label: '决策概览', icon: '📊' },
    { id: 'gantt', label: '甘特图网络', icon: '📅' },
    { id: 'wbs', label: 'WBS & 关键路径', icon: '🌳' },
    { id: 'evm', label: 'EVM 挣值分析', icon: '📈' },
    { id: 'resource', label: '资源矩阵', icon: '👥' },
    { id: 'quality', label: '质量双归零评审', icon: '🛡️' },
    { id: 'baseline', label: '技术状态 (CCB)', icon: '⚙️' },
    { id: 'audit', label: '权限与审计追踪', icon: '📜' },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Project Info */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-bold text-cyan-400 text-xl tracking-wider">
                全
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate">
                  全流程项目管理系统
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full flex-shrink-0">
                  GJB-9001C / 航天军工标准
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center space-x-2 truncate">
                <span className="flex items-center text-cyan-300 font-medium">
                  <Building2 className="w-3 h-3 mr-1 text-cyan-400" /> 杜增辉-AI智能感知平台
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:inline flex items-center text-slate-300">
                  <Calendar className="w-3 h-3 mr-1 text-slate-500" /> 某兵器军工专用平台建设项目 (预算: ¥2,800,000)
                </span>
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索 WBS / 战术任务 / 归零报告 / 基线..."
              className="w-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-200 pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
          </div>

          {/* User Role Switcher & System Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-400 hidden sm:inline">视角:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const u = allUsers.find((user) => user.id === e.target.value);
                  if (u) onSelectUser(u);
                }}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-800 text-slate-200">
                    {u.name} ({u.role === 'PM' ? '项目总指挥' : u.role === 'ARCHITECT' ? '平台总师' : u.role === 'QA' ? '质量总监' : u.role === 'ENGINEER' ? '研发工程师' : '集团高管'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-blue-500/50 object-cover"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-blue-400">{currentUser.department}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-slate-950/90 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <nav className="flex space-x-1 py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Process Group & Knowledge Area quick filter badges */}
          <div className="hidden xl:flex items-center space-x-2 py-1 text-xs">
            <span className="text-slate-500 flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1" /> 过滤:
            </span>
            <select
              value={selectedProcessGroup}
              onChange={(e) => onSelectProcessGroup(e.target.value as ProcessGroup | 'all')}
              className="bg-slate-800/90 border border-slate-700 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">所有过程组 (5)</option>
              {(Object.keys(PROCESS_GROUP_LABELS) as ProcessGroup[]).map((pg) => (
                <option key={pg} value={pg}>
                  {PROCESS_GROUP_LABELS[pg]}
                </option>
              ))}
            </select>

            <select
              value={selectedKnowledgeArea}
              onChange={(e) => onSelectKnowledgeArea(e.target.value as KnowledgeArea | 'all')}
              className="bg-slate-800/90 border border-slate-700 text-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">所有知识领域 (10)</option>
              {(Object.keys(KNOWLEDGE_AREA_LABELS) as KnowledgeArea[]).map((ka) => (
                <option key={ka} value={ka}>
                  {KNOWLEDGE_AREA_LABELS[ka]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

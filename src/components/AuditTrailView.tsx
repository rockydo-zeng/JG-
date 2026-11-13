import React, { useState } from 'react';
import { AuditLog, UserRole, User } from '../types/project';
import { History, Shield, Lock, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';

interface AuditTrailViewProps {
  currentUser: User;
  logs: AuditLog[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ currentUser, logs }) => {
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [filterText, setFilterText] = useState('');

  const filteredLogs = logs.filter((log) => {
    if (filterRole !== 'all' && log.operatorRole !== filterRole) return false;
    if (filterText) {
      const q = filterText.toLowerCase();
      return (
        log.operatorName.toLowerCase().includes(q) ||
        log.targetModule.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // RBAC permissions matrix definition
  const rbacMatrix = [
    {
      module: 'WBS & 关键路径 (Scope/Schedule)',
      PM: '读/写/CPM计算',
      ARCHITECT: '读/写架构任务',
      ENGINEER: '读/更新进度',
      QA: '只读',
      EXECUTIVE: '只读高管概览',
    },
    {
      module: 'EVM 挣值分析与成本 (Cost)',
      PM: '完全控制',
      ARCHITECT: '只读',
      ENGINEER: '只读工时',
      QA: '只读',
      EXECUTIVE: '完全控制与审批',
    },
    {
      module: '质量故障与归零评审 (Quality/CAPA)',
      PM: '管理归零审批',
      ARCHITECT: '技术归零签署',
      ENGINEER: '原因排查与CAPA',
      QA: '质量归零主导',
      EXECUTIVE: '复核封闭',
    },
    {
      module: '技术状态与 CCB 变更 (Baseline)',
      PM: 'CCB 表决权',
      ARCHITECT: '基线版本定义',
      ENGINEER: '提交变更申请',
      QA: '基线审核',
      EXECUTIVE: 'CCB 最终裁决权',
    },
    {
      module: '审计日志与权限 (Audit)',
      PM: '只读所有日志',
      ARCHITECT: '只读',
      ENGINEER: '只读',
      QA: '只读质量审计',
      EXECUTIVE: '只读/导出一级审计',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="audit" />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <History className="w-5 h-5 mr-2 text-indigo-400" />
            多维度权限控制 (RBAC) 与全面审计追踪日志 (Audit Trail)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            不可篡改的全过程操作轨迹记录，支持按人员、角色、操作模块追溯审计
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
          累计审计记录: <span className="text-blue-400 font-bold">{logs.length} 条</span>
        </div>
      </div>

      {/* RBAC Matrix Cards */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
          <Shield className="w-4 h-4 mr-1.5 text-cyan-400" />
          多维度角色权限控制矩阵 (Role-Based Access Control)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3">功能模块</th>
                <th className="p-3 text-blue-400">项目经理 (PM)</th>
                <th className="p-3 text-indigo-400">系统架构师 (ARCHITECT)</th>
                <th className="p-3 text-emerald-400">工程师 (ENGINEER)</th>
                <th className="p-3 text-amber-400">质量工程师 (QA)</th>
                <th className="p-3 text-purple-400">决策层 (EXECUTIVE)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {rbacMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-200">{row.module}</td>
                  <td className="p-3 text-blue-300">{row.PM}</td>
                  <td className="p-3 text-indigo-300">{row.ARCHITECT}</td>
                  <td className="p-3 text-emerald-300">{row.ENGINEER}</td>
                  <td className="p-3 text-amber-300">{row.QA}</td>
                  <td className="p-3 text-purple-300">{row.EXECUTIVE}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Bar & Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            全面操作审计追踪日志 (Real-time Audit Logs)
          </h3>

          <div className="flex items-center space-x-3 text-xs w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="过滤姓名、模块或关键字..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 pl-8 pr-3 py-1.5 rounded-lg text-xs"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs"
            >
              <option value="all">所有角色</option>
              <option value="PM">PM</option>
              <option value="ARCHITECT">ARCHITECT</option>
              <option value="ENGINEER">ENGINEER</option>
              <option value="QA">QA</option>
              <option value="EXECUTIVE">EXECUTIVE</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3">时间戳</th>
                <th className="p-3">操作人</th>
                <th className="p-3">角色</th>
                <th className="p-3">动作</th>
                <th className="p-3">目标模块</th>
                <th className="p-3">详细变更说明</th>
                <th className="p-3 text-right">IP 地址</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="p-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3 font-bold text-slate-200 whitespace-nowrap">
                    {log.operatorName}
                  </td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-bold text-[10px]">
                      {log.operatorRole}
                    </span>
                  </td>
                  <td className="p-3 text-amber-400 font-bold whitespace-nowrap">{log.action}</td>
                  <td className="p-3 text-cyan-300 font-sans">{log.targetModule}</td>
                  <td className="p-3 text-slate-300 font-sans max-w-xs truncate">{log.details}</td>
                  <td className="p-3 text-right text-slate-500">{log.ipAddress || '192.168.1.100'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

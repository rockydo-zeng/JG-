import React, { useState } from 'react';
import {
  FaultReport,
  TechnicalZeroing,
  ManagementZeroing,
  User,
  WBSTask,
} from '../types/project';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';
import {
  ShieldCheck,
  AlertTriangle,
  CheckSquare,
  Square,
  Plus,
  FileCheck,
  UserCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

interface QualityZeroingViewProps {
  currentUser: User;
  faults: FaultReport[];
  users: User[];
  tasks: WBSTask[];
  onUpdateFault: (fault: FaultReport, auditMessage: string) => void;
  onCreateFault: (fault: Partial<FaultReport>) => void;
}

export const QualityZeroingView: React.FC<QualityZeroingViewProps> = ({
  currentUser,
  faults,
  users,
  onUpdateFault,
  onCreateFault,
}) => {
  const [selectedFaultId, setSelectedFaultId] = useState<string>(faults[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentFault = faults.find((f) => f.id === selectedFaultId) || faults[0];

  // New Fault Form State
  const [newFault, setNewFault] = useState({
    title: '',
    severity: 'high' as const,
    category: 'software' as const,
    description: '',
    assignedToId: users[1]?.id || '',
    rootCause: '',
    correctiveAction: '',
  });

  const handleToggleTechCriteria = (key: keyof TechnicalZeroing) => {
    if (!currentFault || typeof currentFault.techZeroing[key] !== 'boolean') return;

    const currentVal = currentFault.techZeroing[key] as boolean;
    const updatedTech = {
      ...currentFault.techZeroing,
      [key]: !currentVal,
    };

    // Calculate if all 5 technical criteria are completed
    const allTechDone =
      updatedTech.accurateLocalization &&
      updatedTech.clearMechanism &&
      updatedTech.problemReproduce &&
      updatedTech.effectiveAction &&
      updatedTech.drawLessons;

    const newStatus = allTechDone
      ? currentFault.status === 'open' || currentFault.status === 'investigating'
        ? 'mgmt_zeroing'
        : currentFault.status
      : 'tech_zeroing';

    const updatedFault: FaultReport = {
      ...currentFault,
      techZeroing: updatedTech,
      status: newStatus,
    };

    const criteriaNames: Record<string, string> = {
      accurateLocalization: '定位准确',
      clearMechanism: '机理清楚',
      problemReproduce: '问题复现',
      effectiveAction: '措施有效',
      drawLessons: '举一反三',
    };

    onUpdateFault(
      updatedFault,
      `修改故障报告 [${currentFault.code}] 技术归零项 [${criteriaNames[key]}] 状态为 ${
        !currentVal ? '通过' : '未通过'
      }`
    );
  };

  const handleToggleMgmtCriteria = (key: keyof ManagementZeroing) => {
    if (!currentFault || typeof currentFault.mgmtZeroing[key] !== 'boolean') return;

    const currentVal = currentFault.mgmtZeroing[key] as boolean;
    const updatedMgmt = {
      ...currentFault.mgmtZeroing,
      [key]: !currentVal,
    };

    // Calculate if both technical and management zeroing are completely done
    const allMgmtDone =
      updatedMgmt.clearResponsibility &&
      updatedMgmt.measuresImplemented &&
      updatedMgmt.seriousDiscipline &&
      updatedMgmt.improveRegulations &&
      updatedMgmt.strengthenSystem;

    const allTechDone = Object.values(currentFault.techZeroing).every((v) => v === true);

    const newStatus = allMgmtDone && allTechDone ? 'closed' : 'mgmt_zeroing';

    const updatedFault: FaultReport = {
      ...currentFault,
      mgmtZeroing: updatedMgmt,
      status: newStatus,
    };

    const criteriaNames: Record<string, string> = {
      clearResponsibility: '责任明确',
      measuresImplemented: '措施落实',
      seriousDiscipline: '严肃处理',
      improveRegulations: '完善规章',
      strengthenSystem: '健全制度',
    };

    onUpdateFault(
      updatedFault,
      `修改故障报告 [${currentFault.code}] 管理归零项 [${criteriaNames[key]}] 状态为 ${
        !currentVal ? '通过' : '未通过'
      }`
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateFault(newFault);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="quality" />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2 text-amber-400" />
            项目故障报告与归零评审系统 (CAPA & Zeroing Review)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            严格遵循航天级双五条质量归零标准：技术归零（定位准确、机理清楚、问题复现、措施有效、举一反三）与管理归零
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>登记质量故障/异常</span>
        </button>
      </div>

      {/* Main Grid: Fault List Left + Zeroing Review Checklist Right */}
      {currentFault && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Fault List (1 col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              异常故障清单 ({faults.length})
            </h3>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {faults.map((f) => {
                const isSelected = f.id === currentFault.id;
                const reporter = users.find((u) => u.id === f.reporterId);

                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFaultId(f.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-lg'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400 text-xs">{f.code}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          f.status === 'closed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {f.status === 'closed'
                          ? '已被完全归零封闭'
                          : f.status === 'tech_zeroing'
                          ? '技术归零中'
                          : f.status === 'mgmt_zeroing'
                          ? '管理归零中'
                          : '排查处理中'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-100 mt-1 line-clamp-1">
                      {f.title}
                    </div>

                    <div className="text-[10px] text-slate-500 mt-2 flex justify-between">
                      <span>报告人: {reporter?.name || 'QA工效'}</span>
                      <span>{f.reportDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fault Details & Zeroing Approval Boards (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Fault Overview Info Card */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono font-bold text-amber-400">
                      [{currentFault.code}]
                    </span>
                    <h3 className="text-base font-bold text-slate-100">{currentFault.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1.5">{currentFault.description}</p>
                </div>

                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${
                    currentFault.severity === 'critical'
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-600 text-slate-950'
                  }`}
                >
                  {currentFault.severity} 级别
                </span>
              </div>

              {/* Root Cause & Corrective Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1">故障机理定位 (Root Cause):</span>
                  <p className="text-slate-200">{currentFault.rootCause || '分析排查中...'}</p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-1">纠正与预防措施 (CAPA):</span>
                  <p className="text-slate-200">{currentFault.correctiveAction || '拟定措施中...'}</p>
                </div>
              </div>
            </div>

            {/* Technical Zeroing 5 Criteria Board */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center">
                    <FileCheck className="w-4 h-4 mr-2 text-cyan-400" />
                    技术归零“五条标准”评审 (Technical Zeroing Standard)
                  </h3>
                  <p className="text-xs text-slate-400">
                    逐项确认工程技术机理、问题复现与措施验证
                  </p>
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  {Object.values(currentFault.techZeroing).filter((v) => v === true).length} / 5 完成
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: 'accurateLocalization', label: '1. 定位准确', desc: '准确查明故障发生部位与逻辑单元' },
                  { key: 'clearMechanism', label: '2. 机理清楚', desc: '清晰阐明物理或代码级别的失效机制' },
                  { key: 'problemReproduce', label: '3. 问题复现', desc: '在实验室/测试床成功按原条件复现' },
                  { key: 'effectiveAction', label: '4. 措施有效', desc: '纠正措施经二次验证无再次发生' },
                  { key: 'drawLessons', label: '5. 举一反三', desc: '排查其余同类模块并完善测试用例' },
                ].map((item) => {
                  const isChecked = Boolean(currentFault.techZeroing[item.key as keyof TechnicalZeroing]);

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleTechCriteria(item.key as keyof TechnicalZeroing)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        isChecked
                          ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <button className="mt-0.5 focus:outline-none">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div>
                        <div className="font-bold text-slate-100">{item.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Management Zeroing 5 Criteria Board */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-amber-400" />
                    管理归零“五条标准”评审 (Management Zeroing Standard)
                  </h3>
                  <p className="text-xs text-slate-400">
                    责任追究、规章健全与质量体系闭环管理
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {Object.values(currentFault.mgmtZeroing).filter((v) => v === true).length} / 5 完成
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { key: 'clearResponsibility', label: '1. 责任明确', desc: '明确直接责任人与管理连带责任' },
                  { key: 'measuresImplemented', label: '2. 措施落实', desc: '管理整改措施已全面下发执行' },
                  { key: 'seriousDiscipline', label: '3. 严肃处理', desc: '按照质量规范开展问责与吸取教训' },
                  { key: 'improveRegulations', label: '4. 完善规章', desc: '修订设计/开发/测试规范标准文档' },
                  { key: 'strengthenSystem', label: '5. 健全制度', desc: '优化质量监控流程与防错防护机制' },
                ].map((item) => {
                  const isChecked = Boolean(currentFault.mgmtZeroing[item.key as keyof ManagementZeroing]);

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleMgmtCriteria(item.key as keyof ManagementZeroing)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                        isChecked
                          ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <button className="mt-0.5 focus:outline-none">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div>
                        <div className="font-bold text-slate-100">{item.label}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Create Fault Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">登记质量故障 / 异常报告</h3>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">故障标题</label>
                <input
                  type="text"
                  required
                  value={newFault.title}
                  onChange={(e) => setNewFault({ ...newFault, title: e.target.value })}
                  placeholder="例如：系统高负载并发通信超时"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">严重等级</label>
                  <select
                    value={newFault.severity}
                    onChange={(e) => setNewFault({ ...newFault, severity: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  >
                    <option value="critical">Critical (致命)</option>
                    <option value="high">High (严重)</option>
                    <option value="medium">Medium (一般)</option>
                    <option value="low">Low (轻微)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">分配处理人</label>
                  <select
                    value={newFault.assignedToId}
                    onChange={(e) => setNewFault({ ...newFault, assignedToId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">故障现象描述</label>
                <textarea
                  required
                  rows={3}
                  value={newFault.description}
                  onChange={(e) => setNewFault({ ...newFault, description: e.target.value })}
                  placeholder="请输入具体测试触发条件与异常表现..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">初步原因与纠正措施 (CAPA)</label>
                <input
                  type="text"
                  value={newFault.correctiveAction}
                  onChange={(e) => setNewFault({ ...newFault, correctiveAction: e.target.value })}
                  placeholder="拟定的技术修复路径"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  提交登记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import {
  ConfigurationItem,
  ChangeRequest,
  User,
  BaselineType,
} from '../types/project';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';
import {
  Settings,
  GitCommit,
  CheckCircle,
  Clock,
  Plus,
  FileCode,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface TechnicalStateViewProps {
  cis: ConfigurationItem[];
  changes: ChangeRequest[];
  users: User[];
  currentUser: User;
  onApproveChange: (changeId: string, approved: boolean, notes: string) => void;
  onCreateChange: (cr: Partial<ChangeRequest>) => void;
}

export const TechnicalStateView: React.FC<TechnicalStateViewProps> = ({
  cis,
  changes,
  users,
  currentUser,
  onApproveChange,
  onCreateChange,
}) => {
  const [activeTab, setActiveTab] = useState<'baselines' | 'ccb'>('baselines');
  const [isCrModalOpen, setIsCrModalOpen] = useState(false);
  const [newCr, setNewCr] = useState({
    title: '',
    ciId: cis[0]?.id || '',
    reason: '',
    impactAnalysis: '',
  });

  const handleCrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateChange(newCr);
    setIsCrModalOpen(false);
  };

  const getBaselineLabel = (type: BaselineType) => {
    switch (type) {
      case 'functional':
        return '功能基线 (FBL)';
      case 'allocated':
        return '分配基线 (ABL)';
      case 'product':
        return '产品基线 (PBL)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="baseline" />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-cyan-400" />
            技术状态管理与 CCB 变更控制委员会 (Baseline & Configuration Management)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            受控管理功能基线(FBL)、分配基线(ABL)与产品基线(PBL)，严控技术状态变更
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('baselines')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'baselines' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              配置基线库 ({cis.length})
            </button>
            <button
              onClick={() => setActiveTab('ccb')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ccb' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              CCB 变更审查 ({changes.length})
            </button>
          </div>

          <button
            onClick={() => setIsCrModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>提交 CCB 变更申请</span>
          </button>
        </div>
      </div>

      {/* Baseline Items View */}
      {activeTab === 'baselines' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cis.map((ci) => {
            const owner = users.find((u) => u.id === ci.ownerId);

            return (
              <div
                key={ci.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-cyan-400">{ci.code}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ci.status === 'baselined'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ci.status === 'baselined' ? '已基线化受控' : '变更冻结中'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mt-2">{ci.name}</h3>

                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    类型: <span className="text-blue-300">{getBaselineLabel(ci.baselineType)}</span> |
                    版本: <span className="text-slate-200 font-bold">{ci.version}</span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    {ci.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>责任人: {owner?.name || '技术委员会'}</span>
                  <span>基线日期: {ci.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CCB Change Requests View */}
      {activeTab === 'ccb' && (
        <div className="space-y-4">
          {changes.map((cr) => {
            const ci = cis.find((c) => c.id === cr.ciId);
            const applicant = users.find((u) => u.id === cr.applicantId);
            const canApprove = currentUser.role === 'PM' || currentUser.role === 'EXECUTIVE';

            return (
              <div
                key={cr.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-amber-400">{cr.code}</span>
                    <h3 className="text-sm font-bold text-slate-100">{cr.title}</h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      cr.status === 'ccb_approved'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : cr.status === 'ccb_rejected'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {cr.status === 'ccb_approved'
                      ? 'CCB 审核通过'
                      : cr.status === 'ccb_rejected'
                      ? 'CCB 审核驳回'
                      : '待 CCB 评审'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1">变更申请缘由:</span>
                    <p className="text-slate-200">{cr.reason}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-1">影响与风险分析:</span>
                    <p className="text-slate-200">{cr.impactAnalysis}</p>
                  </div>
                </div>

                {/* CCB Voting Action Box */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 gap-3">
                  <div>
                    关联配置项: <span className="text-cyan-400 font-mono font-bold">{ci?.name}</span> |
                    申请人: {applicant?.name} ({cr.appliedDate})
                  </div>

                  {cr.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      {canApprove ? (
                        <>
                          <button
                            onClick={() =>
                              onApproveChange(cr.id, true, `由 ${currentUser.name} CCB 批准`)
                            }
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center space-x-1"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>CCB 批准</span>
                          </button>
                          <button
                            onClick={() =>
                              onApproveChange(cr.id, false, `由 ${currentUser.name} CCB 驳回`)
                            }
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center space-x-1"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>CCB 驳回</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-amber-400 text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                          请切换为项目经理 (PM) 或高管 (EXECUTIVE) 视角执行 CCB 投票
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isCrModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">提交 CCB 变更申请</h3>
            <form onSubmit={handleCrSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">变更主题</label>
                <input
                  type="text"
                  required
                  value={newCr.title}
                  onChange={(e) => setNewCr({ ...newCr, title: e.target.value })}
                  placeholder="例如：修改算法逻辑引入无锁队列"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">关联受控基线项</label>
                <select
                  value={newCr.ciId}
                  onChange={(e) => setNewCr({ ...newCr, ciId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                >
                  {cis.map((ci) => (
                    <option key={ci.id} value={ci.id}>
                      [{ci.code}] {ci.name} ({ci.version})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">变更申请缘由</label>
                <textarea
                  required
                  rows={2}
                  value={newCr.reason}
                  onChange={(e) => setNewCr({ ...newCr, reason: e.target.value })}
                  placeholder="为何需要修改已绑定的受控基线..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">技术与成本影响评估</label>
                <textarea
                  required
                  rows={2}
                  value={newCr.impactAnalysis}
                  onChange={(e) => setNewCr({ ...newCr, impactAnalysis: e.target.value })}
                  placeholder="预计需要增加的工时、预算及回归测试影响范围..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCrModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                >
                  提交申请
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

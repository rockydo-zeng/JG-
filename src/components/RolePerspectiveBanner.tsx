import React from 'react';
import { User, UserRole } from '../types/project';
import { ShieldCheck, UserCheck, Eye, Lock, Award, Cpu, FileCheck, CheckCircle2 } from 'lucide-react';

interface RolePerspectiveBannerProps {
  currentUser: User;
  activeTab: string;
}

export const RolePerspectiveBanner: React.FC<RolePerspectiveBannerProps> = ({ currentUser, activeTab }) => {
  const getRoleDetails = (role: UserRole) => {
    switch (role) {
      case 'PM':
        return {
          title: '项目总指挥 / 项目经理 (PM)',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          focusText: '全流程概览、CPM 关键路径调度、EVM 挣值与成本控制、CCB 变更表决及审计日志',
          permissionsText: '读 / 写 / CPM 计算 / EVM 成本控制 / CCB 审批',
        };
      case 'ARCHITECT':
        return {
          title: '兵器平台总设计师 / 系统总师 (ARCHITECT)',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          focusText: '系统架构设计、功能基线 (FBL/ABL/PBL) 受控维护、技术归零5条标准主导与 SRS 评审',
          permissionsText: '架构任务编辑 / 技术基线锁定发布 / 技术归零签署',
        };
      case 'ENGINEER':
        return {
          title: '军工研发工程师 (ENGINEER)',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          focusText: '战术算法与嵌入式驱动研发、任务进度更新、CCB 变更申请提交、质量故障排查与修复',
          permissionsText: '分配任务进度更新 / 提交 CCB 申请 / 编写 CAPA 修复',
        };
      case 'QA':
        return {
          title: '军工质量总监 (QA)',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          focusText: '航天军工“双五条”质量归零评审 (技术归零+管理归零)、GJB-9001C 质量体系审计与 CAPA 闭环',
          permissionsText: '质量故障登记与双归零审核签署 / 质量审计日志',
        };
      case 'EXECUTIVE':
        return {
          title: '兵器集团决策委员会高管 (EXECUTIVE)',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          focusText: '高管决策建议仪表盘、EVM 完工预测 (EAC/VAC)、里程碑管控与 CCB 最终裁决权',
          permissionsText: '高管决策看板 / 预算完工预测 / CCB 最终裁决权',
        };
    }
  };

  const info = getRoleDetails(currentUser.role);

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl mb-5 shadow-md backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full border-2 border-blue-500/60 object-cover"
          />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">视角/角色:</span>
            <span className="font-bold text-slate-100">{currentUser.name}</span>
            <span className={`px-2 py-0.5 text-[10px] font-bold border rounded-full ${info.badgeColor}`}>
              {info.title}
            </span>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5 flex items-center">
            <Eye className="w-3 h-3 text-blue-400 mr-1 flex-shrink-0" />
            <span className="text-slate-300 font-medium mr-1">查看重点:</span> {info.focusText}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px]">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
        <span className="text-slate-400">权限模式:</span>
        <span className="font-bold text-cyan-300">{info.permissionsText}</span>
      </div>
    </div>
  );
};

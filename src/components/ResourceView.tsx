import React from 'react';
import { User, WBSTask } from '../types/project';
import { Users, Shield, Clock, DollarSign, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RolePerspectiveBanner } from './RolePerspectiveBanner';

interface ResourceViewProps {
  currentUser: User;
  users: User[];
  tasks: WBSTask[];
}

export const ResourceView: React.FC<ResourceViewProps> = ({ currentUser, users, tasks }) => {
  return (
    <div className="space-y-6">
      {/* Role Perspective Banner */}
      <RolePerspectiveBanner currentUser={currentUser} activeTab="resource" />

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            项目资源分配与负载矩阵 (Resource Allocation & Workload)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            监控团队成员的工时负载、工时单价与技能匹配度，防止过度分配 (Over-Allocation)
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            团队规模: <span className="font-bold text-blue-400">{users.length} 人</span>
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => {
          // Tasks assigned to this resource
          const assignedTasks = tasks.filter(
            (t) => t.ownerId === user.id || t.assignedResourceIds?.includes(user.id)
          );

          // Calculate total estimated days / hours assigned
          const totalAssignedDays = assignedTasks.reduce((acc, t) => acc + t.durationDays, 0);
          const totalEstimatedCost = assignedTasks.reduce((acc, t) => acc + t.plannedCost, 0);

          // Check if workload is over capacity (e.g., > 3 active tasks in progress)
          const activeTasksCount = assignedTasks.filter((t) => t.status === 'in_progress').length;
          const isOverallocated = activeTasksCount > 2;

          return (
            <div
              key={user.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 ${
                isOverallocated
                  ? 'border-amber-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border border-blue-500/50 object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-100">{user.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                        {user.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{user.department}</div>
                  </div>
                </div>

                {/* Rates & Capacity */}
                <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">工时费率</span>
                    <span className="font-bold text-slate-200">¥{user.hourlyRate} / 小时</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">日均标准工时</span>
                    <span className="font-bold text-slate-200">{user.capacityHoursPerDay} 小时/天</span>
                  </div>
                </div>

                {/* Overallocation Notice */}
                {isOverallocated && (
                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px] flex items-center space-x-1.5 mb-3">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>高并发并行任务警示 ({activeTasksCount} 项进行中任务)</span>
                  </div>
                )}

                {/* Assigned Tasks */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-300 flex justify-between">
                    <span>分配任务 ({assignedTasks.length} 项)</span>
                    <span className="text-slate-500 font-mono">共 {totalAssignedDays} 天</span>
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {assignedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2 bg-slate-950/80 rounded border border-slate-800/80 text-[11px] flex justify-between items-center"
                      >
                        <span className="font-mono font-bold text-blue-400">{t.wbsCode}</span>
                        <span className="text-slate-200 font-medium truncate mx-2">{t.name}</span>
                        <span className="text-slate-400 font-mono">{t.progress}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[10px] text-slate-500 mb-1 font-bold">技能领域:</div>
                <div className="flex flex-wrap gap-1">
                  {user.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

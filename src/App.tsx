import React, { useState, useMemo } from 'react';
import {
  User,
  WBSTask,
  ProcessGroup,
  KnowledgeArea,
  FaultReport,
  ConfigurationItem,
  ChangeRequest,
  AuditLog,
} from './types/project';
import {
  INITIAL_USERS,
  INITIAL_TASKS,
  INITIAL_EVM_SCURVE,
  INITIAL_FAULTS,
  INITIAL_CIS,
  INITIAL_CHANGES,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { calculateCPM } from './utils/cpm';
import { calculateEVM } from './utils/evm';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { GanttChart } from './components/GanttChart';
import { WBSView } from './components/WBSView';
import { EVMView } from './components/EVMView';
import { ResourceView } from './components/ResourceView';
import { QualityZeroingView } from './components/QualityZeroingView';
import { TechnicalStateView } from './components/TechnicalStateView';
import { AuditTrailView } from './components/AuditTrailView';

export default function App() {
  // Global States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to PM
  const [rawTasks, setRawTasks] = useState<WBSTask[]>(INITIAL_TASKS);

  const [sCurveData, setSCurveData] = useState(INITIAL_EVM_SCURVE);
  const [faults, setFaults] = useState<FaultReport[]>(INITIAL_FAULTS);
  const [cis, setCis] = useState<ConfigurationItem[]>(INITIAL_CIS);
  const [changes, setChanges] = useState<ChangeRequest[]>(INITIAL_CHANGES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProcessGroup, setSelectedProcessGroup] = useState<ProcessGroup | 'all'>('all');
  const [selectedKnowledgeArea, setSelectedKnowledgeArea] = useState<KnowledgeArea | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected task modal target
  const [selectedTask, setSelectedTask] = useState<WBSTask | null>(null);

  // Recalculate CPM (Critical Path Method) for tasks on state changes
  const tasksWithCPM = useMemo(() => {
    return calculateCPM(rawTasks);
  }, [rawTasks]);

  // Recalculate EVM Metrics based on tasks
  const evmMetrics = useMemo(() => {
    return calculateEVM(tasksWithCPM);
  }, [tasksWithCPM]);

  // Helper to add audit log entry
  const logAuditAction = (action: string, targetModule: string, details: string) => {
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp,
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      action,
      targetModule,
      details,
      ipAddress: '192.168.1.100',
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Task Handlers
  const handleAddTask = (newTaskData: Partial<WBSTask>) => {
    const newTask: WBSTask = {
      id: `t-${Date.now()}`,
      wbsCode: newTaskData.wbsCode || '1.0',
      parentId: newTaskData.parentId || null,
      name: newTaskData.name || '新任务',
      processGroup: newTaskData.processGroup || 'planning',
      knowledgeArea: newTaskData.knowledgeArea || 'scope',
      ownerId: newTaskData.ownerId || currentUser.id,
      assignedResourceIds: [newTaskData.ownerId || currentUser.id],
      startDate: newTaskData.startDate || '2026-08-15',
      endDate: newTaskData.endDate || '2026-08-20',
      durationDays: newTaskData.durationDays || 5,
      progress: newTaskData.progress || 0,
      plannedCost: newTaskData.plannedCost || 50000,
      actualCost: newTaskData.actualCost || 0,
      status: 'todo',
      dependencies: newTaskData.dependencies || [],
    };

    setRawTasks((prev) => [...prev, newTask]);
    logAuditAction(
      '新增 WBS 任务',
      '范围与进度管理',
      `创建 WBS [${newTask.wbsCode}] ${newTask.name}，预算 ¥${newTask.plannedCost}`
    );
  };

  const handleUpdateTask = (updatedTask: WBSTask) => {
    setRawTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    logAuditAction(
      '更新 WBS 任务',
      '进度与成本管理',
      `更新任务 [${updatedTask.wbsCode}] ${updatedTask.name} 进度至 ${updatedTask.progress}%，实际成本 ¥${updatedTask.actualCost}`
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const target = rawTasks.find((t) => t.id === taskId);
    setRawTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (target) {
      logAuditAction('删除 WBS 任务', '范围与进度管理', `删除任务 [${target.wbsCode}] ${target.name}`);
    }
  };

  // Fault & Zeroing Review Handlers
  const handleUpdateFault = (updatedFault: FaultReport, auditMessage: string) => {
    setFaults((prev) => prev.map((f) => (f.id === updatedFault.id ? updatedFault : f)));
    logAuditAction('更新归零评审', '质量故障归零 (CAPA)', auditMessage);
  };

  const handleCreateFault = (newFaultData: Partial<FaultReport>) => {
    const created: FaultReport = {
      id: `fr-${Date.now()}`,
      code: `FR-2026-${String(faults.length + 1).padStart(3, '0')}`,
      title: newFaultData.title || '新增质量故障',
      severity: newFaultData.severity || 'high',
      category: newFaultData.category || 'software',
      description: newFaultData.description || '',
      reporterId: currentUser.id,
      assignedToId: newFaultData.assignedToId || users[1].id,
      reportDate: '2026-08-11',
      status: 'tech_zeroing',
      techZeroing: {
        accurateLocalization: false,
        clearMechanism: false,
        problemReproduce: false,
        effectiveAction: false,
        drawLessons: false,
        notes: '',
      },
      mgmtZeroing: {
        clearResponsibility: false,
        measuresImplemented: false,
        seriousDiscipline: false,
        improveRegulations: false,
        strengthenSystem: false,
        notes: '',
      },
      rootCause: newFaultData.rootCause || '',
      correctiveAction: newFaultData.correctiveAction || '',
    };

    setFaults((prev) => [created, ...prev]);
    logAuditAction(
      '登记质量故障',
      '质量管理 (CAPA)',
      `登记故障 [${created.code}] ${created.title}，严重等级: ${created.severity}`
    );
  };

  // CCB Baseline Approval Handler
  const handleApproveChange = (changeId: string, approved: boolean, notes: string) => {
    setChanges((prev) =>
      prev.map((c) =>
        c.id === changeId
          ? {
              ...c,
              status: approved ? 'ccb_approved' : 'ccb_rejected',
              ccbNotes: notes,
            }
          : c
      )
    );

    const targetCr = changes.find((c) => c.id === changeId);
    logAuditAction(
      approved ? 'CCB 批准变更' : 'CCB 驳回变更',
      '技术状态管理 (CCB)',
      `对变更申请 [${targetCr?.code}] ${targetCr?.title} 执行 CCB 表决: ${approved ? '通过' : '驳回'}`
    );
  };

  const handleCreateChange = (newCrData: Partial<ChangeRequest>) => {
    const created: ChangeRequest = {
      id: `cr-${Date.now()}`,
      code: `CR-2026-${String(changes.length + 1).padStart(3, '0')}`,
      title: newCrData.title || '基线变更申请',
      ciId: newCrData.ciId || cis[0].id,
      applicantId: currentUser.id,
      reason: newCrData.reason || '',
      impactAnalysis: newCrData.impactAnalysis || '',
      status: 'pending',
      appliedDate: '2026-08-11',
    };

    setChanges((prev) => [created, ...prev]);
    logAuditAction(
      '提交 CCB 变更申请',
      '技术状态管理 (CCB)',
      `提交变更申请 [${created.code}] ${created.title}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-12">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={setCurrentUser}
        selectedProcessGroup={selectedProcessGroup}
        onSelectProcessGroup={setSelectedProcessGroup}
        selectedKnowledgeArea={selectedKnowledgeArea}
        onSelectKnowledgeArea={setSelectedKnowledgeArea}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            tasks={tasksWithCPM}
            evm={evmMetrics}
            sCurveData={sCurveData}
            faults={faults}
            users={users}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'gantt' && (
          <GanttChart
            currentUser={currentUser}
            tasks={tasksWithCPM}
            users={users}
            onTaskClick={setSelectedTask}
            selectedProcessGroup={selectedProcessGroup}
            selectedKnowledgeArea={selectedKnowledgeArea}
          />
        )}

        {activeTab === 'wbs' && (
          <WBSView
            currentUser={currentUser}
            tasks={tasksWithCPM}
            users={users}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'evm' && (
          <EVMView currentUser={currentUser} evm={evmMetrics} sCurveData={sCurveData} tasks={tasksWithCPM} />
        )}

        {activeTab === 'resource' && <ResourceView currentUser={currentUser} users={users} tasks={tasksWithCPM} />}

        {activeTab === 'quality' && (
          <QualityZeroingView
            currentUser={currentUser}
            faults={faults}
            users={users}
            tasks={tasksWithCPM}
            onUpdateFault={handleUpdateFault}
            onCreateFault={handleCreateFault}
          />
        )}

        {activeTab === 'baseline' && (
          <TechnicalStateView
            cis={cis}
            changes={changes}
            users={users}
            currentUser={currentUser}
            onApproveChange={handleApproveChange}
            onCreateChange={handleCreateChange}
          />
        )}

        {activeTab === 'audit' && <AuditTrailView currentUser={currentUser} logs={auditLogs} />}
      </main>
    </div>
  );
}

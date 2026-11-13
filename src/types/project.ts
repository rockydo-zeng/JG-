/**
 * Project Management System Types
 * Supporting 5 Process Groups, 10 Knowledge Areas, WBS, Gantt, CPM, EVM, Resource Allocation,
 * Fault Reports & Zeroing Review (归零评审), Technical Baselines, and RBAC / Audit Trails.
 */

// 五大过程组
export type ProcessGroup = 
  | 'initiating'    // 启动过程组
  | 'planning'      // 规划过程组
  | 'executing'     // 执行过程组
  | 'monitoring'    // 监控过程组
  | 'closing';      // 收尾过程组

export const PROCESS_GROUP_LABELS: Record<ProcessGroup, string> = {
  initiating: '启动过程组',
  planning: '规划过程组',
  executing: '执行过程组',
  monitoring: '监控过程组',
  closing: '收尾过程组',
};

// 十大知识领域
export type KnowledgeArea =
  | 'integration'   // 项目整合管理
  | 'scope'         // 项目范围管理
  | 'schedule'      // 项目进度管理
  | 'cost'          // 项目成本管理
  | 'quality'       // 项目质量管理
  | 'resource'      // 项目资源管理
  | 'communication' // 项目沟通管理
  | 'risk'          // 项目风险管理
  | 'procurement'   // 项目采购管理
  | 'stakeholder';  // 项目相关方管理

export const KNOWLEDGE_AREA_LABELS: Record<KnowledgeArea, string> = {
  integration: '整合管理',
  scope: '范围管理',
  schedule: '进度管理',
  cost: '成本管理',
  quality: '质量管理',
  resource: '资源管理',
  communication: '沟通管理',
  risk: '风险管理',
  procurement: '采购管理',
  stakeholder: '相关方管理',
};

// 任务状态
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';

// 角色与权限
export type UserRole = 'PM' | 'ARCHITECT' | 'ENGINEER' | 'QA' | 'EXECUTIVE';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  department: string;
  hourlyRate: number;
  capacityHoursPerDay: number;
  skills: string[];
}

export interface WBSTask {
  id: string;
  wbsCode: string;           // 例如: "1.1.2"
  parentId: string | null;   // 父节点ID
  name: string;
  processGroup: ProcessGroup;
  knowledgeArea: KnowledgeArea;
  ownerId: string;
  assignedResourceIds: string[];
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  durationDays: number;
  progress: number;          // 0 - 100
  plannedCost: number;       // PV (计划值)
  actualCost: number;        // AC (实际成本)
  status: TaskStatus;
  dependencies: string[];    // 前置任务ID数组
  isMilestone?: boolean;
  
  // CPM (关键路径法) 计算属性
  earlyStart?: number;       // 最早开始时间 (第几天)
  earlyFinish?: number;      // 最早完成时间
  lateStart?: number;        // 最晚开始时间
  lateFinish?: number;       // 最晚完成时间
  totalFloat?: number;       // 总时差
  freeFloat?: number;        // 自由时差
  isCritical?: boolean;      // 是否关键路径任务
}

// 挣值分析结果 (EVM)
export interface EVMMetrics {
  pv: number;               // 计划值 Planned Value
  ev: number;               // 挣值 Earned Value = PV * progress
  ac: number;               // 实际成本 Actual Cost
  sv: number;               // 进度偏差 Schedule Variance = EV - PV
  cv: number;               // 成本偏差 Cost Variance = EV - AC
  spi: number;              // 进度绩效指数 Schedule Performance Index = EV / PV
  cpi: number;              // 成本绩效指数 Cost Performance Index = EV / AC
  bac: number;              // 完工预算 Budget at Completion = Sum(PV)
  eac: number;              // 完工估算 Estimate at Completion = BAC / CPI
  etc: number;              // 完工尚需估算 Estimate to Complete = EAC - AC
  vac: number;              // 完工偏差 Variance at Completion = BAC - EAC
  scheduleStatus: 'ahead' | 'on_track' | 'behind';
  costStatus: 'under_budget' | 'on_budget' | 'over_budget';
  healthScore: number;      // 综合健康度得分 0-100
}

// EVM 历史 S 曲线数据点
export interface EVMSCurvePoint {
  date: string;             // 月份/日期
  pvCum: number;            // 累计 PV
  evCum: number;            // 累计 EV
  acCum: number;            // 累计 AC
}

// 质量故障报告与 CAPA
export type FaultSeverity = 'critical' | 'high' | 'medium' | 'low';
export type FaultCategory = 'hardware' | 'software' | 'process' | 'testing' | 'requirement';
export type ZeroingStage = 'open' | 'investigating' | 'tech_zeroing' | 'mgmt_zeroing' | 'closed';

// 技术归零5条标准
export interface TechnicalZeroing {
  accurateLocalization: boolean; // 定位准确
  clearMechanism: boolean;      // 机理清楚
  problemReproduce: boolean;    // 问题复现
  effectiveAction: boolean;     // 措施有效
  drawLessons: boolean;         // 举一反三
  notes: string;
}

// 管理归零5条标准
export interface ManagementZeroing {
  clearResponsibility: boolean;  // 责任明确
  measuresImplemented: boolean;  // 措施落实
  seriousDiscipline: boolean;    // 严肃处理
  improveRegulations: boolean;   // 完善规章
  strengthenSystem: boolean;     // 健全制度
  notes: string;
}

export interface FaultReport {
  id: string;
  code: string;                  // 如 FR-2026-001
  title: string;
  severity: FaultSeverity;
  category: FaultCategory;
  description: string;
  reporterId: string;
  assignedToId: string;
  relatedTaskId?: string;
  reportDate: string;
  status: ZeroingStage;
  techZeroing: TechnicalZeroing;
  mgmtZeroing: ManagementZeroing;
  rootCause?: string;
  correctiveAction?: string;
}

// 技术状态管理 (基线与配置项)
export type BaselineType = 'functional' | 'allocated' | 'product'; // 功能基线 / 分配基线 / 产品基线

export interface ConfigurationItem {
  id: string;
  code: string;
  name: string;
  baselineType: BaselineType;
  version: string;
  ownerId: string;
  status: 'draft' | 'baselined' | 'change_requested' | 'deprecated';
  lastUpdated: string;
  description: string;
}

export interface ChangeRequest {
  id: string;
  code: string;
  title: string;
  ciId: string;
  applicantId: string;
  reason: string;
  impactAnalysis: string;
  status: 'pending' | 'ccb_approved' | 'ccb_rejected' | 'implemented';
  appliedDate: string;
  ccbNotes?: string;
}

// 审计日志 (Audit Log)
export interface AuditLog {
  id: string;
  timestamp: string;
  operatorName: string;
  operatorRole: UserRole;
  action: string;
  targetModule: string;
  details: string;
  ipAddress?: string;
}

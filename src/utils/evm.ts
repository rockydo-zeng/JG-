import { WBSTask, EVMMetrics } from '../types/project';

/**
 * Computes Earned Value Management (EVM) metrics based on active tasks.
 */
export function calculateEVM(tasks: WBSTask[]): EVMMetrics {
  let pvTotal = 0;
  let evTotal = 0;
  let acTotal = 0;

  tasks.forEach((t) => {
    const plannedCost = t.plannedCost || 0;
    const actualCost = t.actualCost || 0;
    const progress = Math.min(100, Math.max(0, t.progress || 0));

    pvTotal += plannedCost;
    evTotal += (plannedCost * progress) / 100;
    acTotal += actualCost;
  });

  const sv = evTotal - pvTotal;
  const cv = evTotal - acTotal;

  // SPI = EV / PV (avoid divide by zero)
  const spi = pvTotal > 0 ? Number((evTotal / pvTotal).toFixed(2)) : 1.0;
  // CPI = EV / AC (avoid divide by zero)
  const cpi = acTotal > 0 ? Number((evTotal / acTotal).toFixed(2)) : 1.0;

  const bac = pvTotal; // Budget at Completion

  // EAC = BAC / CPI (typical index calculation)
  const eac = cpi > 0 ? Math.round(bac / cpi) : bac;
  // ETC = EAC - AC
  const etc = Math.max(0, eac - acTotal);
  // VAC = BAC - EAC
  const vac = bac - eac;

  // Schedule status
  let scheduleStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
  if (spi > 1.05) scheduleStatus = 'ahead';
  else if (spi < 0.95) scheduleStatus = 'behind';

  // Cost status
  let costStatus: 'under_budget' | 'on_budget' | 'over_budget' = 'on_budget';
  if (cpi > 1.05) costStatus = 'under_budget';
  else if (cpi < 0.95) costStatus = 'over_budget';

  // Health Score Calculation (0-100)
  // 100 points baseline, deducted for low SPI/CPI and uncompleted critical tasks
  let healthScore = 100;
  if (spi < 1.0) healthScore -= Math.round((1 - spi) * 60);
  if (cpi < 1.0) healthScore -= Math.round((1 - cpi) * 60);
  healthScore = Math.min(100, Math.max(20, Math.round(healthScore)));

  return {
    pv: Math.round(pvTotal),
    ev: Math.round(evTotal),
    ac: Math.round(acTotal),
    sv: Math.round(sv),
    cv: Math.round(cv),
    spi,
    cpi,
    bac: Math.round(bac),
    eac,
    etc,
    vac,
    scheduleStatus,
    costStatus,
    healthScore,
  };
}

/**
 * Returns executive decision insights and operational advice based on EVM metrics.
 */
export function getEVMRecommendation(metrics: EVMMetrics): {
  headline: string;
  level: 'success' | 'warning' | 'danger' | 'info';
  details: string[];
} {
  const { spi, cpi, sv, cv, eac, bac } = metrics;

  if (spi >= 1.0 && cpi >= 1.0) {
    return {
      headline: '项目处于理想状态：进度超前/按期，成本控制良好',
      level: 'success',
      details: [
        `进度绩效指数 SPI=${spi}（进度偏差 +¥${(sv / 10000).toFixed(1)}万），项目执行效率符合预期。`,
        `成本绩效指数 CPI=${cpi}（成本偏差 +¥${(cv / 10000).toFixed(1)}万），资金使用保持高效。`,
        `预测完工成本 EAC 为 ¥${(eac / 10000).toFixed(1)}万，预计低于原预算 ¥${(bac / 10000).toFixed(1)}万。`,
        '建议：维持当前资源分配，继续保持阶段性过程控制，做好后续质量归零管理。',
      ],
    };
  } else if (spi < 1.0 && cpi >= 1.0) {
    return {
      headline: '警示：进度落后，但成本尚在控制范围内',
      level: 'warning',
      details: [
        `进度绩效指数 SPI=${spi}（进度偏差 -¥${Math.abs(sv / 10000).toFixed(1)}万），关键路径任务存在滞后。`,
        `成本绩效指数 CPI=${cpi}（成本偏差 +¥${(cv / 10000).toFixed(1)}万），尚未出现成本超支。`,
        '建议：利用成本结余空间，适度增加关键路径的加班或高技能资源配置（快速跟进或赶工）。',
      ],
    };
  } else if (spi >= 1.0 && cpi < 1.0) {
    return {
      headline: '警示：进度正常，但成本超支严重',
      level: 'warning',
      details: [
        `成本绩效指数 CPI=${cpi}（成本偏差 -¥${Math.abs(cv / 10000).toFixed(1)}万），单位工作产出成本高于预期。`,
        `进度绩效指数 SPI=${spi}，按计划节点推进。`,
        `完工预测成本 EAC 为 ¥${(eac / 10000).toFixed(1)}万，预计超支 ¥${(Math.abs(bac - eac) / 10000).toFixed(1)}万。`,
        '建议：排查高成本工序，严格审批非关键路径的工时与外包支出，优化采购与技术状态 baseline。',
      ],
    };
  } else {
    return {
      headline: '严重警告：进度滞后且成本超支（双重预警）',
      level: 'danger',
      details: [
        `进度绩效 SPI=${spi}，成本绩效 CPI=${cpi}，项目面临高风险风险。`,
        `完工预测成本 EAC 达 ¥${(eac / 10000).toFixed(1)}万，预计超出预算 ¥${((eac - bac) / 10000).toFixed(1)}万。`,
        '建议：立即启动项目纠偏（CAPA）与高管变更控制委员会 (CCB) 审查，重新评估范围与基线，压缩非核心特性。',
      ],
    };
  }
}

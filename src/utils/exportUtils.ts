import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { WBSTask, User } from '../types/project';
import { PROCESS_GROUP_LABELS, KNOWLEDGE_AREA_LABELS } from '../types/project';

/**
 * Exports project WBS & CPM tasks to Excel (.xls / .xlsx)
 */
export function exportToExcel(tasks: WBSTask[], filename = '某兵器军工专用平台_WBS关键路径分析表'): void {
  const data = tasks.map((t) => ({
    'WBS 编码': t.wbsCode,
    '战术任务名称': t.name,
    'PMBOK 过程组': PROCESS_GROUP_LABELS[t.processGroup] || t.processGroup,
    '知识领域': KNOWLEDGE_AREA_LABELS[t.knowledgeArea] || t.knowledgeArea,
    '工期(天)': t.durationDays,
    '计划开始日期': t.startDate,
    '计划完成日期': t.endDate,
    '进度(%)': `${t.progress}%`,
    '计划成本(PV/元)': t.plannedCost,
    '实际成本(AC/元)': t.actualCost,
    '最早开始(ES)': t.earlyStart ?? 0,
    '最早完成(EF)': t.earlyFinish ?? 0,
    '最迟开始(LS)': t.lateStart ?? 0,
    '最迟完成(LF)': t.lateFinish ?? 0,
    '总时差 Total Float': t.totalFloat ?? 0,
    '自由时差 Free Float': t.freeFloat ?? 0,
    '是否关键路径 (CPM)': t.isCritical ? '是 (关键节点)' : '否 (非关键)',
    '里程碑节点': t.isMilestone ? '是' : '否',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths for better Excel readability
  worksheet['!cols'] = [
    { wch: 10 }, // WBS Code
    { wch: 38 }, // Name
    { wch: 14 }, // Process group
    { wch: 16 }, // Knowledge area
    { wch: 10 }, // Duration
    { wch: 14 }, // Start
    { wch: 14 }, // End
    { wch: 10 }, // Progress
    { wch: 16 }, // Planned Cost
    { wch: 16 }, // Actual Cost
    { wch: 12 }, // ES
    { wch: 12 }, // EF
    { wch: 12 }, // LS
    { wch: 12 }, // LF
    { wch: 16 }, // TF
    { wch: 16 }, // FF
    { wch: 16 }, // IsCritical
    { wch: 10 }, // IsMilestone
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WBS关键路径清单');

  // Write file as .xls / .xlsx
  XLSX.writeFile(workbook, `${filename}.xls`, { bookType: 'xls' });
}

/**
 * Triggers a formatted PDF document view or standard export for Gantt / WBS
 */
export function exportToPDF(
  tasks: WBSTask[],
  users: User[],
  title = '某兵器军工专用平台建设项目 - 全流程甘特图与CPM关键路径报表'
): void {
  // Create a clean printable HTML document window to avoid CJK font encoding issues in pure jsPDF canvas
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('无法打开导出预览窗口，请允许浏览器弹出窗口。');
    return;
  }

  const criticalTasks = tasks.filter((t) => t.isCritical);
  const totalPV = tasks.reduce((sum, t) => sum + (t.plannedCost || 0), 0);
  const totalAC = tasks.reduce((sum, t) => sum + (t.actualCost || 0), 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            padding: 24px;
            margin: 0;
            background-color: #ffffff;
          }
          .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .platform-name {
            font-size: 13px;
            color: #2563eb;
            font-weight: bold;
            letter-spacing: 0.5px;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin: 4px 0 8px 0;
          }
          .meta-info {
            font-size: 12px;
            color: #64748b;
            display: flex;
            justify-content: space-between;
          }
          .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
          }
          .stat-item {
            display: flex;
            flex-direction: column;
          }
          .stat-label {
            font-size: 11px;
            color: #64748b;
          }
          .stat-val {
            font-size: 16px;
            font-weight: bold;
            color: #0f172a;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            margin: 16px 0 8px 0;
            padding-left: 8px;
            border-left: 4px solid #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #334155;
          }
          .critical-row {
            background-color: #fef2f2;
          }
          .badge-critical {
            background-color: #ef4444;
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }
          .badge-normal {
            background-color: #e2e8f0;
            color: #334155;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
          }
          .explanation-card {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 11px;
            color: #1e40af;
            line-height: 1.6;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; text-align: right;">
          <button onclick="window.print()" style="background-color: #2563eb; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
            🖨️ 打印 / 保存为 PDF
          </button>
        </div>

        <div class="header">
          <div class="platform-name">杜增辉-AI智能感知平台 • 全流程项目管理系统</div>
          <div class="title">${title}</div>
          <div class="meta-info">
            <span>导出生成时间: ${new Date().toLocaleString('zh-CN')}</span>
            <span>项目预算: ¥2,800,000 | 遵守 GJB-9001C 军工质量体系</span>
          </div>
        </div>

        <div class="summary-box">
          <div class="stat-item">
            <span class="stat-label">总任务数</span>
            <span class="stat-val">${tasks.length} 项</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">关键路径任务</span>
            <span class="stat-val" style="color: #dc2626;">${criticalTasks.length} 项</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">计划成本 PV 总计</span>
            <span class="stat-val">¥${(totalPV / 10000).toFixed(1)} 万</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">实际支出 AC 总计</span>
            <span class="stat-val" style="color: #d97706;">¥${(totalAC / 10000).toFixed(1)} 万</span>
          </div>
        </div>

        <div class="section-title">CPM 关键路径解析 (Critical Path Method)</div>
        <div class="explanation-card">
          <strong>关键路径判定依据:</strong><br>
          1. <strong>零时差逻辑 (Total Float = 0)</strong>: 该路径上所有任务节点的总时差与自由时差均为 0 天，最早开始时间与最迟开始时间完全重合 (ES = LS)。<br>
          2. <strong>总工期制约 (Project Bottleneck)</strong>: 该路径决定了专用平台建设项目的最短总工期（102天）。链条上任何一个关键节点的延误都将 1:1 直接推迟终验交付时间。<br>
          3. <strong>关键节点清单</strong>: ${criticalTasks.map((t) => `[${t.wbsCode}] ${t.name}`).join(' → ')}
        </div>

        <div class="section-title">全流程 WBS 与 CPM 任务网络清单</div>
        <table>
          <thead>
            <tr>
              <th>WBS 编码</th>
              <th>战术任务名称</th>
              <th>过程组</th>
              <th>知识领域</th>
              <th>负责人</th>
              <th>工期(天)</th>
              <th>起止日期</th>
              <th>进度</th>
              <th>计划(PV)</th>
              <th>实际(AC)</th>
              <th>CPM 时差 (TF)</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            ${tasks
              .map((t) => {
                const owner = users.find((u) => u.id === t.ownerId)?.name || '未指定';
                return `
                  <tr class="${t.isCritical ? 'critical-row' : ''}">
                    <td style="font-family: monospace; font-weight: bold;">${t.wbsCode}</td>
                    <td><strong>${t.name}</strong></td>
                    <td>${PROCESS_GROUP_LABELS[t.processGroup] || t.processGroup}</td>
                    <td>${KNOWLEDGE_AREA_LABELS[t.knowledgeArea] || t.knowledgeArea}</td>
                    <td>${owner}</td>
                    <td style="text-align: center;">${t.durationDays}</td>
                    <td>${t.startDate} ~ ${t.endDate}</td>
                    <td style="text-align: center;">${t.progress}%</td>
                    <td style="text-align: right;">¥${(t.plannedCost / 10000).toFixed(1)}万</td>
                    <td style="text-align: right;">¥${(t.actualCost / 10000).toFixed(1)}万</td>
                    <td style="text-align: center; font-weight: bold; color: ${t.isCritical ? '#dc2626' : '#16a34a'};">
                      ${t.totalFloat ?? 0}d
                    </td>
                    <td style="text-align: center;">
                      <span class="${t.isCritical ? 'badge-critical' : 'badge-normal'}">
                        ${t.isCritical ? '关键路径' : '普通路径'}
                      </span>
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>

        <div style="margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center; font-size: 10px; color: #94a3b8;">
          全流程项目管理系统 • 杜增辉-AI智能感知平台 内部军工研制文档
        </div>

        <script>
          // Auto print on load if preferred
          window.onload = function() {
            setTimeout(() => { window.print(); }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

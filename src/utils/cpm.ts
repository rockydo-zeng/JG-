import { WBSTask } from '../types/project';

/**
 * Calculates Critical Path Method (CPM) metrics for a list of WBS Tasks.
 * Returns updated tasks with earlyStart, earlyFinish, lateStart, lateFinish, totalFloat, freeFloat, isCritical.
 */
export function calculateCPM(tasks: WBSTask[]): WBSTask[] {
  if (!tasks || tasks.length === 0) return [];

  // Clone tasks to avoid direct mutation
  const taskMap = new Map<string, WBSTask>();
  tasks.forEach((t) => {
    taskMap.set(t.id, {
      ...t,
      durationDays: Math.max(1, t.durationDays || 1),
      dependencies: t.dependencies || [],
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      totalFloat: 0,
      freeFloat: 0,
      isCritical: false,
    });
  });

  const allTaskIds = Array.from(taskMap.keys());

  // Build predecessor and successor maps
  const successors = new Map<string, string[]>();
  allTaskIds.forEach((id) => successors.set(id, []));

  taskMap.forEach((task) => {
    task.dependencies.forEach((predId) => {
      if (successors.has(predId)) {
        successors.get(predId)!.push(task.id);
      }
    });
  });

  // 1. Forward Pass (Calculate Early Start ES & Early Finish EF)
  // Topological sort or iterative resolution
  let changed = true;
  let iterations = 0;
  const maxIterations = tasks.length * 2;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    taskMap.forEach((task) => {
      let maxPredEF = 0;
      task.dependencies.forEach((predId) => {
        const pred = taskMap.get(predId);
        if (pred && pred.earlyFinish > maxPredEF) {
          maxPredEF = pred.earlyFinish;
        }
      });

      const newES = maxPredEF;
      const newEF = newES + task.durationDays;

      if (newES !== task.earlyStart || newEF !== task.earlyFinish) {
        task.earlyStart = newES;
        task.earlyFinish = newEF;
        changed = true;
      }
    });
  }

  // Find max project completion day
  let maxProjectEF = 0;
  taskMap.forEach((task) => {
    if (task.earlyFinish > maxProjectEF) {
      maxProjectEF = task.earlyFinish;
    }
  });

  // 2. Backward Pass (Calculate Late Finish LF & Late Start LS)
  // Initialize all LF to maxProjectEF
  taskMap.forEach((task) => {
    task.lateFinish = maxProjectEF;
    task.lateStart = maxProjectEF - task.durationDays;
  });

  changed = true;
  iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    taskMap.forEach((task) => {
      const succIds = successors.get(task.id) || [];
      if (succIds.length > 0) {
        let minSuccLS = Infinity;
        succIds.forEach((succId) => {
          const succ = taskMap.get(succId);
          if (succ && succ.lateStart < minSuccLS) {
            minSuccLS = succ.lateStart;
          }
        });

        if (minSuccLS !== Infinity) {
          const newLF = minSuccLS;
          const newLS = newLF - task.durationDays;

          if (newLF !== task.lateFinish || newLS !== task.lateStart) {
            task.lateFinish = newLF;
            task.lateStart = newLS;
            changed = true;
          }
        }
      }
    });
  }

  // 3. Float Pass & Critical Path Identification
  let minTotalFloat = Infinity;

  taskMap.forEach((task) => {
    const totalFloat = task.lateStart - task.earlyStart;
    task.totalFloat = Math.max(0, totalFloat);

    // Free float: min(succ.earlyStart) - task.earlyFinish
    const succIds = successors.get(task.id) || [];
    if (succIds.length > 0) {
      let minSuccES = Infinity;
      succIds.forEach((succId) => {
        const succ = taskMap.get(succId);
        if (succ && succ.earlyStart < minSuccES) {
          minSuccES = succ.earlyStart;
        }
      });
      task.freeFloat = Math.max(0, minSuccES - task.earlyFinish);
    } else {
      task.freeFloat = Math.max(0, maxProjectEF - task.earlyFinish);
    }

    if (task.totalFloat < minTotalFloat) {
      minTotalFloat = task.totalFloat;
    }
  });

  // Tasks with minimum float (usually 0) are critical
  taskMap.forEach((task) => {
    task.isCritical = task.totalFloat <= Math.max(0, minTotalFloat);
  });

  return Array.from(taskMap.values());
}

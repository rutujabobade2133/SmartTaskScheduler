function calculateAverages(tasks) {
  let totalWT = 0, totalTAT = 0;

  tasks.forEach(t => {
    totalWT += t.waiting;
    totalTAT += t.turnaround;
  });

  return {
    averageWT: totalWT / tasks.length,
    averageTAT: totalTAT / tasks.length
  };
}

/* ========= FCFS ========= */
function fcfs(tasks) {
  let time = 0;
  tasks.sort((a, b) => a.arrival - b.arrival);

  tasks.forEach(t => {
    t.start = Math.max(time, t.arrival);
    t.completion = t.start + t.burst;
    t.turnaround = t.completion - t.arrival;
    t.waiting = t.turnaround - t.burst;
    time = t.completion;
  });

  return { tasks, ...calculateAverages(tasks) };
}

/* ========= SJF (Non-Preemptive) ========= */
function sjf(tasks) {
  let time = 0, completed = 0;
  const n = tasks.length;
  const done = Array(n).fill(false);
  const result = [];

  while (completed < n) {
    let idx = -1, minBurst = Infinity;

    for (let i = 0; i < n; i++) {
      if (!done[i] && tasks[i].arrival <= time && tasks[i].burst < minBurst) {
        minBurst = tasks[i].burst;
        idx = i;
      }
    }

    if (idx === -1) {
      time++;
      continue;
    }

    const t = tasks[idx];
    t.start = time;
    t.completion = time + t.burst;
    t.turnaround = t.completion - t.arrival;
    t.waiting = t.turnaround - t.burst;

    time = t.completion;
    done[idx] = true;
    completed++;
    result.push(t);
  }

  return { tasks: result, ...calculateAverages(result) };
}

/* ========= ROUND ROBIN ========= */
function roundRobin(tasks, quantum) {
  let time = 0, queue = [];
  const result = [];
  const remaining = tasks.map(t => ({ ...t, remaining: t.burst }));

  remaining.sort((a, b) => a.arrival - b.arrival);
  let i = 0;

  while (queue.length || i < remaining.length) {
    if (!queue.length && remaining[i].arrival > time)
      time = remaining[i].arrival;

    while (i < remaining.length && remaining[i].arrival <= time) {
      queue.push(remaining[i++]);
    }

    const curr = queue.shift();

    if (curr.start === undefined) curr.start = time;

    const exec = Math.min(quantum, curr.remaining);
    curr.remaining -= exec;
    time += exec;

    while (i < remaining.length && remaining[i].arrival <= time) {
      queue.push(remaining[i++]);
    }

    if (curr.remaining > 0) {
      queue.push(curr);
    } else {
      curr.completion = time;
      curr.turnaround = curr.completion - curr.arrival;
      curr.waiting = curr.turnaround - curr.burst;
      result.push(curr);
    }
  }

  return { tasks: result, ...calculateAverages(result) };
}

/* ========= PRIORITY (Non-Preemptive) ========= */
function priorityScheduling(tasks) {
  let time = 0, completed = 0;
  const n = tasks.length;
  const done = Array(n).fill(false);
  const result = [];

  while (completed < n) {
    let idx = -1, best = Infinity;

    for (let i = 0; i < n; i++) {
      if (!done[i] && tasks[i].arrival <= time && tasks[i].priority < best) {
        best = tasks[i].priority;
        idx = i;
      }
    }

    if (idx === -1) {
      time++;
      continue;
    }

    const t = tasks[idx];
    t.start = time;
    t.completion = time + t.burst;
    t.turnaround = t.completion - t.arrival;
    t.waiting = t.turnaround - t.burst;

    time = t.completion;
    done[idx] = true;
    completed++;
    result.push(t);
  }

  return { tasks: result, ...calculateAverages(result) };
}

module.exports = { fcfs, sjf, roundRobin, priorityScheduling };

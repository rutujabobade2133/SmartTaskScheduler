async function runScheduler() {
  const algo = document.getElementById("algorithm").value;
  const quantum = Number(document.getElementById("quantum").value);
  const taskText = document.getElementById("tasks").value.trim();

  const lines = taskText.split("\n");
  const tasks = lines.map(line => {
    const parts = line.split(" ");
    return {
      name: parts[0],
      arrival: Number(parts[1]),
      burst: Number(parts[2]),
      priority: parts[3] ? Number(parts[3]) : 1
    };
  });

  try {
    const res = await fetch("http://localhost:3000/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        algorithm: algo,
        tasks,
        quantum
      })
    });

    if (!res.ok) throw new Error("Server error");

    const data = await res.json();
    showTable(data);
    drawGantt(data.tasks);

  } catch (err) {
    alert("❌ Backend not running or error connecting to server.");
  }
}

function showTable(data) {
  let html = `
    <h3>Results (${data.algorithm})</h3>
    <table>
      <tr>
        <th>Task</th>
        <th>Arrival</th>
        <th>Burst</th>
        <th>Start</th>
        <th>Completion</th>
        <th>Waiting</th>
        <th>Turnaround</th>
        <th>Priority</th>
      </tr>`;

  data.tasks.forEach(t => {
    html += `
      <tr>
        <td>${t.name}</td>
        <td>${t.arrival}</td>
        <td>${t.burst}</td>
        <td>${t.start}</td>
        <td>${t.completion}</td>
        <td>${t.waiting}</td>
        <td>${t.turnaround}</td>
        <td>${t.priority || "-"}</td>
      </tr>`;
  });

  html += `</table>
    <p><b>Average Waiting Time:</b> ${data.averageWT.toFixed(2)}</p>
    <p><b>Average Turnaround Time:</b> ${data.averageTAT.toFixed(2)}</p>`;

  document.getElementById("output").innerHTML = html;
}

let chartInstance;
function drawGantt(tasks) {
  const ctx = document.getElementById("ganttChart").getContext("2d");
  const labels = tasks.map(t => t.name);
  const startTimes = tasks.map(t => t.start);
  const durations = tasks.map(t => t.completion - t.start);

  if (chartInstance) chartInstance.destroy(); // remove previous chart

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Task Duration",
        data: durations,
        backgroundColor: [
          "#7dd3fc",
          "#fbbf24",
          "#f87171",
          "#a5b4fc",
          "#34d399"
        ],
        borderRadius: 8,
        barPercentage: 0.6
      }]
    },
    options: {
      indexAxis: 'y', // horizontal bars for Gantt effect
      scales: {
        x: { beginAtZero: true, title: { display: true, text: 'Time' } },
        y: { title: { display: true, text: 'Tasks' } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const idx = context.dataIndex;
              return `${tasks[idx].name}: ${tasks[idx].start} → ${tasks[idx].completion}`;
            }
          }
        }
      }
    }
  });
}

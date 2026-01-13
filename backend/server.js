const express = require("express");
const cors = require("cors");
const scheduler = require("./scheduler");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/run", (req, res) => {
  const { algorithm, tasks, quantum } = req.body;
  let result;

  if (algorithm === "FCFS") result = scheduler.fcfs(tasks);
  else if (algorithm === "SJF") result = scheduler.sjf(tasks);
  else if (algorithm === "RR") result = scheduler.roundRobin(tasks, quantum);
  else if (algorithm === "PRIORITY") result = scheduler.priorityScheduling(tasks);
  else return res.status(400).json({ error: "Invalid Algorithm" });

  res.json({ algorithm, ...result });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

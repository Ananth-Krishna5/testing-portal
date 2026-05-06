import net from "node:net";
import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = 8000;

function isPortOpen(targetHost, targetPort, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (open) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(open);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(targetPort, targetHost);
  });
}

const alreadyRunning = await isPortOpen(host, port);

if (alreadyRunning) {
  console.log("[agent] Reusing existing AI agent on http://127.0.0.1:8000");
  // Keep this process alive so `concurrently` keeps running normally.
  setInterval(() => {}, 60_000);
} else {
  console.log("[agent] Starting AI agent on http://0.0.0.0:8000");
  const child = spawn(
    "python",
    ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "agent"],
    { stdio: "inherit" }
  );

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

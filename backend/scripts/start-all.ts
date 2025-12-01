// scripts/start-all.ts
import { execSync } from "child_process";
import { spawn } from "child_process";
import path from "path";

const isDev = process.argv.includes("--dev");

console.log("Iniciando TODOS os serviços...");

const services = [
  {
    name: "Backend",
    command: "bun run dev",
    color: "blue",
  },
  {
    name: "Email Worker",
    command: "bun run src/workers/email.worker.ts",
    color: "green",
  },
  {
    name: "Redis (se não estiver rodando)",
    command: "redis-server",
    optional: true,
    color: "yellow",
  },
];

// Inicia cada serviço em paralelo
services.forEach((service) => {
  if (service.optional) {
    try {
      execSync("redis-cli ping", { stdio: "ignore" });
      console.log(`${service.name} já está rodando.`);
      return;
    } catch {
      console.log(`Iniciando ${service.name}...`);
    }
  } else {
    console.log(`Iniciando ${service.name}...`);
  }

  const child = spawn(service.command, {
    shell: true,
    stdio: "pipe",
    detached: false,
  });

  child.stdout?.on("data", (data) => {
    process.stdout.write(`[${service.name}] ${data}`);
  });

  child.stderr?.on("data", (data) => {
    process.stderr.write(`[${service.name} ERRO] ${data}`);
  });

  child.on("close", (code) => {
    console.log(`${service.name} finalizado com código ${code}`);
  });
});

console.log("\nTODOS OS SERVIÇOS INICIADOS!\n");
console.log("Backend: http://localhost:3001");
console.log("Redis: 127.0.0.1:6379");
console.log("PostgreSQL: verifique sua conexão\n");
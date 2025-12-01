import fs from "fs";
import path from "path";

const srcDir = path.join("src", "modules", "email", "templates");
const destDir = path.join("dist", "modules", "email", "templates");

fs.mkdirSync(destDir, { recursive: true });

for (const file of fs.readdirSync(srcDir)) {
  fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
}

console.log("Templates copiados para dist ✓");

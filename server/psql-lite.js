import readline from "readline";
import { pool } from "./db.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "voxshield=> ",
});

console.log("Connected. Type SQL ending with ';' and press Enter. \\q to quit.\n");
rl.prompt();

let buffer = "";

rl.on("line", async (line) => {
  rl.pause();
  const trimmed = line.trim();

  if (trimmed === "\\q") {
    await pool.end();
    rl.close();
    return;
  }

  buffer += (buffer ? "\n" : "") + line;

  if (buffer.trim().endsWith(";")) {
    const sql = buffer;
    buffer = "";
    try {
      const res = await pool.query(sql);
      if (res.rows && res.rows.length) {
        console.table(res.rows);
      } else {
        console.log(`OK${res.rowCount != null ? ` (${res.rowCount} row(s))` : ""}`);
      }
    } catch (err) {
      console.error("ERROR:", err.message);
    }
    rl.setPrompt("voxshield=> ");
  } else {
    rl.setPrompt("voxshield-# "); // continuation, like real psql
  }

  rl.prompt();
  rl.resume();
});

rl.on("close", () => process.exit(0));

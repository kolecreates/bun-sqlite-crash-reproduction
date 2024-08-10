import { Database } from "bun:sqlite";

const db = new Database(":memory:");
db.run("PRAGMA journal_mode = WAL");

db.exec(`CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY, value TEXT)`);

const insertStmt = db.query<void, [string]>("INSERT INTO todos (value) VALUES (?)");
const popStmt = db.query<{ value: string }, any[]>("DELETE FROM todos WHERE id = (SELECT id FROM todos ORDER BY id DESC LIMIT 1) RETURNING value");
const lengthStmt = db.query<{ length: number }, any[]>("SELECT id as length FROM todos ORDER BY id DESC LIMIT 1");

function push(value: any) {
  insertStmt.run(JSON.stringify(value));
}
function pop() {
  const result = popStmt.get();
  return result?.value ? JSON.parse(result.value) : null;
}

function length() {
  const result = lengthStmt.get();
  return result?.length || 0;
}

// Push items
const iterations = 10000;
for (let i = 0; i < iterations; i++) {
  push({ id: i, value: `item ${i}` });
}

console.log("Items inserted:", length());

// Pop items
for (let i = 0; i < iterations; i++) {
  const result = pop();
}

console.log("Items after popping:", length());

//Try to pop from an empty array. This causes the crash. If you comment out the pop() call, the program will run fine.
const result = pop();
console.log("Popping from empty array:", result);

db.close();

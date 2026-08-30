import { createServer } from "node:http";

const store = new Map();

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(body == null ? "" : JSON.stringify(body));
}

function mergeChunks(existing, incoming) {
  const byId = new Map();
  for (const chunk of existing.chunks ?? []) byId.set(chunk.id, chunk);
  for (const chunk of incoming.chunks ?? []) {
    const prev = byId.get(chunk.id);
    if (!prev || chunk.updatedAt >= prev.updatedAt) byId.set(chunk.id, chunk);
  }
  return {
    ...incoming,
    lessons: incoming.lessons,
    chunks: [...byId.values()],
    updatedAt: Math.max(existing.updatedAt ?? 0, incoming.updatedAt ?? 0),
  };
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const match = url.pathname.match(/^\/sync\/([^/]+)$/);
  if (!match) {
    send(res, 404, { error: "not found" });
    return;
  }
  const code = decodeURIComponent(match[1]);
  if (!/^[A-Z]{3,6}-[2-9A-HJ-NP-Z]{2}-[A-Z]{3,6}$/.test(code)) {
    send(res, 400, { error: "bad code" });
    return;
  }

  if (req.method === "GET") {
    const doc = store.get(code);
    if (!doc) {
      send(res, 404, { error: "missing" });
      return;
    }
    send(res, 200, doc);
    return;
  }

  if (req.method === "PUT") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        const incoming = JSON.parse(raw);
        const existing = store.get(code) ?? { chunks: [], updatedAt: 0 };
        const merged = mergeChunks(existing, incoming);
        store.set(code, merged);
        send(res, 200, merged);
      } catch {
        send(res, 400, { error: "bad json" });
      }
    });
    return;
  }

  send(res, 405, { error: "method" });
});

server.listen(8787, "127.0.0.1", () => {
  console.log("sync listening on 8787");
});

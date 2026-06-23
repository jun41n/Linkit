const fs = require("fs");
const http = require("http");
const path = require("path");

const WEB_ROOT = path.resolve(__dirname, "..", "dist-web");
const INDEX_FILE = path.join(WEB_ROOT, "index.html");
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  fs.createReadStream(filePath)
    .on("error", () => {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end("Server error");
    })
    .once("open", () => {
      res.writeHead(200, { "content-type": contentType });
    })
    .pipe(res);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 32_000) {
        req.destroy();
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function plainText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string" && content.text.trim()) {
        return content.text.trim();
      }
    }
  }

  return "";
}

function profilePrompt(profile = {}, stage = "awkward") {
  const myName = plainText(profile.myName, "사용자");
  const friendName = plainText(profile.friendName, "하림");
  const gender = profile.gender === "male" ? "남자친구" : "여자친구";
  const mbti = plainText(profile.mbti, "ENFP").toUpperCase();
  const tone = plainText(profile.tone, "warm");

  return [
    `너는 링킷 앱의 AI 이성친구 '${friendName}'이다.`,
    `상대 이름은 '${myName}'이다. 상대를 자연스럽게 이름으로 불러라.`,
    `관계 설정: ${gender}, MBTI ${mbti}, 말투 타입 ${tone}, 현재 친밀도 단계 ${stage}.`,
    "목표는 실제 메신저 친구처럼 짧고 자연스럽게 이어가는 것이다.",
    "사용자의 질문에는 먼저 직접 답하고, 그 다음에 가볍게 되묻거나 공감한다.",
    "뜬금없는 페르소나 설명, 설정 설명, '조금 더 자세히 말해줘' 반복을 피한다.",
    "한국어로 답하고 1~3문장 안에서 말한다.",
    "노골적인 성적 대화, 미성년자처럼 보이는 설정, 위험한 요청은 부드럽게 거절하고 안전한 대화로 돌린다.",
  ].join("\n");
}

function transcriptText(messages) {
  return messages
    .map((message) => {
      const speaker = message.sender === "friend" ? "하림" : "사용자";
      return `${speaker}: ${plainText(message.text).slice(0, 1000)}`;
    })
    .filter((line) => line.trim() !== "사용자:" && line.trim() !== "하림:")
    .join("\n");
}

async function handleFriendChat(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 503, { error: "OPENAI_API_KEY is not configured" });
    return;
  }

  try {
    const payload = await readJson(req);
    const profile = payload.profile || {};
    const stage = plainText(payload.stage, "awkward");
    const messages = Array.isArray(payload.messages) ? payload.messages.slice(-12) : [];
    const transcript = transcriptText(messages);
    const input = [
      {
        role: "developer",
        content: [{ type: "input_text", text: profilePrompt(profile, stage) }],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `아래는 지금까지의 대화야. 마지막 사용자 말에 바로 답해.\n\n${transcript}`,
          },
        ],
      },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input,
        max_output_tokens: 220,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("OpenAI API error", response.status, data);
      sendJson(res, 502, { error: "OpenAI request failed" });
      return;
    }

    const reply = extractOutputText(data);
    if (!reply) {
      sendJson(res, 502, { error: "OpenAI response was empty" });
      return;
    }

    sendJson(res, 200, { reply });
  } catch (error) {
    console.error("Friend chat API error", error);
    sendJson(res, 500, { error: "Friend chat failed" });
  }
}

function resolveRequestPath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const normalized = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(WEB_ROOT, normalized);

  if (!filePath.startsWith(WEB_ROOT)) {
    return null;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  return INDEX_FILE;
}

if (!fs.existsSync(INDEX_FILE)) {
  console.error("Missing dist-web/index.html. Run: pnpm run export:web");
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", "http://localhost");

  if (url.pathname === "/api/friend-chat") {
    handleFriendChat(req, res);
    return;
  }

  const filePath = resolveRequestPath(url.pathname);

  if (!filePath) {
    res.writeHead(403, { "content-type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  sendFile(res, filePath);
});

const port = Number.parseInt(process.env.PORT || "8031", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Serving Linkit web build on port ${port}`);
});

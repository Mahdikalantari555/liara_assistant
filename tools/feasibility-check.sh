#!/usr/bin/env bash
# Feasibility checks for Liara Docs Bot — run OUTSIDE dsh (own terminal).
# Usage: bash tools/feasibility-check.sh
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL="/mnt/data/LocalAI/Models/Embeddings/bge-m3-Q4_K_M.gguf"
BIN="/mnt/data/LocalAI/llama-b10184-bin-ubuntu-x64/llama-b10184"
PORT=8089
PASS=0; FAIL=0

ok()   { echo "  [PASS] $1"; PASS=$((PASS+1)); }
bad()  { echo "  [FAIL] $1"; FAIL=$((FAIL+1)); }

echo "== 1) llama-server embedding (local, offline) =="
pkill -f "llama-server.*$PORT" 2>/dev/null
LD_LIBRARY_PATH="$BIN" "$BIN/llama-server" \
  -m "$MODEL" --embeddings --pooling cls \
  --host 127.0.0.1 --port $PORT --no-webui >/tmp/llama-server.log 2>&1 &
SRV=$!
for i in $(seq 1 30); do
  curl -s --max-time 2 "http://127.0.0.1:$PORT/health" | grep -q '"status":"ok"' && break
  sleep 1
done
H=$(curl -s --max-time 3 "http://127.0.0.1:$PORT/health")
echo "  health: ${H:0:120}"
if echo "$H" | grep -q ok; then
  R=$(curl -s --max-time 60 -X POST "http://127.0.0.1:$PORT/v1/embeddings" \
      -H 'Content-Type: application/json' \
      -d '{"input":"چطور پروژه را روی لیارا دیپلوی کنم؟","model":"bge-m3"}')
  N=$(echo "$R" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);console.log(j.data? j.data[0].embedding.length : "ERR:"+JSON.stringify(j).slice(0,120))}catch(e){console.log("PARSE_ERR:"+s.slice(0,120))}})')
  echo "  embedding dim: $N"
  case "$N" in [0-9]*) ok "llama-server embeds (dim=$N)";; *) bad "embed failed: $N";; esac
else
  bad "llama-server not healthy; log tail:"; tail -5 /tmp/llama-server.log
fi
kill $SRV 2>/dev/null; wait $SRV 2>/dev/null

echo
echo "== 2) npm registry via Liara mirror =="
C=$(curl -sI --max-time 10 "https://mirror-npm.runflare.com/next" | head -1)
echo "  HEAD next: $C"
echo "$C" | grep -qi "200\|301\|302" && ok "mirror-npm.runflare.com reachable" || bad "mirror unreachable: $C"
C2=$(curl -sI --max-time 10 "https://registry.npmjs.org/next" | head -1)
echo "  HEAD registry.npmjs.org: $C2"
echo "$C2" | grep -qi "200\|301\|302" && ok "registry.npmjs.org reachable" || bad "npmjs unreachable: $C2"

echo
echo "== 3) kilo.ai LLM gateway =="
KEY=$(grep -E '^LLM_API_KEY=' "$ROOT/.env" 2>/dev/null | head -1 | cut -d= -f2-)
if [ -z "$KEY" ] || [ "$KEY" = "your_api_key_here" ]; then
  bad "no LLM_API_KEY in .env"
else
  R=$(curl -s --max-time 60 -X POST "https://api.kilo.ai/api/gateway/v1/chat/completions" \
      -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
      -d '{"model":"kilo-auto/free","messages":[{"role":"user","content":"سلام"}],"max_tokens":10}')
  echo "  chat: ${R:0:200}"
  echo "$R" | grep -q '"content"' && ok "kilo chat completions work" || bad "kilo chat failed"
  R2=$(curl -s --max-time 60 -X POST "https://api.kilo.ai/api/gateway/v1/embeddings" \
      -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
      -d '{"model":"text-embedding-3-small","input":"test"}')
  echo "  embeddings: ${R2:0:200}"
  echo "$R2" | grep -q '"embedding"' && ok "kilo embeddings endpoint work" || bad "kilo embeddings failed (ok if unused)"
fi

echo
echo "== results: $PASS pass, $FAIL fail =="
[ "$FAIL" -eq 0 ] || echo "NOTE: failures above decide which provider paths we enable."
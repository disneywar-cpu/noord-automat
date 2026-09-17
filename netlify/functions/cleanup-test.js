function cleanEnv(v) {
  return typeof v === "string" ? v.trim().replace(/^["']|["']$/g, "") : v;
}

exports.handler = async () => {
  const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL);
  const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !token) {
    return { statusCode: 500, body: JSON.stringify({ error: "Storage not configured" }) };
  }

  const commands = [
    ["DECRBY", "sobres:total", "1"],
    ["HDEL", "sobres:por_dia", "2026-09-17"],
    ["HDEL", "sobres:por_serie", "_test_verificacion"],
  ];

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });

  const body = await res.text();
  return { statusCode: res.status, body };
};

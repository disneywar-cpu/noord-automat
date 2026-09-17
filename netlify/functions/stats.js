function parseFlatHash(arr) {
  const out = {};
  for (let i = 0; i < arr.length; i += 2) {
    out[arr[i]] = parseInt(arr[i + 1], 10) || 0;
  }
  return out;
}

function cleanEnv(v) {
  return typeof v === "string" ? v.trim().replace(/^["']|["']$/g, "") : v;
}

exports.handler = async () => {
  const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL);
  const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !token) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Storage not configured" }),
    };
  }

  const commands = [
    ["GET", "sobres:total"],
    ["HGETALL", "sobres:por_dia"],
    ["HGETALL", "sobres:por_serie"],
  ];

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });

  if (!res.ok) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Storage error" }),
    };
  }

  const results = await res.json();
  const total = parseInt(results[0]?.result || "0", 10) || 0;
  const porDia = parseFlatHash(results[1]?.result || []);
  const porSerie = parseFlatHash(results[2]?.result || []);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ total, porDia, porSerie }),
  };
};

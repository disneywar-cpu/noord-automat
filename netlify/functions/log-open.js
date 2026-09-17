function cleanEnv(v) {
  return typeof v === "string" ? v.trim().replace(/^["']|["']$/g, "") : v;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL);
  const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!url || !token) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Storage not configured" }),
    };
  }

  let data = {};
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Bad Request" };
  }

  const serie = typeof data.serie === "string" && data.serie ? data.serie.slice(0, 40) : "desconocida";
  const day = new Date().toISOString().slice(0, 10);

  const commands = [
    ["INCR", "sobres:total"],
    ["HINCRBY", "sobres:por_dia", day, 1],
    ["HINCRBY", "sobres:por_serie", serie, 1],
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

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};

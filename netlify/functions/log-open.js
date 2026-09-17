const { getStore } = require("@netlify/blobs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let data = {};
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: "Bad Request" };
  }

  const serie = typeof data.serie === "string" && data.serie ? data.serie.slice(0, 40) : "desconocida";

  const store = getStore("sobres");
  const now = new Date();
  const id = `${now.toISOString()}-${Math.random().toString(36).slice(2, 8)}`;
  await store.setJSON(`event/${id}`, { serie, ts: now.toISOString() });

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true }),
  };
};

const { getStore } = require("@netlify/blobs");

exports.handler = async () => {
  const store = getStore("sobres");
  const { blobs } = await store.list({ prefix: "event/" });

  const events = await Promise.all(
    blobs.map((b) => store.get(b.key, { type: "json" }))
  );

  const valid = events.filter(Boolean);
  const total = valid.length;

  const porDia = {};
  const porSerie = {};
  for (const ev of valid) {
    const day = (ev.ts || "").slice(0, 10);
    if (day) porDia[day] = (porDia[day] || 0) + 1;
    porSerie[ev.serie] = (porSerie[ev.serie] || 0) + 1;
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ total, porDia, porSerie }),
  };
};

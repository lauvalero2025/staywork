export default async function handler(req, res) {
  try {
    const sheetId = "1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk"; // tu ID
    const sheetName = "Talent"; // nombre de la pestaña

    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
      sheetName
    )}`;

    const response = await fetch(url);
    const text = await response.text();

    // La respuesta viene envuelta en google.visualization... hay que limpiarla
    const jsonStr = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const data = JSON.parse(jsonStr);

    const rows = data.table?.rows || [];

    const db = rows.map((row) => ({
  name: row[0],
  location: row[1],
  expertise: row[2],
  link: row[3],
  approved: row[4],
  featured: row[5],
  photo: row[6] || "", // 👈 columna Photo
}));


    // solo los aprobados con "Yes"
    const sanitizeResult = db.filter(
      (item) => item.name && item.approved === "Yes"
    );

    res.status(200).json(sanitizeResult);
  } catch (err) {
    console.error("API /designers error:", err);
    res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
}

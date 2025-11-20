// pages/api/designers.js
// Versión SIN Google Auth: lee la hoja pública de Google Sheets

export default async function handler(req, res) {
  try {
    const sheetId = "1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk"; // tu ID
    const sheetName = "Talent"; // nombre de la pestaña

    // Google devuelve un pseudo-JSON envuelto en una función JS
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${encodeURIComponent(
      sheetName
    )}&tqx=out:json`;

    const response = await fetch(url);
    const text = await response.text();

    // Extraemos solo la parte JSON del texto
    const jsonString = text.substring(
      text.indexOf("{"),
      text.lastIndexOf("}") + 1
    );
    const data = JSON.parse(jsonString);

    const rows = data.table?.rows || [];

    // Columnas esperadas:
    // A: Name | B: Location | C: Expertise | D: Link | E: Show | F: Order
    const db = rows.map((row) => {
      const c = row.c || [];
      return {
        name: c[0]?.v || "",
        location: c[1]?.v || "",
        expertise: c[2]?.v || "",
        link: c[3]?.v || "",
        show: c[4]?.v || "",
        order: Number(c[5]?.v || 0),
      };
    });

    // Filtramos solo los que tienen nombre y Show = "Yes"
    const sanitizeResult = db.filter(
      (item) => item.name !== "" && item.show === "Yes"
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

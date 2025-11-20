// pages/api/designers.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // 👇 MUY IMPORTANTE: convertir los "\n" del ENV en saltos de línea reales
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({
      auth,
      version: "v4",
    });

    // 👇 Tu hoja
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk",
      range: "Talent", // nombre de la pestaña
    });

    const rows = response.data.values || [];

    // Suponiendo columnas:
    // A: Name | B: Location | C: Expertise | D: Link | E: Show | F: Order
    const db = rows
      .slice(1) // saltar cabecera
      .map((row) => ({
        name: row[0] || "",
        location: row[1] || "",
        expertise: row[2] || "",
        link: row[3] || "",
        show: row[4] || "",
        order: Number(row[5] || 0),
      }));

    // Solo mostrar los que tienen nombre y Show = "Yes"
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

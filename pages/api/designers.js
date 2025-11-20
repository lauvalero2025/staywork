// pages/api/designers.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // importante: convertir los \n del .env en saltos de línea reales
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk", // tu sheet
      range: "Talent", // nombre de la pestaña
    });

    const rows = response.data.values || [];

    // saltamos la primera fila (cabeceras)
    const db = rows.slice(1).map((row) => ({
      name: row[0] || "",
      location: row[1] || "",
      expertise: row[2] || "",
      link: row[3] || "",
      approved: row[4] || "",
      featured: row[5] ? Number(row[5]) : 0,
      photo: row[6] || "",
      instagram: row[7] || "",
      twitter: row[8] || "",
      linkedin: row[9] || "",
    }));

    const sanitizeResult = db.filter(
      (item) =>
        item.name &&
        typeof item.approved === "string" &&
        item.approved.toLowerCase() === "yes"
    );

    res.status(200).json(sanitizeResult);
  } catch (err) {
    console.error("Error in /api/designers:", err);
    res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
}

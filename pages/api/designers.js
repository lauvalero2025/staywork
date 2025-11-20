// pages/api/designers.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !rawPrivateKey) {
      return res.status(500).json({
        error: "Missing Google credentials",
      });
    }

    // IMPORTANTE: convertir "\n" en saltos de línea reales
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ auth, version: "v4" });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk", // TU hoja
      range: "Talent", // pestaña
    });

    const rows = response.data.values || [];

    // Primera fila = cabecera
    const [, ...dataRows] = rows;

    const db = dataRows.map((row) => ({
      name: row[0] || "",
      location: row[1] || "",
      expertise: row[2] || "",
      link: row[3] || "",
      show: row[4] || "",
      order: row[5] || "",
    }));

    // Solo los que tienen nombre y Show = "Yes"
    const visible = db.filter(
      (item) => item.name !== "" && item.show === "Yes"
    );

    return res.status(200).json(visible);
  } catch (err) {
    console.error("ERROR /api/designers:", err);
    return res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
}
export default function handler(req, res) {
  res.status(200).json({ ok: true });
}


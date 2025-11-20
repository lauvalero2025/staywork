// pages/api/designers.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
      },
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
      ],
    });

    const sheets = google.sheets({ auth, version: "v4" });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk",
      range: "Talent",
    });

    const rows = response.data.values || [];

    // Mapeo EXACTO a tu hoja:
    // A: Name
    // B: Location
    // C: Expertise
    // D: Link
    // E: Show
    // F: Order
    // G: Linkedin
    // H: Instagram
    // I: Photo (enlace público a imagen)
    const db = rows.map((row) => ({
      name: row[0] || "",
      location: row[1] || "",
      expertise: row[2] || "",
      link: row[3] || "",
      show: row[4] || "",
      order: row[5] || "",
      linkedin: row[6] || "",
      instagram: row[7] || "",
      photo: row[8] || "",
    }));

    // Filtramos:
    // - ignorar la fila de cabecera
    // - mostrar solo Show = "Yes"
    const visible = db.filter(
      (item) => item.name !== "" && item.show === "Yes"
    );

    res.status(200).json(visible);
  } catch (err) {
    console.error("API ERROR /api/designers:", err);
    res
      .status(500)
      .json({
        error: "Something went wrong",
        message: err.message,
      });
  }
}

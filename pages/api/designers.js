import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY || "";
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || "";

    // DEBUG SUAVE (no imprime la clave completa)
    console.log("DEBUG GOOGLE_CLIENT_EMAIL:", clientEmail);
    console.log(
      "DEBUG PRIVATE_KEY LENGTH:",
      rawPrivateKey ? rawPrivateKey.length : 0
    );
    console.log(
      "DEBUG PRIVATE_KEY START:",
      JSON.stringify(rawPrivateKey.slice(0, 40))
    );

    // Si no hay clave, devolvemos error legible
    if (!rawPrivateKey || !clientEmail) {
      return res.status(500).json({
        error: "Missing Google credentials",
      });
    }

    // Convertir \n literales en saltos de línea reales
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
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

    const visible = db.filter(
      (item) => item.name !== "" && item.show === "Yes"
    );

    return res.status(200).json(visible);
  } catch (err) {
    console.error("API ERROR /api/designers:", err);
    return res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
}

import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY,
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
      spreadsheetId: "1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk",
      range: "Talent",
    });

    const rows = response.data.values || [];

    const db = rows.map((row) => ({
      name: row[0],
      location: row[1],
      expertise: row[2],
      link: row[3],
      approved: row[4],
      featured: row[5],
    }));

    const sanitizeResult = db.filter(
      (item) => item.name && item.approved === "Yes"
    );

    res.status(200).json(sanitizeResult);
  } catch (err) {
    console.error("API /designers error:", err);
    res.status(500).json({
      error: "Something went wrong",
      message: err.message,
      details: err,
    });
  }
}

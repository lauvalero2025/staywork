// pages/api/designers.js

export default async function handler(req, res) {
  try {
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/1Ld2e0gThTd0B41aBiWXSs4rHiV2_KvFrMQYqTVYg8sk/export?format=csv&gid=0";

    const response = await fetch(csvUrl);
    const text = await response.text();

    const lines = text.trim().split("\n");
    const [header, ...rows] = lines;

    const db = rows.map((line) => {
      const cols = line.split(",");

      return {
        name: cols[0] || "",
        location: cols[1] || "",
        expertise: cols[2] || "",
        link: cols[3] || "",
        show: cols[4] || "",
        order: cols[5] || "",
      };
    });

    const visible = db.filter(
      (item) => item.name !== "" && item.show === "Yes"
    );

    res.status(200).json(visible);
  } catch (err) {
    console.error("ERROR /api/designers:", err);
    res.status(500).json({
      error: "Something went wrong",
      message: err.message,
    });
  }
}

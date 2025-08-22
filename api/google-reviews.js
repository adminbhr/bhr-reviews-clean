// Serverless function for Vercel (Node 18+)
export default async function handler(req, res) {
  try {
    const { GOOGLE_MAPS_API_KEY, PLACE_ID } = process.env;
    if (!GOOGLE_MAPS_API_KEY || !PLACE_ID) {
      return res.status(500).json({ error: "Missing env vars" });
    }

    // Places API (New): request fields via FieldMask header
    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?key=${GOOGLE_MAPS_API_KEY}`;
    const r = await fetch(url, { headers: { "X-Goog-FieldMask": "rating,userRatingCount,reviews" } });
    if (!r.ok) throw new Error(`Places API error ${r.status}`);
    const data = await r.json();

    const reviews = (data.reviews || [])
      .sort((a, b) => (b.publishTime || "").localeCompare(a.publishTime || ""))
      .slice(0, 4)
      .map(rv => ({
        author: rv.authorAttribution?.displayName || "Google user",
        profileUrl: rv.authorAttribution?.uri || "",
        text: rv.text?.text || "",
        rating: rv.rating || 0,
        time: rv.publishTime || ""
      }));

    res.setHeader("Access-Control-Allow-Origin", "*"); // allow Squarespace to fetch
    res.setHeader("Cache-Control", "public, max-age=600"); // 10 min cache
    res.status(200).json({
      rating: data.rating ?? null,
      reviewCount: data.userRatingCount ?? null,
      reviews,
      attribution: "Data from Google Maps"
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

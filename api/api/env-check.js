export default function handler(req, res) {
  res.status(200).json({
    hasKey: !!process.env.GOOGLE_MAPS_API_KEY,
    hasPlaceId: !!process.env.PLACE_ID
  });
}

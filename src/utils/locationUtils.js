import { HOSTEL_BLOCKS } from "./HostelCoordinates";
import { detectHostelBlock } from "./utils/locationUtils";


// Haversine formula (distance between 2 GPS points)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 🔥 MAIN FUNCTION
export function detectHostelBlock(lat, lng) {
  let nearestBlock = null;
  let minDistance = Infinity;

  for (const block in HOSTEL_BLOCKS) {
    const { lat: bLat, lng: bLng } = HOSTEL_BLOCKS[block];
    const distance = getDistance(lat, lng, bLat, bLng);

    if (distance < minDistance) {
      minDistance = distance;
      nearestBlock = block;
    }
  }

  // Safety radius: 80 meters
  return minDistance <= 80 ? nearestBlock : null;
}

/**
 * Formats distance in km or meters cleanly.
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || distanceKm === null) {
    return 'Nearby';
  }
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

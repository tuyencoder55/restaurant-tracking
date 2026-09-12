// Tiện ích chuyển đổi địa chỉ thành toạ độ (Geocoding) dùng Nominatim OpenStreetMap
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address || address.trim().length === 0) return null;

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          'Accept-Language': 'vi,en',
          'User-Agent': 'RestaurantTrackingApp/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const results = await response.json();
    if (results && results.length > 0) {
      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Lỗi khi geocode địa chỉ:', error);
    return null;
  }
}

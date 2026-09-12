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

// Tiện ích chuyển đổi toạ độ GPS thành địa chỉ thực tế (Reverse Geocoding)
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'vi,en',
          'User-Agent': 'RestaurantTrackingApp/1.0',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data) {
      if (data.address) {
        const addr = data.address;
        const parts: string[] = [];

        // Số nhà & tên đường
        const street = addr.road || addr.pedestrian || addr.footway || addr.suburb || '';
        const houseNumber = addr.house_number || '';
        if (houseNumber && street) {
          parts.push(`${houseNumber} ${street}`);
        } else if (street) {
          parts.push(street);
        }

        // Phường / Xã / Khu phố
        const ward = addr.quarter || addr.neighbourhood || addr.suburb || '';
        if (ward && !parts.includes(ward)) parts.push(ward);

        // Quận / Huyện / Thị xã
        const district = addr.city_district || addr.district || addr.town || addr.county || '';
        if (district && !parts.includes(district)) parts.push(district);

        // Tỉnh / Thành phố
        const city = addr.city || addr.state || '';
        if (city && !parts.includes(city)) parts.push(city);

        if (parts.length > 0) {
          return parts.join(', ');
        }
      }

      if (data.display_name) {
        return data.display_name;
      }
    }

    return null;
  } catch (error) {
    console.error('Lỗi khi reverse geocode toạ độ:', error);
    return null;
  }
}

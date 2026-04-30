import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});


const locationIcon = new L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E83D39" width="40px" height="40px" style="filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.4));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>`,
  className: "custom-location-icon",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

function LocationMarker({ setFormData, formData }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      let district = "";
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        
        // Extract the district name gracefully using Sri Lankan OSM conventions
        if (data && data.address) {
          const region = data.address.state_district || data.address.county || data.address.state || "";
          district = region.replace(" District", "");
        }
      } catch (err) {
        console.error("Reverse geocoding failed", err);
      }

      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        district: district
      }));
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={locationIcon} />
  );
}

export default function LocationPicker({ formData, setFormData }) {
  return (
    <MapContainer
      center={[7.8731, 80.7718]} // Sri Lanka center
      zoom={7}
      minZoom={7}
      maxBounds={[[5.9, 79.5], [9.9, 81.9]]}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker
        formData={formData}
        setFormData={setFormData}
      />
    </MapContainer>
  );
}

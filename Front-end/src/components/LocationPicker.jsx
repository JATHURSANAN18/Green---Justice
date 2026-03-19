import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";

function LocationMarker({ setFormData, formData }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      setFormData({
        ...formData,
        latitude: lat,
        longitude: lng,
      });
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function LocationPicker({ formData, setFormData }) {
  return (
    <MapContainer
      center={[7.8731, 80.7718]} // Sri Lanka center
      zoom={7}
      style={{ height: "400px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker formData={formData} setFormData={setFormData} />
    </MapContainer>
  );
}
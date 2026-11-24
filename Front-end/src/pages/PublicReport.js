import React from "react";
import Navbar from "../components/Navbar"; 
import LocationPicker from "../components/LocationPicker";
import { useSubmitReport } from '../hooks/useSubmitReport';
import { FormField } from '../components/common/FormField';
import "../pages/PublicReport.css";

const violationCategories = [
  { value: "", label: "Select Violation Type" },
  { value: "illegal-dumping", label: "♻️ Illegal Dumping" },
  { value: "water-pollution", label: "💧 Water Pollution" },
  { value: "air-pollution", label: "💨 Air Pollution" },
  { value: "deforestation", label: "🌲 Deforestation" },
  { value: "wildlife", label: "🦁 Wildlife Poaching" },
  { value: "noise", label: "🔊 Noise Pollution" },
  { value: "chemical", label: "☢️ Chemical Waste" },
  { value: "landfill", label: "🗑️ Illegal Landfill" },
  { value: "other", label: "❓ Other" },
];

const PublicReport = () => {
  const { 
    formData, setFormData, mediaFiles, loading, success, 
    handleChange, handleMediaChange, removeMedia, handleSubmit 
  } = useSubmitReport();

  if (success) {
    return (
      <>
        <Navbar />
        <div className="success-container">
          <div className="success-card">
            <div className="success-icon">✅</div>
            <h2>Report Submitted Successfully!</h2>
            <p>Thank you for helping protect the environment.</p>
            <p>Authority will review your report soon.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="report-container">
        <div className="report-card">
          <div className="report-header">
            <h1>🌍 Report Environmental Violation</h1>
            <p>Help us protect our environment by reporting violations.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormField label="Violation Type" required>
              <select name="category" value={formData.category} onChange={handleChange} required>
                {violationCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </FormField>

            <FormField label="📍 Location">
              <LocationPicker formData={formData} setFormData={setFormData} required/>
              <input
                type="text"
                name="locationName"
                value={formData.locationName}
                onChange={handleChange}
                placeholder="Or enter location name"
                className="location-input"
              />
              {formData.latitude && (
                <p className="coordinates">
                  📌 Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                </p>
              )}
            </FormField>

            <FormField label="📷 Photo/Video Evidence (Max 5)">
              <div className="upload-container">
                <input
                  type="file" id="media-upload" required onChange={handleMediaChange}
                  accept="image/*,video/*" multiple disabled={mediaFiles.length >= 5}
                />
                <label htmlFor="media-upload" className="upload-label">
                  <span className="upload-icon">📁</span>
                  <span>Click to upload photos/videos</span>
                </label>
              </div>

              {mediaFiles.length > 0 && (
                <div className="media-preview">
                  {mediaFiles.map((file, index) => (
                    <div key={index} className="media-item">
                      {file.type.startsWith("image/") ? (
                        <img src={file.data} alt="preview" />
                      ) : (
                        <div className="video-preview">🎬 <br /> Video</div>
                      )}
                      <button type="button" onClick={() => removeMedia(index)} className="remove-btn">✕</button>
                      <span className="file-name">{file.name.substring(0, 12)}...</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="media-count">{mediaFiles.length}/5 files selected</p>
            </FormField>

            <FormField label="📝 Description (Optional)">
              <textarea
                name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe the violation..." rows="4"
              />
            </FormField>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "🚀 Submit Report"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PublicReport;

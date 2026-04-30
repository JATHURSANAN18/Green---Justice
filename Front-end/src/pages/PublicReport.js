import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import LocationPicker from "../components/LocationPicker";
import { createReport } from '../api';
import "../pages/PublicReport.css";

const PublicReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    latitude: "",
    longitude: "",
    locationName: "",
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to base64 for storage
    const fileReaders = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            type: file.type,
            data: reader.result, // base64 data
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((processedFiles) => {
      const newMedia = [...mediaFiles, ...processedFiles].slice(0, 5);
      setMediaFiles(newMedia);
    });
  };

  const removeMedia = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  // Map frontend categories to backend DB strings
  const categoryToViolationType = {
    "illegal-dumping": "Illegal waste disposal",
    "water-pollution": "Water pollution",
    "air-pollution": "Air pollution",
    "deforestation": "Deforestation",
    "noise": "Noise pollution",
    "wildlife": "Wildlife Poaching",
    "chemical": "Chemical Waste",
    "landfill": "Illegal Landfill",
    "other": "Other"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      alert("Please select a violation type!");
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      alert("Please pin the violation location on the map!");
      return;
    }

    setLoading(true);

    try {
      const violationType = categoryToViolationType[formData.category] || "Other";
      
      // Determine file info from first file (used for inline send)
      const firstFile = mediaFiles.length > 0 ? mediaFiles[0] : null;

      const payload = {
        user_id: null,
        violation_type: violationType,
        description: formData.description,
        location_name: formData.locationName,
        longitude: formData.longitude || null,
        latitude: formData.latitude || null,
        file_type: firstFile ? firstFile.type : "",
        file_url: firstFile ? firstFile.data : ""
      };

      await createReport(payload);

      setSuccess(true);
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      alert(err.response?.data?.error || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            {/* Category */}
            <div className="form-group">
              <label>
                Violation Type <span className="required">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {violationCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label>📍 Location</label>
              {/* Location selected from map */}
<             LocationPicker formData={formData} setFormData={setFormData} required/>

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
            </div>

            {/* Photo/Video Upload */}
            <div className="form-group">
              <label>📷 Photo/Video Evidence (Max 5)</label>
              <div className="upload-container">
                <input
                  type="file"
                  id="media-upload"
                  required
                  onChange={handleMediaChange}
                  accept="image/*,video/*"
                  multiple
                  disabled={mediaFiles.length >= 5}
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
                        <div className="video-preview">
                          🎬 <br /> Video
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="remove-btn"
                      >
                        ✕
                      </button>
                      <span className="file-name">{file.name.substring(0, 12)}...</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="media-count">{mediaFiles.length}/5 files selected</p>
            </div>

            {/* Description */}
            <div className="form-group">
              <label>📝 Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the violation..."
                rows="4"
              />
            </div>

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


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport } from '../api';

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

export const useSubmitReport = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: "",
        description: "",
        latitude: "",
        longitude: "",
        locationName: "",
        district: "", // ADDED DISTRICT
    });
    const [mediaFiles, setMediaFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        const fileReaders = files.map((file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        name: file.name,
                        type: file.type,
                        data: reader.result,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category) return alert("Please select a violation type!");
        if (!formData.latitude || !formData.longitude) return alert("Please pin the violation location on the map!");

        setLoading(true);
        try {
            const violationType = categoryToViolationType[formData.category] || "Other";
            const firstFile = mediaFiles.length > 0 ? mediaFiles[0] : null;

            const payload = {
                user_id: null,
                violation_type: violationType,
                description: formData.description,
                location_name: formData.locationName,
                longitude: formData.longitude || null,
                latitude: formData.latitude || null,
                district: formData.district || null, // ADDED DISTRICT
                file_type: firstFile ? firstFile.type : "",
                file_url: firstFile ? firstFile.data : ""
            };

            await createReport(payload);
            setSuccess(true);
            setTimeout(() => { navigate("/"); }, 2000);
        } catch (err) {
            console.error("Submission error:", err);
            alert(err.response?.data?.error || "Failed to submit report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, mediaFiles, loading, success, handleChange, handleMediaChange, removeMedia, handleSubmit };
};

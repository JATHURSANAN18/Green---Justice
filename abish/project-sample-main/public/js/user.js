document.addEventListener('DOMContentLoaded', () => {
  const steps = Array.from(document.querySelectorAll('.wizard-step'));
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  function showStep(stepNumber) {
    steps.forEach((s) =>
      s.classList.toggle('active', s.dataset.step === String(stepNumber))
    );
  }

  document.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = btn.closest('.wizard-step');
      if (!current) return;
      const stepNum = Number(current.dataset.step || 1);
      showStep(stepNum + 1);
      if (stepNum + 1 === 3 && typeof window.gjInitMapIfReady === 'function') {
        window.gjInitMapIfReady();
      }
    });
  });

  document.querySelectorAll('[data-prev]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = btn.closest('.wizard-step');
      if (!current) return;
      const stepNum = Number(current.dataset.step || 1);
      showStep(stepNum - 1);
    });
  });

  const complaintForm = document.getElementById('complaint-form');
  const thankYou = document.getElementById('thank-you');
  const trackingIdEl = document.getElementById('tracking-id');
  const statusLinkEl = document.getElementById('status-link');

  if (complaintForm) {
    complaintForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData();
      const language = document.getElementById('language-select')?.value || 'en';
      const violationType = document.getElementById('violation-type').value;
      const location = document.getElementById('location').value;
      const description = document.getElementById('description').value;
      const mediaInput = document.getElementById('media');

      formData.append('language', language);
      formData.append('violation_type', violationType);
      formData.append('location', location);
      if (description) formData.append('description', description);
      if (mediaInput && mediaInput.files[0]) {
        formData.append('media', mediaInput.files[0]);
      }

      try {
        const res = await fetch('/api/complaints', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || 'There was a problem submitting your report.');
          return;
        }

        const complaintId = data?.complaint?.id;
        if (complaintId && trackingIdEl) {
          trackingIdEl.textContent = String(complaintId);
        }
        if (complaintId && statusLinkEl) {
          statusLinkEl.href = `status.html?id=${encodeURIComponent(
            String(complaintId)
          )}`;
          statusLinkEl.classList.remove('hidden');
        }

        complaintForm.classList.add('hidden');
        thankYou.classList.remove('hidden');
      } catch (err) {
        console.error(err);
        alert('Unable to submit your report right now. Please try again later.');
      }
    });
  }
});

// --- Leaflet map integration for location pin (no API key needed) ---
(() => {
  let map;
  let marker;

  function setLocationFromLatLng(lat, lng) {
    const locationInput = document.getElementById('location');
    if (!locationInput) return;
    const formatted = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (!locationInput.value) {
      locationInput.value = formatted;
    } else if (!locationInput.value.includes(formatted)) {
      locationInput.value = `${locationInput.value} (${formatted})`;
    }
  }

  function initMap() {
    const mapEl = document.getElementById('gj-map');
    if (!mapEl || map) return;

    map = L.map(mapEl).setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (!marker) {
        marker = L.marker([lat, lng]).addTo(map);
      } else {
        marker.setLatLng([lat, lng]);
      }
      setLocationFromLatLng(lat, lng);
    });
  }

  window.gjInitMapIfReady = () => {
    if (typeof L === 'undefined') return;
    initMap();
  };
})();


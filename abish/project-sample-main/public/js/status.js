document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const form = document.getElementById('status-form');
  const input = document.getElementById('tracking-id-input');
  const message = document.getElementById('status-message');
  const result = document.getElementById('status-result');
  const resultViolation = document.getElementById('result-violation');
  const resultStatus = document.getElementById('result-status');
  const resultUpdated = document.getElementById('result-updated');

  function setMessage(text, type) {
    if (!message) return;
    message.textContent = text || '';
    message.className = 'form-message' + (type ? ` ${type}` : '');
  }

  function humanize(v) {
    if (!v) return '';
    return String(v)
      .replace(/_/g, ' ')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async function loadStatus(id) {
    setMessage('', '');
    result?.classList.add('hidden');
    const res = await fetch(`/api/public/complaints/${encodeURIComponent(id)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message || 'Unable to load status.', 'error');
      return;
    }

    if (resultViolation) resultViolation.textContent = humanize(data.violation_type);
    if (resultStatus) resultStatus.textContent = humanize(data.status);
    if (resultUpdated)
      resultUpdated.textContent = data.updated_at
        ? new Date(data.updated_at).toLocaleString()
        : '—';
    result?.classList.remove('hidden');
  }

  // Prefill from query string if present: status.html?id=123
  const params = new URLSearchParams(window.location.search);
  const qsId = params.get('id');
  if (qsId && input) {
    input.value = qsId;
    loadStatus(qsId);
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = input?.value?.trim();
    if (!id) {
      setMessage('Tracking ID is required.', 'error');
      return;
    }
    loadStatus(id);
  });
});


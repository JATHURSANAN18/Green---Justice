document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const token = localStorage.getItem('gj_token');
  const authorityName = localStorage.getItem('gj_authority_name');
  const nameEl = document.getElementById('authority-name');
  const logoutBtn = document.getElementById('logout-btn');
  const sortSelect = document.getElementById('sort-select');
  const container = document.getElementById('complaints-container');
  const emptyState = document.getElementById('empty-state');

  if (!token) {
    window.location.href = 'authority.html';
    return;
  }

  if (nameEl && authorityName) {
    nameEl.textContent = authorityName;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('gj_token');
      localStorage.removeItem('gj_authority_name');
      window.location.href = 'authority.html';
    });
  }

  async function fetchComplaints() {
    const sort = sortSelect ? sortSelect.value : 'recent';
    try {
      const res = await fetch(`/api/complaints?sort=${encodeURIComponent(sort)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        window.location.href = 'authority.html';
        return;
      }
      const data = await res.json();
      renderComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function markViewed(id) {
    try {
      await fetch(`/api/complaints/${id}/viewed`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  }

  function renderComplaints(list) {
    if (!container) return;
    container.innerHTML = '';
    if (!list.length) {
      emptyState?.classList.remove('hidden');
      return;
    }
    emptyState?.classList.add('hidden');

    list.forEach((c) => {
      const card = document.createElement('article');
      card.className = 'complaint-card';

      const created = new Date(c.created_at);
      const createdStr = created.toLocaleString();

      const statusClass = `status-${c.status}`;
      const viewedLabel = c.viewed_at ? 'Viewed' : 'Not viewed';
      const viewedClass = c.viewed_at ? 'tag' : 'tag';

      card.innerHTML = `
        <div class="complaint-main">
          <h3>${escapeHtml(
            humanizeViolationType(c.violation_type)
          )} <span class="tag">#${c.id}</span></h3>
          <p>${escapeHtml(c.description || 'No additional description provided.')}</p>
          <div class="complaint-meta">
            <span>${escapeHtml(c.location || 'No location provided')}</span> ·
            <span>${createdStr}</span> ·
            <span>Reports: ${c.reports_count}</span>
          </div>
          <div class="complaint-actions">
            <span class="status-pill ${statusClass}">${escapeHtml(
              humanizeStatus(c.status)
            )}</span>
            <span class="${viewedClass}">${escapeHtml(viewedLabel)}</span>
            ${
              c.media_filename
                ? `<a href="/uploads/${encodeURIComponent(
                    c.media_filename
                  )}" target="_blank" class="btn ghost small">View media</a>`
                : ''
            }
            <button class="btn ghost small" data-status="open" data-id="${
              c.id
            }">Mark open</button>
            <button class="btn ghost small" data-status="in_progress" data-id="${
              c.id
            }">In progress</button>
            <button class="btn ghost small" data-status="resolved" data-id="${
              c.id
            }">Resolved</button>
            <button class="btn ghost small" data-delete="${c.id}">
              Delete as fake
            </button>
          </div>
        </div>
        <div class="complaint-side">
          <div class="office-box" data-office-for="${c.violation_type}">
            <strong>Relevant office</strong>
            <span>Loading contact details…</span>
          </div>
        </div>
      `;

      container.appendChild(card);

      const officeBox = card.querySelector(
        `[data-office-for="${CSS.escape(c.violation_type)}"]`
      );
      if (officeBox) {
        fetchOfficeInfo(c.violation_type, officeBox);
      }

      if (!c.viewed_at) {
        markViewed(c.id);
      }
    });

    container.querySelectorAll('button[data-status]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        if (!id || !status) return;
        try {
          await fetch(`/api/complaints/${id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
          });
          fetchComplaints();
        } catch (err) {
          console.error(err);
        }
      });
    });

    container.querySelectorAll('button[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-delete');
        if (!id) return;
        if (!confirm('Delete this report as a fake allegation?')) return;
        try {
          await fetch(`/api/complaints/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          fetchComplaints();
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  async function fetchOfficeInfo(violationType, boxEl) {
    try {
      const res = await fetch(
        `/api/offices?violation_type=${encodeURIComponent(violationType)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data.office) {
        boxEl.innerHTML = `
          <strong>Relevant office</strong>
          <span>No office configured for this violation type yet.</span>
        `;
        return;
      }
      const o = data.office;
      boxEl.innerHTML = `
        <strong>${escapeHtml(o.name)}</strong>
        <div>${escapeHtml(o.address || 'Address not available')}</div>
        <div>Phone: ${escapeHtml(o.phone || 'N/A')}</div>
        <div>Email: ${escapeHtml(o.email || 'N/A')}</div>
      `;
    } catch (err) {
      console.error(err);
      boxEl.innerHTML = `
        <strong>Relevant office</strong>
        <span>Unable to load contact details.</span>
      `;
    }
  }

  function humanizeViolationType(v) {
    if (!v) return 'Violation';
    return v
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function humanizeStatus(s) {
    return (s || 'open')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', fetchComplaints);
  }

  fetchComplaints();
  setInterval(fetchComplaints, 10000);
});


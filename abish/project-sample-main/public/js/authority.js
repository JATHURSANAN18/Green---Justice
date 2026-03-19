// Year auto update
document.getElementById('year').textContent = new Date().getFullYear();

// Tab switching
const tabs = document.querySelectorAll('.auth-tab');
const panels = document.querySelectorAll('.auth-panel');
const messageBox = document.getElementById('auth-message');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));

    tab.classList.add('active');
    document
      .getElementById('auth-' + tab.dataset.tab)
      .classList.add('active');

    clearMessage();
  });
});

function clearMessage() {
  messageBox.textContent = '';
  messageBox.className = 'form-message';
}

function showMessage(msg, type) {
  messageBox.textContent = msg;
  messageBox.className = 'form-message ' + type; // success or error
}

async function handleAuth(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

/* =========================
   SIGN UP (Backend API)
========================= */
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  clearMessage();
  if (!name || !email || !password) {
    showMessage('All fields are required.', 'error');
    return;
  }

  try {
    const { res, data } = await handleAuth('/api/auth/signup', {
      name,
      email,
      password,
    });

    if (!res.ok) {
      showMessage(data.message || 'Unable to create account.', 'error');
      return;
    }

    localStorage.setItem('gj_token', data.token);
    localStorage.setItem('gj_authority_name', data.authority?.name || name);
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    showMessage('Unable to create account right now.', 'error');
  }
});


/* =========================
   LOGIN (Backend API)
========================= */
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  clearMessage();
  if (!email || !password) {
    showMessage('Email and password are required.', 'error');
    return;
  }

  try {
    const { res, data } = await handleAuth('/api/auth/login', {
      email,
      password,
    });

    if (!res.ok) {
      showMessage(data.message || 'Invalid email or password.', 'error');
      return;
    }

    localStorage.setItem('gj_token', data.token);
    localStorage.setItem(
      'gj_authority_name',
      data.authority?.name || 'Authority'
    );
    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    showMessage('Unable to log in right now.', 'error');
  }
});
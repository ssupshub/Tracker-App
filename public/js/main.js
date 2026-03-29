// main.js
import { stateStore } from './state.js';
import { login, register, logout, getSubjects, createSubject } from './api.js';
import { renderUI, validateInput, showToast } from './ui.js';

// Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const loginContainer = document.getElementById('login-container');
const registerContainer = document.getElementById('register-container');

const logoutBtn = document.getElementById('btn-logout');
const subjectForm = document.getElementById('subject-form');
const subjectInput = document.getElementById('subject-input');

// Subscribe UI renderer to State
stateStore.subscribe(renderUI);

// Initialization / Hydration
async function initApp() {
  // Check if we have a cached user in localStorage
  const storedUser = localStorage.getItem('trackerUser');
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser);
      stateStore.setState({ user: u });
      // Fetch subjects silently — if session expired the 401 handler will clean up
      fetchSubjects().catch(() => {});
    } catch {
      localStorage.removeItem('trackerUser');
    }
  }

  // Initial render
  renderUI(stateStore.getState());
}

async function fetchSubjects() {
  stateStore.setState({ isFetching: true });
  try {
    const subs = await getSubjects();
    stateStore.setState({ subjects: subs, isFetching: false });
  } catch (error) {
    stateStore.setState({ isFetching: false });
  }
}

// Global Event Listeners
document.addEventListener('auth:unauthorized', () => {
  localStorage.removeItem('trackerUser');
  stateStore.setState({ user: null, subjects: [] });
});

document.addEventListener('app:refreshSubjects', () => {
  fetchSubjects();
});

// Auth View Toggles
showRegisterBtn.addEventListener('click', () => {
  loginContainer.style.display = 'none';
  registerContainer.style.display = 'flex';
  registerContainer.classList.add('animate-fade-in');
});

showLoginBtn.addEventListener('click', () => {
  registerContainer.style.display = 'none';
  loginContainer.style.display = 'flex';
  loginContainer.classList.add('animate-fade-in');
});

// LoginForm
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const u = document.getElementById('login-username');
  const p = document.getElementById('login-password');

  if (!validateInput(u) || !validateInput(p, 5)) {
    showToast('Please check inputs (pass >= 5 chars)', 'error');
    return;
  }

  const btn = loginForm.querySelector('button');
  btn.textContent = 'Logging in...';
  try {
    const data = await login(u.value.trim(), p.value.trim());
    localStorage.setItem('trackerUser', JSON.stringify(data.user));
    stateStore.setState({ user: data.user });
    loginForm.reset();
    showToast('Logged in successfully');
    await fetchSubjects();
  } catch (err) {
    // Toast handles error message automatically
  } finally {
    btn.textContent = 'Login';
  }
});

// RegisterForm
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const u = document.getElementById('register-username');
  const p = document.getElementById('register-password');

  if (!validateInput(u) || !validateInput(p, 5)) {
    showToast('Please check inputs (pass >= 5 chars)', 'error');
    return;
  }

  const btn = registerForm.querySelector('button');
  btn.textContent = 'Registering...';
  try {
    const data = await register(u.value.trim(), p.value.trim());
    localStorage.setItem('trackerUser', JSON.stringify(data.user));
    stateStore.setState({ user: data.user });
    registerForm.reset();
    showToast('Registered & Logged in successfully');
    await fetchSubjects();
  } catch (err) {
  } finally {
    btn.textContent = 'Register';
  }
});

// Logout
logoutBtn.addEventListener('click', async () => {
  await logout().catch(() => {});
  localStorage.removeItem('trackerUser');
  stateStore.setState({ user: null, subjects: [] });
  showToast('Logged out');
});

// Add Subject
subjectForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (validateInput(subjectInput)) {
    try {
      stateStore.setState({ isFetching: true });
      await createSubject(subjectInput.value.trim());
      subjectInput.value = '';
      subjectInput.classList.remove('success'); // Reset visual
      await fetchSubjects();
      showToast('Subject created!', 'success');
    } catch (error) {
    } finally {
      stateStore.setState({ isFetching: false });
    }
  }
});

// Run Init
initApp();

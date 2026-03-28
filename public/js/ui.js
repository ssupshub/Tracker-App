// ui.js
import { stateStore } from './state.js';
import { createSubject, deleteSubject, addTopic, toggleTopic } from './api.js';

// Elements
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

// Show a temporary toast message
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  
  toastContainer.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'fadeInUp 200ms forwards reverse';
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

// Validate input length and display visual shake error
export function validateInput(inputEl, minLength = 3) {
  const val = inputEl.value.trim();
  if (val.length < minLength) {
    inputEl.classList.remove('success');
    inputEl.classList.add('error', 'animate-shake');
    // Remove shake class after animation completes
    setTimeout(() => inputEl.classList.remove('animate-shake'), 400);
    return false;
  }
  inputEl.classList.remove('error');
  inputEl.classList.add('success');
  return true;
}

// Calculate total progress
function calculateProgress(subjects) {
  let totalTopics = 0;
  let completedTopics = 0;

  subjects.forEach(sub => {
    totalTopics += sub.topics.length;
    completedTopics += sub.topics.filter(t => t.completed).length;
  });

  if (totalTopics === 0) return 0;
  return Math.round((completedTopics / totalTopics) * 100);
}

// UI Rendering Engine
export function renderUI(state) {
  renderAuthSections(state.user);
  
  if (state.user) {
    if (state.isFetching) {
      renderSkeletons();
    } else {
      renderSubjects(state.subjects);
      renderProgress(state.subjects);
    }
  }
}

function renderAuthSections(user) {
  const authContainer = document.getElementById('auth-section');
  const mainApp = document.getElementById('main-app');
  
  if (user) {
    authContainer.style.display = 'none';
    mainApp.style.display = 'block';
    mainApp.classList.add('animate-fade-in');
  } else {
    authContainer.style.display = 'flex';
    mainApp.style.display = 'none';
    authContainer.classList.add('animate-fade-in');
  }
}

function renderSkeletons() {
  const listEl = document.getElementById('subjects-list');
  listEl.innerHTML = '';
  
  for (let i = 0; i < 3; i++) {
    const skeletonHTML = `
      <div class="glass-panel">
        <div class="skeleton skeleton-text" style="width: 50%; height: 1.5rem;"></div>
        <div style="margin-top: 1rem;">
          <div class="skeleton skeleton-text" style="width: 100%;"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
        </div>
      </div>
    `;
    listEl.insertAdjacentHTML('beforeend', skeletonHTML);
  }
}

function renderProgress(subjects) {
  const progressText = document.getElementById('overall-progress-text');
  const progressBar = document.getElementById('overall-progress-bar');
  
  const percentage = calculateProgress(subjects);
  progressText.textContent = `${percentage}% Overall Complete`;
  progressBar.style.width = `${percentage}%`;
}

async function triggerActionWrap(action, payload) {
  try {
    stateStore.setState({ isFetching: true });
    await action(payload);
    // Let main.js refresh subjects after an action completes successfully
    document.dispatchEvent(new Event('app:refreshSubjects'));
  } finally {
    stateStore.setState({ isFetching: false });
  }
}

export function renderSubjects(subjects) {
  const listEl = document.getElementById('subjects-list');
  listEl.innerHTML = '';

  if (subjects.length === 0) {
    listEl.innerHTML = `<p style="text-align: center; grid-column: 1/-1;">No subjects added yet. Start by adding one above!</p>`;
    return;
  }

  subjects.forEach(sub => {
    // Generate Component
    const el = document.createElement('div');
    el.className = 'glass-panel animate-fade-in';
    
    // Header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '1rem';
    
    const title = document.createElement('h3');
    title.textContent = sub.name;
    
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.innerHTML = '&times;';
    delBtn.title = 'Delete Subject';
    delBtn.onclick = () => {
      if(confirm('Delete this subject and all its topics?')) {
        triggerActionWrap(deleteSubject, sub._id);
      }
    };
    
    header.appendChild(title);
    header.appendChild(delBtn);
    el.appendChild(header);

    // Topics List
    const ul = document.createElement('ul');
    sub.topics.forEach(topic => {
      const li = document.createElement('li');
      li.className = `topic-item ${topic.completed ? 'completed' : ''}`;
      
      li.innerHTML = `
        <span class="topic-name mono-text">${topic.name}</span>
        <div class="topic-checkbox"></div>
      `;
      
      li.onclick = () => triggerActionWrap(() => toggleTopic(sub._id, topic._id));
      ul.appendChild(li);
    });
    el.appendChild(ul);

    // Add Topic Input
    const addTopicDiv = document.createElement('div');
    addTopicDiv.style.marginTop = '1rem';
    addTopicDiv.style.display = 'flex';
    addTopicDiv.style.gap = '0.5rem';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'neu-input mono-text';
    input.placeholder = 'New topic...';
    
    const btn = document.createElement('button');
    btn.className = 'neu-button primary';
    btn.textContent = 'Add';
    
    const submitTopic = () => {
      if (validateInput(input, 2)) {
        triggerActionWrap(() => addTopic(sub._id, input.value.trim()));
      }
    };

    btn.onclick = submitTopic;
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitTopic();
    });

    addTopicDiv.appendChild(input);
    addTopicDiv.appendChild(btn);
    el.appendChild(addTopicDiv);

    listEl.appendChild(el);
  });
}

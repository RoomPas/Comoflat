// ==================== AI CHAT PAGE ====================
async function sendAIMessage() {
  if (!currentUser) return;

  const input = document.getElementById('ai-user-input');
  const message = input.value.trim();
  if (!message) return;

  // Display user message
  const messagesContainer = document.getElementById('ai-messages');
  const userMessageEl = document.createElement('div');
  userMessageEl.className = 'user-message';
  userMessageEl.innerHTML = `<p>${message}</p>`;
  messagesContainer.appendChild(userMessageEl);

  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  // Get AI response
  const result = await sendAIChatAPI(currentUser.id, message);
  
  const aiMessageEl = document.createElement('div');
  aiMessageEl.className = 'ai-message';
  aiMessageEl.innerHTML = `<p>${result.message || result.error}</p>`;
  messagesContainer.appendChild(aiMessageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleAIKeyPress(event) {
  if (event.key === 'Enter') {
    sendAIMessage();
  }
}

async function resetAIChat() {
  if (!currentUser) return;

  const result = await resetAIChatAPI(currentUser.id);
  if (result && result.success) {
    document.getElementById('ai-messages').innerHTML = `
      <div class="ai-message">
        <p>Hello! 👋 I'm your AI rental agent. Let me help you find the perfect accommodation. What location are you interested in?</p>
      </div>
    `;
  }
}

// ==================== MESSAGING PAGE ====================
let selectedConversation = null;
let allUsers = [];

async function loadConversations() {
  if (!currentUser) return;

  // Get all users
  const listings = await getListingsAPI();
  const seenUserIds = new Set();
  allUsers = [];

  // Get users from listings
  for (const listing of listings) {
    if (
      listing.createdBy !== currentUser.id &&
      !seenUserIds.has(listing.createdBy)
    ) {
      seenUserIds.add(listing.createdBy);
      const user = await getUserAPI(listing.createdBy);
      if (user) {
        allUsers.push(user);
      }
    }
  }

  // Display conversations
  const container = document.getElementById('conversations-container');
  container.innerHTML = '';

  if (allUsers.length === 0) {
    container.innerHTML = '<p>No conversations</p>';
    return;
  }

  allUsers.forEach((user) => {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    if (selectedConversation && selectedConversation.id === user.id) {
      item.classList.add('active');
    }
    item.innerHTML = `
      <img src="${user.avatar}" style="width: 40px; height: 40px; border-radius: 50%; margin-bottom: 10px;">
      <div>${user.username}</div>
    `;
    item.onclick = () => selectConversation(user);
    container.appendChild(item);
  });
}

async function selectConversation(user) {
  selectedConversation = user;

  // Update active state
  document.querySelectorAll('.conversation-item').forEach((item) => {
    item.classList.remove('active');
  });
  event.target.closest('.conversation-item').classList.add('active');

  // Load messages
  const messages = await getMessagesAPI(currentUser.id, user.id);

  // Update header
  document.getElementById('message-thread-header').innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <img src="${user.avatar}" style="width: 40px; height: 40px; border-radius: 50%;">
      <div>${user.username}</div>
    </div>
  `;

  // Display messages
  const container = document.getElementById('messages-content');
  container.innerHTML = '';

  messages.forEach((msg) => {
    const msgEl = document.createElement('div');
    msgEl.className = msg.from === currentUser.id ? 'message sent' : 'message received';
    msgEl.textContent = msg.text;
    container.appendChild(msgEl);
  });

  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  if (!currentUser || !selectedConversation) {
    alert('Please select a conversation');
    return;
  }

  const text = document.getElementById('message-text').value.trim();
  if (!text) return;

  const result = await sendMessageAPI(currentUser.id, selectedConversation.id, text);
  if (result && result.success) {
    document.getElementById('message-text').value = '';
    selectConversation(selectedConversation);
  }
}

function handleMessageKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

// ==================== UTILITY FUNCTIONS ====================
function enlargeImage(imageUrl) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    cursor: pointer;
  `;

  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    border-radius: 10px;
  `;

  modal.appendChild(img);
  modal.onclick = () => modal.remove();
  document.body.appendChild(modal);
}

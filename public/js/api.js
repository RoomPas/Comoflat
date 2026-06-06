// API Configuration
const API_BASE = 'http://localhost:5000/api';

// ==================== AUTH API ====================
async function loginAPI(username) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Failed to login' };
  }
}

async function getUserAPI(userId) {
  try {
    const response = await fetch(`${API_BASE}/auth/user/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

// ==================== LISTINGS API ====================
async function getListingsAPI() {
  try {
    const response = await fetch(`${API_BASE}/listings`);
    return await response.json();
  } catch (error) {
    console.error('Get listings error:', error);
    return [];
  }
}

async function getListingAPI(listingId) {
  try {
    const response = await fetch(`${API_BASE}/listings/${listingId}`);
    return await response.json();
  } catch (error) {
    console.error('Get listing error:', error);
    return null;
  }
}

async function createListingAPI(listingData) {
  try {
    const response = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingData),
    });
    return await response.json();
  } catch (error) {
    console.error('Create listing error:', error);
    return { success: false, message: 'Failed to create listing' };
  }
}

async function searchListingsAPI(location, budget, type, amenities) {
  try {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (budget) params.append('budget', budget);
    if (type) params.append('type', type);
    if (amenities) params.append('amenities', amenities);

    const response = await fetch(`${API_BASE}/listings/search/query?${params}`);
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// ==================== LIKES & COMMENTS API ====================
async function likeListingAPI(listingId, userId) {
  try {
    const response = await fetch(`${API_BASE}/listings/${listingId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Like error:', error);
    return null;
  }
}

async function addCommentAPI(listingId, userId, userName, text) {
  try {
    const response = await fetch(`${API_BASE}/listings/${listingId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName, text }),
    });
    return await response.json();
  } catch (error) {
    console.error('Add comment error:', error);
    return null;
  }
}

async function deleteCommentAPI(listingId, commentId) {
  try {
    const response = await fetch(
      `${API_BASE}/listings/${listingId}/comments/${commentId}`,
      { method: 'DELETE' }
    );
    return await response.json();
  } catch (error) {
    console.error('Delete comment error:', error);
    return null;
  }
}

// ==================== MESSAGING API ====================
async function getMessagesAPI(userId1, userId2) {
  try {
    const response = await fetch(`${API_BASE}/messages/${userId1}/${userId2}`);
    return await response.json();
  } catch (error) {
    console.error('Get messages error:', error);
    return [];
  }
}

async function sendMessageAPI(from, to, text) {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, text }),
    });
    return await response.json();
  } catch (error) {
    console.error('Send message error:', error);
    return null;
  }
}

// ==================== TOUR BOOKINGS API ====================
async function getTourSlotsAPI(listingId) {
  try {
    const response = await fetch(`${API_BASE}/tours/listing/${listingId}`);
    return await response.json();
  } catch (error) {
    console.error('Get tour slots error:', error);
    return { available: false, slots: [] };
  }
}

async function bookTourAPI(listingId, userId, userName, timeSlot) {
  try {
    const response = await fetch(`${API_BASE}/tours/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, userId, userName, timeSlot }),
    });
    return await response.json();
  } catch (error) {
    console.error('Book tour error:', error);
    return null;
  }
}

async function getUserToursAPI(userId) {
  try {
    const response = await fetch(`${API_BASE}/tours/user/${userId}`);
    return await response.json();
  } catch (error) {
    console.error('Get user tours error:', error);
    return [];
  }
}

// ==================== AI AGENT API ====================
async function sendAIChatAPI(userId, message) {
  try {
    const response = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    return await response.json();
  } catch (error) {
    console.error('AI chat error:', error);
    return { error: 'Failed to get AI response' };
  }
}

async function resetAIChatAPI(userId) {
  try {
    const response = await fetch(`${API_BASE}/ai/reset/${userId}`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error('Reset AI chat error:', error);
    return null;
  }
}

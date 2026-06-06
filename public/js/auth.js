// ==================== GLOBAL STATE ====================
let currentUser = null;
let currentListingDetail = null;
let currentChatPartner = null;

// ==================== LOGIN & LOGOUT ====================
async function login() {
  const username = document.getElementById('username').value.trim();
  if (!username) {
    alert('Please enter a username');
    return;
  }

  const result = await loginAPI(username);
  if (result.success) {
    currentUser = result.user;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showPage('feed');
    loadFeed();
  } else {
    alert(result.message || 'Login failed');
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('username').value = '';
  showPage('auth-page');
}

function handleAuthKeyPress(event) {
  if (event.key === 'Enter') {
    login();
  }
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.remove('active');
  });

  // Show selected page
  const pageId = pageName.includes('-page') ? pageName : `${pageName}-page`;
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    // Load data when page is shown
    if (pageName === 'feed') loadFeed();
    if (pageName === 'profile') loadProfile();
    if (pageName === 'messages') loadConversations();
  }
}

// ==================== FEED PAGE ====================
async function loadFeed() {
  if (!currentUser) return;

  const listings = await getListingsAPI();
  const container = document.getElementById('listings-container');
  container.innerHTML = '';

  listings.forEach((listing) => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <img src="${listing.images[0] || 'https://via.placeholder.com/300x200'}" alt="${listing.title}" class="listing-image">
      <div class="listing-info">
        <div class="listing-title">${listing.title}</div>
        <div class="listing-price">€${listing.price}</div>
        <div class="listing-location">📍 ${listing.location}</div>
        <div class="listing-amenities">
          ${listing.amenities.slice(0, 3).map((a) => `<span class="amenity-tag">${a}</span>`).join('')}
        </div>
        <div class="listing-actions">
          <button class="like-btn ${listing.likes.includes(currentUser.id) ? 'liked' : ''}" onclick="toggleLike('${listing.id}')">
            ❤️ ${listing.likes.length}
          </button>
          <button class="view-btn" onclick="viewListing('${listing.id}')">View</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function toggleLike(listingId) {
  if (!currentUser) return;

  const result = await likeListingAPI(listingId, currentUser.id);
  if (result) {
    loadFeed();
  }
}

async function filterListings() {
  if (!currentUser) return;

  const location = document.getElementById('search-location').value;
  const budget = document.getElementById('search-budget').value;

  const listings = await searchListingsAPI(location, budget, null, null);
  const container = document.getElementById('listings-container');
  container.innerHTML = '';

  if (listings.length === 0) {
    container.innerHTML = '<p>No listings found</p>';
    return;
  }

  listings.forEach((listing) => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <img src="${listing.images[0] || 'https://via.placeholder.com/300x200'}" alt="${listing.title}" class="listing-image">
      <div class="listing-info">
        <div class="listing-title">${listing.title}</div>
        <div class="listing-price">€${listing.price}</div>
        <div class="listing-location">📍 ${listing.location}</div>
        <div class="listing-actions">
          <button class="like-btn" onclick="toggleLike('${listing.id}')">❤️ ${listing.likes.length}</button>
          <button class="view-btn" onclick="viewListing('${listing.id}')">View</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==================== LISTING DETAIL PAGE ====================
async function viewListing(listingId) {
  const listing = await getListingAPI(listingId);
  if (!listing) {
    alert('Listing not found');
    return;
  }

  currentListingDetail = listing;
  showPage('listing-detail');
  displayListingDetail(listing);
}

function displayListingDetail(listing) {
  const content = document.getElementById('listing-detail-content');
  
  const images360HTML = listing.images360 && listing.images360.length > 0 
    ? `
      <div id="images-360-section" class="images-360-section" style="display:block;">
        <h3>360° View</h3>
        <div id="pannellum-container" style="width: 100%; height: 500px;"></div>
        <div style="margin-top: 10px;">
          <select id="room-selector" onchange="switch360Image()">
            ${listing.images360.map((img, i) => `<option value="${i}">${img.roomName}</option>`).join('')}
          </select>
        </div>
      </div>
    `
    : '';

  const tourSlotsHTML = listing.liveTouring && listing.liveTouring.available
    ? `
      <div id="tour-booking-section" class="tour-booking" style="display:block;">
        <h3>📹 Book a Live Tour</h3>
        <div id="tour-slots-container" class="tour-slots">
          ${listing.liveTouring.slots.map((slot) => `
            <div class="tour-slot" onclick="selectTourSlot('${slot}')">
              📅 ${new Date(slot).toLocaleString()}
            </div>
          `).join('')}
        </div>
        <button onclick="bookTour('${listing.id}')" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">Book Selected Slot</button>
      </div>
    `
    : '';

  content.innerHTML = `
    <div class="listing-detail">
      <div class="detail-header">
        <h1 class="detail-title">${listing.title}</h1>
        <div class="detail-price">€${listing.price}/month</div>
      </div>

      <div class="detail-images">
        ${listing.images.map((img) => `<img src="${img}" alt="Property" onclick="enlargeImage('${img}')">`).join('')}
      </div>

      <div class="detail-meta">
        <div class="meta-item">
          <div class="meta-label">Location</div>
          <div class="meta-value">${listing.location}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Type</div>
          <div class="meta-value">${listing.type}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Bedrooms</div>
          <div class="meta-value">${listing.bedrooms}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Available</div>
          <div class="meta-value">${new Date(listing.availableFrom).toLocaleDateString()}</div>
        </div>
      </div>

      <div class="detail-description">
        <h3>About</h3>
        <p>${listing.description}</p>
      </div>

      <div style="margin-top: 20px;">
        <h3>Amenities</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          ${listing.amenities.map((a) => `<span class="amenity-tag">${a}</span>`).join('')}
        </div>
      </div>

      ${images360HTML}
      ${tourSlotsHTML}
    </div>
  `;

  // Load 360 image if available
  if (listing.images360 && listing.images360.length > 0) {
    load360Image(listing.images360[0].imageUrl);
  }

  // Load comments
  loadComments(listing.id);
}

function load360Image(imageUrl) {
  const container = document.getElementById('pannellum-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Simple panorama viewer using CSS transform
  const img = document.createElement('img');
  img.src = imageUrl;
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  container.appendChild(img);
}

function switch360Image() {
  if (!currentListingDetail) return;
  const index = document.getElementById('room-selector').value;
  const imageUrl = currentListingDetail.images360[index].imageUrl;
  load360Image(imageUrl);
}

let selectedTourSlot = null;

function selectTourSlot(slot) {
  selectedTourSlot = slot;
  document.querySelectorAll('.tour-slot').forEach((el) => {
    el.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

async function bookTour(listingId) {
  if (!currentUser || !selectedTourSlot) {
    alert('Please select a time slot');
    return;
  }

  const result = await bookTourAPI(listingId, currentUser.id, currentUser.username, selectedTourSlot);
  if (result && result.success) {
    alert(`Tour booked! Jitsi room: ${result.booking.jitsiRoomUrl}`);
    window.open(result.booking.jitsiRoomUrl, '_blank');
  } else {
    alert('Failed to book tour');
  }
}

async function loadComments(listingId) {
  const listing = await getListingAPI(listingId);
  const container = document.getElementById('comments-container');
  container.innerHTML = '';

  if (!listing.comments || listing.comments.length === 0) {
    container.innerHTML = '<p>No comments yet</p>';
    return;
  }

  listing.comments.forEach((comment) => {
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    commentEl.innerHTML = `
      <div class="comment-author">${comment.userName}</div>
      <div class="comment-text">${comment.text}</div>
    `;
    container.appendChild(commentEl);
  });
}

async function addComment() {
  if (!currentUser || !currentListingDetail) return;

  const text = document.getElementById('comment-text').value.trim();
  if (!text) {
    alert('Please enter a comment');
    return;
  }

  const result = await addCommentAPI(
    currentListingDetail.id,
    currentUser.id,
    currentUser.username,
    text
  );

  if (result && result.success) {
    document.getElementById('comment-text').value = '';
    loadComments(currentListingDetail.id);
  }
}

// ==================== CREATE LISTING PAGE ====================
async function createListing(event) {
  event.preventDefault();

  if (!currentUser) {
    alert('Please login first');
    return;
  }

  const listingData = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    price: parseInt(document.getElementById('price').value),
    location: document.getElementById('location').value,
    type: document.getElementById('type').value,
    bedrooms: parseInt(document.getElementById('bedrooms').value),
    bathrooms: 1,
    squareFeet: 500,
    amenities: document.getElementById('amenities').value.split(',').map((a) => a.trim()),
    petPolicy: document.getElementById('petPolicy').checked,
    images: document.getElementById('images').value.split(',').map((url) => url.trim()),
    images360: [],
    liveTouring: {
      available: true,
      slots: ['2026-06-07T10:00:00Z', '2026-06-07T14:00:00Z'],
    },
    createdBy: currentUser.id,
  };

  const result = await createListingAPI(listingData);
  if (result.success) {
    alert('Listing created!');
    showPage('feed');
    loadFeed();
  } else {
    alert('Failed to create listing');
  }
}

// ==================== PROFILE PAGE ====================
async function loadProfile() {
  if (!currentUser) return;

  const user = await getUserAPI(currentUser.id);
  if (!user) return;

  const profileContent = document.getElementById('profile-content');
  profileContent.innerHTML = `
    <div class="profile-header">
      <img src="${user.avatar}" alt="Avatar" class="profile-avatar">
      <div class="profile-info">
        <h2>${user.username}</h2>
        <p>${user.type.toUpperCase()}</p>
        <p>${user.bio}</p>
      </div>
    </div>

    <div class="profile-details">
      <div class="detail-row">
        <div class="detail-label">Email</div>
        <div class="detail-value">${user.email}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Phone</div>
        <div class="detail-value">${user.phone}</div>
      </div>
      <div class="detail-row">
        <div class="detail-label">Member Since</div>
        <div class="detail-value">${new Date(user.createdAt).toLocaleDateString()}</div>
      </div>
    </div>
  `;
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showPage('feed');
    loadFeed();
  } else {
    showPage('auth-page');
  }
});

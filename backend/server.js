const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper functions to read/write JSON files
const dataDir = path.join(__dirname, 'data');

const readJSON = (filename) => {
  const filePath = path.join(dataDir, filename);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

const writeJSON = (filename, data) => {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
};

// ==================== AUTHENTICATION ROUTES ====================

// Simple login (no password verification for hackathon)
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  const users = readJSON('users.json');
  const user = users.find((u) => u.username === username);

  if (user) {
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        type: user.type,
        bio: user.bio,
      },
    });
  } else {
    res.status(401).json({ success: false, message: 'User not found' });
  }
});

// Get current user
app.get('/api/auth/user/:id', (req, res) => {
  const users = readJSON('users.json');
  const user = users.find((u) => u.id === req.params.id);
  
  if (user) {
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      type: user.type,
      bio: user.bio,
      phone: user.phone,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// ==================== LISTINGS ROUTES ====================

// Get all listings
app.get('/api/listings', (req, res) => {
  const listings = readJSON('listings.json');
  res.json(listings);
});

// Get single listing
app.get('/api/listings/:id', (req, res) => {
  const listings = readJSON('listings.json');
  const listing = listings.find((l) => l.id === req.params.id);
  
  if (listing) {
    res.json(listing);
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

// Create new listing
app.post('/api/listings', (req, res) => {
  const listings = readJSON('listings.json');
  const newListing = {
    id: 'listing_' + uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
  };

  listings.push(newListing);
  writeJSON('listings.json', listings);
  
  res.status(201).json({
    success: true,
    message: 'Listing created',
    listing: newListing,
  });
});

// Update listing
app.put('/api/listings/:id', (req, res) => {
  const listings = readJSON('listings.json');
  const index = listings.findIndex((l) => l.id === req.params.id);
  
  if (index !== -1) {
    listings[index] = { ...listings[index], ...req.body };
    writeJSON('listings.json', listings);
    res.json({
      success: true,
      message: 'Listing updated',
      listing: listings[index],
    });
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

// Delete listing
app.delete('/api/listings/:id', (req, res) => {
  const listings = readJSON('listings.json');
  const filtered = listings.filter((l) => l.id !== req.params.id);
  
  if (filtered.length < listings.length) {
    writeJSON('listings.json', filtered);
    res.json({ success: true, message: 'Listing deleted' });
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

// Search and filter listings
app.get('/api/listings/search/query', (req, res) => {
  const { location, budget, type, amenities } = req.query;
  let listings = readJSON('listings.json');

  if (location) {
    listings = listings.filter((l) =>
      l.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (budget) {
    listings = listings.filter((l) => l.price <= parseInt(budget));
  }

  if (type) {
    listings = listings.filter((l) => l.type === type);
  }

  if (amenities) {
    const amenityArray = amenities.split(',');
    listings = listings.filter((l) =>
      amenityArray.some((a) => l.amenities.includes(a))
    );
  }

  res.json(listings);
});

// ==================== LIKES & COMMENTS ====================

// Like/Unlike listing
app.post('/api/listings/:id/like', (req, res) => {
  const { userId } = req.body;
  const listings = readJSON('listings.json');
  const listing = listings.find((l) => l.id === req.params.id);

  if (listing) {
    const index = listing.likes.indexOf(userId);
    if (index > -1) {
      listing.likes.splice(index, 1);
    } else {
      listing.likes.push(userId);
    }
    writeJSON('listings.json', listings);
    res.json({ success: true, likes: listing.likes });
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

// Add comment
app.post('/api/listings/:id/comments', (req, res) => {
  const { userId, userName, text } = req.body;
  const listings = readJSON('listings.json');
  const listing = listings.find((l) => l.id === req.params.id);

  if (listing) {
    const comment = {
      id: 'comment_' + uuidv4(),
      userId,
      userName,
      text,
      createdAt: new Date().toISOString(),
    };
    listing.comments.push(comment);
    writeJSON('listings.json', listings);
    res.status(201).json({ success: true, comment });
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

// Delete comment
app.delete('/api/listings/:listingId/comments/:commentId', (req, res) => {
  const listings = readJSON('listings.json');
  const listing = listings.find((l) => l.id === req.params.listingId);

  if (listing) {
    listing.comments = listing.comments.filter(
      (c) => c.id !== req.params.commentId
    );
    writeJSON('listings.json', listings);
    res.json({ success: true, message: 'Comment deleted' });
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

// ==================== MESSAGING ROUTES ====================

// Get messages between two users
app.get('/api/messages/:userId1/:userId2', (req, res) => {
  const messages = readJSON('messages.json');
  const filtered = messages.filter(
    (m) =>
      (m.from === req.params.userId1 && m.to === req.params.userId2) ||
      (m.from === req.params.userId2 && m.to === req.params.userId1)
  );

  res.json(filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
});

// Send message
app.post('/api/messages', (req, res) => {
  const { from, to, text } = req.body;
  const messages = readJSON('messages.json');

  const newMessage = {
    id: 'msg_' + uuidv4(),
    from,
    to,
    text,
    createdAt: new Date().toISOString(),
    read: false,
  };

  messages.push(newMessage);
  writeJSON('messages.json', messages);

  res.status(201).json({ success: true, message: newMessage });
});

// ==================== TOUR BOOKINGS ====================

// Get available tour slots for listing
app.get('/api/tours/listing/:listingId', (req, res) => {
  const listings = readJSON('listings.json');
  const listing = listings.find((l) => l.id === req.params.listingId);

  if (listing && listing.liveTouring) {
    res.json({
      available: listing.liveTouring.available,
      slots: listing.liveTouring.slots,
    });
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

// Book a tour
app.post('/api/tours/book', (req, res) => {
  const { listingId, userId, userName, timeSlot } = req.body;
  const tourBookings = readJSON('tourBookings.json');
  const listings = readJSON('listings.json');

  const listing = listings.find((l) => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ message: 'Listing not found' });
  }

  const booking = {
    id: 'tour_' + uuidv4(),
    listingId,
    userId,
    userName,
    timeSlot,
    jitsiRoomUrl: `https://meet.jitsi.org/comoflat-tour-${uuidv4().substring(0, 8)}`,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };

  tourBookings.push(booking);
  writeJSON('tourBookings.json', tourBookings);

  res.status(201).json({ success: true, booking });
});

// Get user's tour bookings
app.get('/api/tours/user/:userId', (req, res) => {
  const tourBookings = readJSON('tourBookings.json');
  const userTours = tourBookings.filter((t) => t.userId === req.params.userId);
  res.json(userTours);
});

// ==================== AI AGENT ROUTES ====================

let conversationHistory = {};

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;

    // Initialize conversation history for user if needed
    if (!conversationHistory[userId]) {
      conversationHistory[userId] = [];
    }

    // Add user message
    conversationHistory[userId].push({
      role: 'user',
      content: message,
    });

    // System prompt for AI agent
    const systemPrompt = `You are ComoFlat's AI Rental Agent. Your job is to help users find accommodation by:
1. Asking clarifying questions about their needs
2. Gathering info: location, budget, type (studio/apartment), amenities, pet policies, lease duration, occupants
3. After collecting requirements, reasoning through options and making recommendations
4. Being conversational and helpful

When you have enough info, suggest listings and explain why they match their criteria.
Ask 1-2 questions at a time. Be friendly!`;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory[userId],
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const aiMessage = response.choices[0].message.content;

    // Add AI response to history
    conversationHistory[userId].push({
      role: 'assistant',
      content: aiMessage,
    });

    res.json({ message: aiMessage });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Reset AI conversation
app.post('/api/ai/reset/:userId', (req, res) => {
  conversationHistory[req.params.userId] = [];
  res.json({ success: true, message: 'Conversation reset' });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ComoFlat server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints ready`);
});

module.exports = app;

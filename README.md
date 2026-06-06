# 🏠 ComoFlat - AI-Powered Real Estate Platform

An innovative real estate marketplace combining AI-driven rental assistance, live virtual tours, and social networking features. Built with a modern tech stack for the hackathon.

## 🎯 Features

### 1. **AI Rental Agent** 🤖
- Intelligent chatbot powered by **OpenAI GPT-4**
- Conversational property matching
- Learns user preferences through dialogue
- Makes personalized recommendations
- Available 24/7 for property inquiries

### 2. **Live Virtual Tours** 📹
- **Jitsi integration** for real-time video tours with property owners
- Book time slots directly
- 360° panoramic property views
- Multiple room perspectives

### 3. **Social Feed** 📱
- Browse property listings with rich media
- Like/unlike properties
- Comment on listings
- Filter by location, budget, type, amenities
- Create your own listings (landlords/agents)

### 4. **Direct Messaging** 💬
- Message property owners and other users
- Conversation history
- Real-time notifications

### 5. **User Profiles** 👤
- Tenant, Landlord, or Agent profiles
- Bio and contact information
- Avatar support
- Member since date tracking

## 🛠️ Tech Stack

### Backend
- **Node.js + Express.js** - REST API server
- **OpenAI API** - AI rental agent
- **Jitsi** - Live video tours
- **JSON** - Data persistence (hackathon setup)
- **CORS** - Cross-origin resource sharing

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern responsive design
- **Vanilla JavaScript** - No frameworks for lightweight deployment
- **Pannellum.js** - 360° panoramic views

## 📁 Project Structure

```
comoflat/
├── backend/
│   ├── server.js              # Main Express server
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment variables
│   └── data/
│       ├── users.json         # User database
│       ├── listings.json      # Property listings
│       ├── messages.json      # Messages
│       ├── conversations.json # Chat conversations
│       └── tourBookings.json  # Tour bookings
└── public/
    ├── index.html             # Main HTML file
    ├── styles.css             # Global styles
    └── js/
        ├── api.js             # API helper functions
        ├── auth.js            # Authentication & core logic
        └── ui.js              # UI features (messaging, AI chat)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- OpenAI API key (free trial available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RoomPas/Comoflat.git
   cd Comoflat
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   nano .env
   ```

4. **Start the backend server**
   ```bash
   npm start
   # Server runs on http://localhost:5000
   ```

5. **Open the frontend**
   - Open `public/index.html` in your browser
   - Or run a local server: `npx http-server public`

### Test Users
Login with these usernames (no password required for hackathon):
- `john_landlord` - Landlord account
- `sarah_tenant` - Tenant account
- `mike_student` - Student tenant account

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/user/:id` - Get user profile

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/search/query` - Search with filters

### Interactions
- `POST /api/listings/:id/like` - Like/unlike property
- `POST /api/listings/:id/comments` - Add comment
- `DELETE /api/listings/:id/comments/:commentId` - Delete comment

### Messaging
- `GET /api/messages/:userId1/:userId2` - Get messages
- `POST /api/messages` - Send message

### Tour Bookings
- `GET /api/tours/listing/:listingId` - Get available slots
- `POST /api/tours/book` - Book a tour
- `GET /api/tours/user/:userId` - Get user's bookings

### AI Agent
- `POST /api/ai/chat` - Send message to AI agent
- `POST /api/ai/reset/:userId` - Reset conversation

## 🎨 UI Pages

### 1. **Authentication Page**
- Username-based login
- Simple and clean design

### 2. **Feed Page**
- Grid of property listings
- Search and filter controls
- Like buttons and quick view

### 3. **Listing Detail Page**
- Full property information
- Image gallery
- 360° room views (if available)
- Live tour booking
- Comments section
- Share details

### 4. **AI Agent Page**
- Chat interface with AI
- Real-time conversation
- Recommendation engine
- Reset conversation button

### 5. **Messages Page**
- Conversation list
- Message thread viewer
- Real-time messaging
- User avatars

### 6. **Profile Page**
- User information
- Contact details
- Member since date
- Account type (Tenant/Landlord/Agent)

## 🤖 AI Agent Features

The AI rental agent helps users find properties by:
1. Asking clarifying questions about needs
2. Gathering requirements (location, budget, type, amenities)
3. Understanding constraints (pet policies, lease duration)
4. Making intelligent recommendations
5. Explaining why properties match criteria

**System Prompt:**
```
You are ComoFlat's AI Rental Agent. Your job is to help users find accommodation by:
1. Asking clarifying questions about their needs
2. Gathering info: location, budget, type, amenities, pet policies, lease duration
3. Making personalized recommendations
4. Being conversational and helpful
```

## 🎥 Live Tour Integration

Uses **Jitsi Meet** for video conferencing:
- No account needed
- Secure random room URLs per booking
- Screen sharing capabilities
- Recording options available
- Mobile-friendly interface

## 📊 Database Schema

### Users
```json
{
  "id": "user_uuid",
  "username": "john_landlord",
  "email": "john@example.com",
  "avatar": "url",
  "type": "landlord|tenant|agent",
  "bio": "Short bio",
  "phone": "+1234567890",
  "createdAt": "2026-06-06T..."
}
```

### Listings
```json
{
  "id": "listing_uuid",
  "title": "Modern 2BR Apartment",
  "description": "...",
  "price": 1200,
  "location": "Barcelona",
  "type": "apartment",
  "bedrooms": 2,
  "amenities": ["WiFi", "Gym", "Pool"],
  "images": ["url1", "url2"],
  "images360": [{"roomName": "Living Room", "imageUrl": "..."}],
  "liveTouring": {
    "available": true,
    "slots": ["2026-06-07T10:00:00Z"]
  },
  "likes": ["user_id"],
  "comments": [{...}],
  "createdBy": "user_id",
  "createdAt": "2026-06-06T..."
}
```

## 🔒 Security Notes (Hackathon Setup)

- ⚠️ No password authentication (simplified for hackathon)
- ⚠️ JSON files for data storage (use MongoDB/PostgreSQL in production)
- ⚠️ CORS enabled for all origins (restrict in production)
- ✅ OpenAI API key in environment variables
- ✅ UUID generation for resources

## 🚀 Deployment

### Heroku Deployment
```bash
# Create Heroku app
heroku create comoflat-app

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-xxx

# Deploy
git push heroku main
```

### Vercel (Frontend)
```bash
vercel --prod
```

## 📈 Future Enhancements

- [ ] Real database (MongoDB/PostgreSQL)
- [ ] User authentication with passwords/OAuth
- [ ] Payment integration (Stripe)
- [ ] Advanced filters (pet policy, parking, furnished)
- [ ] Booking system with confirmations
- [ ] AI-powered property photo descriptions
- [ ] Video tour uploads
- [ ] Notification system (email/push)
- [ ] Admin dashboard
- [ ] Analytics and insights
- [ ] Machine learning for recommendations

## 🤝 Contributing

This is a hackathon project. Feel free to fork and customize!

## 📝 License

MIT License - feel free to use for learning and hackathons

## 👥 Team

Built by the RoomPas team for the hackathon 🎉

## 📞 Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/RoomPas/Comoflat/issues)
- Email: bahamichaimae5@gmail.com

---

**Happy house hunting with ComoFlat! 🏡✨**

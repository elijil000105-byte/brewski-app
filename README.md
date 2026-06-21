# 🍺 Brewski App

A group beer hangout planner app where friends can indicate daily availability and get real-time notifications when group members respond.

## Features

- **User Authentication**: Register and login with JWT tokens
- **Group Management**: Create groups and invite friends
- **Daily Voting**: Vote "Yes" (with time preference) or "Nix, not today"
- **Real-time Notifications**: Get instant updates when group members respond via WebSocket
- **Group Status**: See all responses and available time slots

## Tech Stack

### Backend
- **Node.js** + Express
- **MongoDB** for data storage
- **Socket.io** for real-time notifications
- **JWT** for authentication
- **Bcryptjs** for password hashing

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time updates

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB running locally or MongoDB Atlas connection string
- Git

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
nano .env

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Register**: Create a new account
2. **Create a Group**: Click "Create Group" on the home page
3. **Add Members**: Share group with friends or add them by username
4. **Vote Daily**: Click into a group and vote "Yes" (with time) or "Nix"
5. **Get Notified**: See real-time notifications when friends respond

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Groups
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:groupId` - Get group details
- `POST /api/groups` - Create new group
- `POST /api/groups/:groupId/add-member` - Add member to group

### Responses
- `POST /api/responses/:groupId` - Submit daily response
- `GET /api/responses/:groupId/today` - Get today's responses

## Real-time Events (Socket.io)

- `join-group` - Join a group for real-time updates
- `response-update` - Broadcast when someone submits a response

## Future Enhancements

- [ ] Email notifications
- [ ] Push notifications for mobile
- [ ] Recurring groups/events
- [ ] Mobile app (React Native)
- [ ] User profiles and avatars
- [ ] Group history and statistics
- [ ] Admin panel for group management

## License

MIT
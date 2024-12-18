# Team Collaboration Platform

A modern team collaboration platform built with React, Node.js, and MongoDB.

## Features

- Real-time messaging
- Task management
- Document sharing
- User authentication and authorization
- Activity tracking
- Real-time notifications
- Modern, responsive UI

## Tech Stack

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Socket.io for real-time features

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/team-collab.git
cd team-collab
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables:
Create a `.env` file in the server directory with the following variables:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/team-collab
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the development servers:

In the server directory:
```bash
npm run dev
```

In the client directory:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

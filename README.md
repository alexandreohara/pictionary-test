# 🎨 Pictionary Cross-Platform Game

A real-time multiplayer Pictionary game with cross-platform support. Players can join from web browsers or mobile devices and play together in the same rooms.

## 🚀 Features

- **Cross-Platform Multiplayer**: Web and mobile users can play together
- **Real-time Drawing**: Live drawing synchronization across all platforms
- **WebSocket Communication**: Instant messaging and game updates
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Touch & Mouse Support**: Draw with mouse on web or finger on mobile
- **Room-based Gaming**: Join rooms with custom codes
- **Score Tracking**: Points system with leaderboards
- **5 Rounds**: Complete game sessions with final rankings

### Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO, TypeScript
- **Web Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Real-time Communication**: Socket.IO
- **Database**: In-memory

## 🎮 How to Play

1. **Create/Join Room**: Generate a room code or join an existing room
2. **Wait for Players**: 2-4 players needed to start
3. **Take Turns Drawing**: One player draws while others guess
4. **Earn Points**: Get points for correct guesses and successful drawings
5. **Win the Game**: Highest score after 5 rounds wins!

## 🛠️ Development Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/alexandreohara/pictionary-test.git
   cd pictionary-test
   ```

2. **Install dependencies for all projects**

   ```bash
   # Install backend dependencies
   cd backend && npm install && cd ..
   
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   ```

3. **Start the development servers**

   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them individually:
   npm run dev:backend    # Backend only (port 3001)
   npm run dev:frontend   # Frontend only (port 3000)
   ```

4. **Access the applications**
   - **Web App**: <http://localhost:3000>
   - **Backend API**: <http://localhost:3001>

## 🚦 Available Scripts

### Root Directory

```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start backend server only
npm run dev:frontend     # Start frontend dev server only
```

### Backend (/backend)

```bash
npm run dev              # Start development server with nodemon
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server
```

### Frontend (/frontend)

```bash
npm run dev              # Start Vite development server
npm run build            # Build for production
npm run preview          # Preview production build
```

## 🎯 Game Rules

### Scoring System

- **Correct Guess**: 10 points to guesser, 5 points to drawer
- **Time Bonus**: Extra points for faster correct guesses
- **Drawing Bonus**: Points for drawer when someone guesses correctly

### Game Flow

1. **Setup Phase**: Players join room and wait
2. **Game Start**: Host starts the game
3. **Drawing Phase**: Current drawer gets a word (60 seconds)
4. **Guessing Phase**: Other players type guesses
5. **Round End**: Show correct word and scores
6. **Next Round**: New drawer, repeat 5 times
7. **Game Over**: Show final leaderboard

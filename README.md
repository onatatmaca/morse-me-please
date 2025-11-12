# 🎯 Morse Me Please

A real-time Morse code communication app that connects strangers for duplex (two-way simultaneous) Morse code conversations.

**Live at: [www.morsemeplease.com](https://www.morsemeplease.com)**

## Features

- 🔄 **Duplex Mode**: Both users can send Morse code simultaneously
- ⚡ **Real-time Communication**: WebSocket-based instant signal transmission
- 🎵 **Adjustable Speed**: 5-40 WPM with BPM-based timing
- 🎹 **Multiple Input Methods**:
  - Single circle with hold-for-timing
  - Two-circle mode (separate dot/dash buttons)
  - Keyboard shortcuts (Z/X or Left/Right CTRL for dot/dash)
- 📝 **Live Translation**: See letters as you type
- 💬 **WhatsApp-style Chat**: Clean message transcript
- 👥 **Live User Count**: See how many people are online
- 🎨 **Compact Modern UI**: Optimized for space and readability

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
cd server && npm install
cd ../frontend && npm install

# Start server
cd ../server && npm start

# Start frontend (in new terminal)
cd frontend && npm run dev
```

Visit `http://localhost:5173` and open in two browser tabs/windows to test.

## Production Deployment

### Deploy to TrueNAS with Cloudflare Tunnel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

### Quick Deploy

```bash
# Using Docker
docker build -t morsemeplease:latest .
docker run -d --name morsemeplease -p 3000:3000 -e NODE_ENV=production morsemeplease:latest

# Or using docker-compose
docker-compose up -d

# Or use the deploy script
chmod +x deploy.sh
./deploy.sh
```

## Architecture

```
├── server/                 # Node.js + Socket.IO backend
│   ├── server.js          # Main server file with WebSocket logic
│   └── package.json
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── socket.js      # Socket.IO client configuration
│   │   ├── MorseKey.jsx   # Single-circle Morse key component
│   │   └── ...
│   └── package.json
├── Dockerfile             # Production Docker build
├── docker-compose.yml     # Docker Compose configuration
└── DEPLOYMENT.md          # Deployment guide
```

## How It Works

1. **Connection**: Users enter username and get paired with a waiting user
2. **Real-time Signals**: Every dot/dash is transmitted instantly via WebSockets
3. **Auto-send**: Messages automatically send after configurable delay (default 2.5s)
4. **WPM Calculation**: Speed is calculated based on message length and timing
5. **Duplex Mode**: Both users can type simultaneously without turn-taking

## Technical Details

### Timing System
- Based on International Morse Code standards
- 1:3:7 ratios (dot : dash : word space)
- Configurable WPM (5-40)
- Letter pause: 3 time units
- Word pause: 7 time units

### WebSocket Events
- `morse-signal`: Real-time dot/dash transmission
- `morse-message-complete`: Final message with WPM
- `user-count`: Live online user count
- `paired`: Connection with partner
- `partner-disconnected`: Partner left

### Input Methods
1. **Single Circle (Hold)**: Press and hold - duration determines dot/dash
2. **Two Circles (Direct)**: Separate buttons for instant dot/dash
3. **Keyboard**:
   - Z or Left CTRL = Dot
   - X or Right CTRL = Dash
   - Spacebar = Hold for timing

## Settings

- **WPM**: Morse code speed (5-40 words per minute)
- **Auto-send Delay**: Time before automatic submission (1-5 seconds)
- **Show Letters**: Toggle live translation
- **Keyboard Input**: Enable/disable keyboard controls
- **Circle Mode**: Switch between single/two-circle modes

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Touch optimized

## Environment Variables

```bash
NODE_ENV=production    # Enable production mode
PORT=3000             # Server port (default: 3000)
```

## Development

### File Structure

**Server (`server/server.js`)**
- Express.js for static file serving
- Socket.IO for WebSocket communication
- User pairing logic
- Real-time signal relay

**Frontend Components**
- `App.jsx`: Main application logic, state management
- `MorseKey.jsx`: Single-circle hold-to-input button
- `MessageTranscript.jsx`: WhatsApp-style chat display
- `SettingsPanel.jsx`: Configuration interface
- `UsernameForm.jsx`: Login screen with user count

### Key Technologies
- **Frontend**: React 18, Vite, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **Styling**: CSS with modern features
- **Build**: Docker multi-stage build
- **Deployment**: Cloudflare Tunnel

## Contributing

This project was developed with Claude Code. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both single and paired mode)
5. Submit a pull request

## License

MIT License - feel free to use this project however you'd like!

## Credits

Built with Claude Code by Anthropic.

## Support

For deployment issues, see [DEPLOYMENT.md](./DEPLOYMENT.md).

For bugs or feature requests, please open an issue.

---

**Enjoy communicating in Morse code! 📡**

# 📡 Morse Me Please

A real-time Morse code communication and learning platform. Connect with others worldwide or learn solo through our comprehensive Practice Mode!

## 🌟 Features

### 💬 **Chat Mode** - Real-Time Communication
- **Instant Pairing**: Automatically matched with online users
- **Duplex Communication**: Both users can send and receive simultaneously
- **Live Audio Feedback**: Hear morse code with customizable frequencies and volumes
- **Real-Time Translation**: See morse code converted to text as you type
- **Multiple Input Methods**:
  - Single Circle Mode (hold-based timing)
  - Two Circle Mode (separate dot/dash buttons)
  - Keyboard Mode (Z=dot, X=dash, Spacebar=hold)
- **Adaptive Timing**: Adjustable WPM (5-50) and auto-send delays
- **Typing Indicators**: See when your partner is composing

### 🎓 **Practice Mode** - Learn Morse Code Solo

**NEW!** A complete learning curriculum with 15 progressive lessons:

#### Lesson Structure
1. **Lessons 1-5 (Beginner)**: E, T, I, A, N, M, S, O, H, U, V, F, L, R, W, J, P
2. **Lessons 6-7 (Intermediate)**: Complete alphabet (B, C, D, G, K, Q, X, Y, Z)
3. **Lesson 8**: Numbers 0-9
4. **Lessons 9-12 (Advanced)**: Punctuation marks, conversation practice
5. **Lessons 13-15 (Expert)**: Speed training (15-25 WPM), Farnsworth method

#### Exercise Types
- **Learn**: Introduction to new characters with audio
- **Listen**: Hear morse and identify the character
- **Type**: See a character and type its morse code
- **Word**: Practice complete words and sentences
- **Speed Drills**: Timed challenges to improve WPM
- **Mixed Practice**: Random characters from learned set

#### Progress Tracking
- ✅ Lesson completion tracking
- 📊 Accuracy percentage per lesson
- ⚡ WPM (Words Per Minute) measurement
- 🎯 Character mastery system
- 🏆 Achievement unlocking
- 📈 Practice statistics and streaks
- 💾 Local storage persistence (auto-save)

#### Learning Method
Uses the **Koch Method** - a proven technique employed by professional Morse code training programs worldwide. This method introduces characters progressively to build pattern recognition rather than counting dots and dashes.

## 🚀 Quick Start

### For Beginners
1. Enter your username
2. Select **Practice Mode**
3. Start with Lesson 1 (E and T)
4. Progress through the curriculum at your own pace
5. Switch to Chat Mode when ready for real conversations!

### For Experienced Users
1. Enter your username
2. Select **Chat Mode**
3. Get instantly matched with another user
4. Start communicating in Morse code!

## 📦 Tech Stack

### Frontend
- **React 19.2** - UI framework
- **React Router 7.9** - Navigation
- **Socket.io-client 4.8** - Real-time communication
- **Vite 7.1** - Build tool
- **Web Audio API** - Morse code sound generation

### Backend
- **Node.js 20** - Runtime
- **Express 4.21** - Web framework
- **Socket.io 4.8** - WebSocket server
- **Better-SQLite3 12.4** - Database
- **bcrypt** - Password hashing (admin)

### Security
- Rate limiting (connections and messages)
- Input sanitization
- CORS protection
- CSP headers
- HTTPS-only in production
- Admin authentication

## 🎮 Morse Code Reference

### Full Character Set (56 Total)

**Letters (A-Z)**
```
A ·−    B −···  C −·−·  D −··   E ·     F ··−·  G −−·   H ····  I ··    J ·−−−
K −·−   L ·−··  M −−    N −·    O −−−   P ·−−·  Q −−·−  R ·−·   S ···   T −
U ··−   V ···−  W ·−−   X −··−  Y −·−−  Z −−··
```

**Numbers (0-9)**
```
1 ·−−−−  2 ··−−−  3 ···−−  4 ····−  5 ·····
6 −····  7 −−···  8 −−−··  9 −−−−·  0 −−−−−
```

**Punctuation (20 Marks)**
```
. ·−·−·−    , −−··−−    ? ··−−··    ' ·−−−−·    " ·−··−·
! −·−·−−    / −··−·     : −−−···    ; −·−·−·    ( −·−−·
) −·−−·−    = −···−     - −····−    _ ··−−·−    + ·−·−·
@ ·−−·−·
```

## 📁 Project Structure

```
morse-me-please/
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ModeSelector.jsx
│   │   │   ├── LessonSelector.jsx
│   │   │   └── PracticeFeedback.jsx
│   │   ├── practice/           # Practice mode components
│   │   │   └── ExerciseRunner.jsx
│   │   ├── lessons/            # Lesson data and structure
│   │   │   └── lessonData.js
│   │   ├── utils/              # Utility functions
│   │   │   ├── morseEncoder.js
│   │   │   └── lessonManager.js
│   │   ├── pages/              # Static pages
│   │   ├── App.jsx             # Main app (Chat mode)
│   │   ├── PracticeMode.jsx    # Practice mode orchestrator
│   │   ├── MorseHelper.jsx     # Morse reference
│   │   └── BPMTiming.js        # Advanced timing system
│   └── public/
├── server/
│   ├── server.js               # Main server
│   ├── db.js                   # Database layer
│   ├── admin-routes.js         # Admin API
│   └── security/               # Security modules
└── docker-compose.yml

```

## 🔧 Installation & Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/onatatmaca/morse-me-please.git
cd morse-me-please

# Install dependencies
npm install
cd frontend && npm install
cd ../server && npm install

# Run development servers
# Terminal 1 - Frontend (Vite)
cd frontend
npm run dev  # Runs on http://localhost:5173

# Terminal 2 - Backend (Node + Socket.io)
cd server
npm start  # Runs on http://localhost:3000
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access at http://localhost:3000
```

### Environment Variables

Create `.env` in the server directory:

```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt_hash>
```

## 📊 Database Schema

**user_sessions**
- Tracks user connections, durations, message counts
- Stores IP addresses for admin monitoring

**chat_messages**
- Logs all morse messages with translations
- Tracks WPM and timestamps
- Links to user sessions

**daily_stats**
- Aggregated statistics per day
- Peak concurrent users, total messages, average WPM

## 🎯 Learning Path

### Beginner (5-10 WPM)
1. Complete Lessons 1-3 in Practice Mode
2. Master E, T, I, A, N, M, S, O
3. Learn to spell SOS
4. Practice at 5 WPM, gradually increase

### Intermediate (10-20 WPM)
1. Complete Lessons 4-8
2. Master full alphabet and numbers
3. Practice common words
4. Achieve 15 WPM in speed drills

### Advanced (20-25 WPM)
1. Complete Lessons 9-12
2. Master punctuation
3. Practice conversations
4. Achieve 20 WPM sustained

### Expert (25+ WPM)
1. Complete Lessons 13-15
2. Master Farnsworth timing
3. Achieve 25 WPM
4. Ready for ham radio license tests!

## 🏆 Achievements

Unlock achievements as you progress:
- **First Steps**: Type your first letter
- **SOS Master**: Type SOS correctly 10 times
- **Complete Alphabet**: Master all 26 letters
- **Number Master**: Master all 10 numbers
- **Speed Demon 15/20/25**: Reach 15/20/25 WPM
- **Perfectionist**: Get 100% accuracy on any lesson
- **Training Complete**: Finish all 15 lessons

## 🔐 Security Features

- **Rate Limiting**: 5 connections per IP, 60 messages/min
- **Input Sanitization**: All user inputs sanitized
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: CSP headers, escaped outputs
- **CORS Protection**: Whitelist-based origin checking
- **Admin Authentication**: bcrypt password hashing
- **HTTPS Enforcement**: HSTS headers in production

## 📱 Mobile Support

Fully responsive design:
- Touch-optimized buttons
- Mobile-friendly layouts
- Two Circle Mode optimized for touchscreens
- Progressive Web App (PWA) ready

## 🎨 Customization

**Audio Settings**
- My Morse Volume: 0-100%
- Partner Morse Volume: 0-100%
- My Frequency: 300-1200 Hz
- Partner Frequency: 300-1200 Hz

**Timing Settings**
- WPM: 5-50 (adjustable in real-time)
- Auto-send Delay: 1-5 seconds
- Keyboard Input: Enable/Disable

**Display Options**
- Live Translation: Show/Hide
- Input Mode: Single/Two Circle, Keyboard

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Koch Method**: Developed by Ludwig Koch in the 1930s, still the gold standard for Morse code training
- **International Morse Code**: ITU standard
- **Ham Radio Community**: For preserving and teaching Morse code
- **LCWO.net, MorseCodeNinja**: Inspiration for practice mode

## 📞 Support

- **Documentation**: See `/guide` page in the app
- **Issues**: https://github.com/onatatmaca/morse-me-please/issues
- **Contact**: Open an issue for questions

## 🚀 Future Features

- [ ] Progress Dashboard with detailed stats
- [ ] Practice Bot for conversation simulation
- [ ] Flashcard mode for character review
- [ ] Custom practice drills
- [ ] Leaderboards (with cloud sync)
- [ ] Multiplayer morse challenges
- [ ] Prosigns and Q-codes
- [ ] Sound effects and animations
- [ ] Dark/Light theme toggle

## 📈 Version History

**v2.0.0** - Practice Mode Release
- ✨ NEW: Complete Practice Mode with 15 lessons
- ✨ NEW: Exercise system (Learn, Listen, Type, Word, Speed, Mixed)
- ✨ NEW: Progress tracking and character mastery
- ✨ NEW: Achievement system
- ✨ NEW: 56 total characters (letters, numbers, punctuation)
- ✨ NEW: Mode selector (Practice vs Chat)
- 📝 Updated documentation and guide
- 🎨 Enhanced UI/UX for learning flow

**v1.0.0** - Initial Release
- Real-time morse code chat
- Duplex communication
- Multiple input modes
- Admin dashboard
- Docker deployment

---

**Built with ❤️ for Morse code enthusiasts worldwide** 📡

*"The quick brown fox jumps over the lazy dog"*
```
− .... ·    −−· ··− ·· −·−· −·−   −··· ·−· −−− ·−− −·   ··−· −−− −··−
·−−− ··− −− ·−−· ···   −−− ···− · ·−·   − .... ·   ·−·· ·· −·−· −·−−   −·· −−− −−·
```

// src/pages/Guide.jsx
import React from 'react';
import './Pages.css';

function Guide() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">How to Use Morse Me Please</h1>

        <section className="page-section">
          <h2>Getting Started</h2>
          <p>
            Welcome to Morse Me Please! This guide will help you start communicating through Morse code
            in minutes. Our platform offers two ways to learn and practice:
          </p>
          <ul className="feature-list">
            <li><strong>🎓 Practice Mode:</strong> Learn Morse code solo with 15 progressive lessons, interactive exercises, and real-time feedback. Perfect for beginners!</li>
            <li><strong>💬 Chat Mode:</strong> Connect instantly with other users for real-time Morse code conversations.</li>
          </ul>
          <p>
            Whether you're a complete beginner or an experienced Morse code operator, we've got you covered!
          </p>
        </section>

        <section className="page-section">
          <h2>Step 1: Enter the Chat Room</h2>
          <p>
            When you first visit Morse Me Please, you'll see a username entry screen. Simply enter
            your desired username (or nickname) and click "Enter Chat" to join the platform. Your
            username will be visible to your chat partner.
          </p>
          <p>
            Once you enter, you'll be automatically matched with another online user. If no one is
            currently available, you'll enter a waiting room until someone else joins. Our matching
            system is instant and automatic.
          </p>
        </section>

        <section className="page-section">
          <h2>Step 2: Choose Your Input Mode</h2>
          <p>
            Morse Me Please offers three different input modes to suit your preference and skill level:
          </p>

          <h3>Keyboard Mode (Beginner-Friendly)</h3>
          <p>
            Use your keyboard spacebar to tap out Morse code. Short taps create dots (·), longer
            holds create dashes (—). This mode is perfect for beginners as it closely mimics
            traditional Morse key operation.
          </p>

          <h3>Single Circle Mode (Standard)</h3>
          <p>
            Click or tap on a single circular button to send Morse code. Like keyboard mode,
            short taps produce dots and long presses produce dashes. This mode works great on
            both desktop and mobile devices.
          </p>

          <h3>Two Circle Mode (Advanced)</h3>
          <p>
            The two-circle mode provides separate buttons for dots and dashes, giving you precise
            control over your Morse code transmission. The left button sends dots (·), and the right
            button sends dashes (—). This mode is preferred by experienced operators for faster,
            more accurate communication.
          </p>
        </section>

        <section className="page-section">
          <h2>Step 3: Sending Morse Code</h2>
          <p>
            To send a message, simply tap out the Morse code for each letter using your chosen
            input method. Morse Me Please automatically detects when you've finished a character
            based on the pause between inputs.
          </p>
          <p>
            <strong>Timing Guide:</strong>
          </p>
          <ul className="feature-list">
            <li><strong>Dot:</strong> Short tap or press</li>
            <li><strong>Dash:</strong> Hold for approximately 3x the duration of a dot</li>
            <li><strong>Between dots/dashes:</strong> Brief pause (automatic)</li>
            <li><strong>Between letters:</strong> Pause for about 3 dot lengths</li>
            <li><strong>Between words:</strong> Pause for about 7 dot lengths</li>
          </ul>
          <p>
            Don't worry about perfect timing! Morse Me Please is forgiving and will interpret
            your input intelligently. The live translation feature shows you what you're sending
            in real-time, so you can verify your message before it's sent.
          </p>
        </section>

        <section className="page-section">
          <h2>Step 4: Reading Messages</h2>
          <p>
            When your partner sends you Morse code, you'll see and hear the dots and dashes played back
            character-by-character with synchronized audio. The platform provides:
          </p>
          <ul className="feature-list">
            <li><strong>Visual Feedback:</strong> Dots and dashes appear as they're sent</li>
            <li><strong>Audio Feedback:</strong> Different audio frequencies for your messages vs. partner's messages</li>
            <li><strong>Live Translation:</strong> Instant text conversion of incoming Morse code</li>
            <li><strong>Typing Indicators:</strong> See when your partner is composing a message</li>
            <li><strong>Message History:</strong> Scroll through your conversation transcript</li>
          </ul>
          <p>
            Messages are transmitted instantly, then played back character-by-character at your preferred
            speed (WPM), allowing you to hear and learn the Morse patterns at a comfortable pace.
          </p>
        </section>

        <section className="page-section">
          <h2>Adjusting Settings</h2>
          <p>
            Click the settings icon (⚙️) in the top-right corner to customize your experience:
          </p>

          <h3>WPM (Words Per Minute)</h3>
          <p>
            Adjust the speed of Morse code transmission from 5 WPM (very slow, for beginners) up to
            50 WPM (expert). Find a comfortable speed that challenges you without overwhelming you.
            As you improve, gradually increase the WPM to build your skills.
          </p>

          <h3>Auto-Send Delay</h3>
          <p>
            This setting controls how long the system waits after your last input before automatically
            sending your message. A shorter delay means faster transmission but requires more precise
            timing. A longer delay gives you more time to compose your message.
          </p>

          <h3>Volume and Audio Controls</h3>
          <p>
            Customize your audio experience with independent controls:
          </p>
          <ul className="feature-list">
            <li><strong>My Morse Code Volume:</strong> Adjust the volume for your own morse sounds</li>
            <li><strong>Partner Morse Code Volume:</strong> Adjust the volume for your partner's morse sounds</li>
            <li><strong>My Morse Code Frequency:</strong> Change the audio tone (pitch) of your morse code (200-1000 Hz)</li>
            <li><strong>Partner Morse Code Frequency:</strong> Change the audio tone (pitch) of partner's morse code (200-1000 Hz)</li>
          </ul>
          <p>
            Different frequencies make it easy to distinguish who's sending. You can also mute either
            channel entirely if you prefer silent practice or want to focus on only one audio stream.
          </p>
        </section>

        <section className="page-section">
          <h2>Learning Morse Code</h2>
          <p>
            If you're new to Morse code, use the Morse Helper (?) button to view the complete
            International Morse Code alphabet. This reference guide shows the dot-dash pattern
            for every letter, number, and common punctuation mark.
          </p>

          <h3>Beginner Tips</h3>
          <ul className="feature-list">
            <li>Start with simple letters like E (·) and T (—)</li>
            <li>Practice the most common letters first: E, T, A, O, I, N</li>
            <li>Use the live translation to verify your inputs</li>
            <li>Begin at 5-10 WPM and increase gradually</li>
            <li>Focus on consistent timing rather than speed</li>
            <li>Practice daily for best results</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Duplex Communication</h2>
          <p>
            Morse Me Please features duplex communication, meaning both you and your partner can
            send and receive simultaneously. This creates a more natural conversation flow compared
            to traditional turn-based communication systems.
          </p>
          <p>
            You'll see real-time typing indicators showing when your partner is composing a message.
            Messages are transmitted instantly, then played back character-by-character with synchronized
            audio at the receiver's end. Each partner's morse code has a distinct audio frequency,
            making it easy to distinguish who's sending. The system handles simultaneous transmission
            gracefully, and each message is clearly attributed to its sender.
          </p>
        </section>

        <section className="page-section">
          <h2>Finding a New Partner</h2>
          <p>
            Want to chat with someone else? Click the "Find New Partner" button in the control panel
            to disconnect from your current partner and get matched with a new user. Your current
            conversation will end, and you'll start fresh with a new partner.
          </p>
        </section>

        <section className="page-section">
          <h2>Mobile Usage</h2>
          <p>
            Morse Me Please works perfectly on smartphones and tablets. The interface automatically
            adapts to smaller screens, and touch controls are optimized for mobile devices. The
            single-circle mode (default) provides a large, easy-to-tap button that works great on
            touchscreens. Advanced users can also switch to keyboard mode or two-circle mode for
            more precise control.
          </p>
        </section>

        <section className="page-section">
          <h2>Common Issues and Solutions</h2>

          <h3>My messages aren't sending</h3>
          <p>
            Make sure you're pausing long enough between characters. The auto-send delay can be
            adjusted in settings if you need more or less time.
          </p>

          <h3>I can't hear the audio</h3>
          <p>
            Check the volume control in the top-right corner. Also verify that your device volume
            is turned up and not muted.
          </p>

          <h3>My partner disconnected</h3>
          <p>
            If your partner leaves or loses connection, you'll see a notification. Use the
            "Find New Partner" button to match with someone else.
          </p>

          <h3>The timing feels off</h3>
          <p>
            Adjust your WPM setting to find a comfortable speed. Lower speeds give you more time
            for each input. Also try adjusting the auto-send delay.
          </p>
        </section>

        <section className="page-section">
          <h2>🎓 Practice Mode: Learn Solo</h2>
          <p>
            <strong>New to Morse code?</strong> Our Practice Mode offers a complete learning curriculum
            with 15 progressive lessons designed using the Koch Method - a proven technique used by
            professional Morse code training programs worldwide.
          </p>

          <h3>How Practice Mode Works</h3>
          <p>
            Choose Practice Mode from the main screen to access:
          </p>
          <ul className="feature-list">
            <li><strong>15 Progressive Lessons:</strong> Start with E and T, gradually building to the complete Morse code set (letters, numbers, punctuation)</li>
            <li><strong>Interactive Exercises:</strong> Listen to characters, type morse code, practice words, and take speed challenges</li>
            <li><strong>Instant Feedback:</strong> See your accuracy percentage, WPM speed, and mistakes after each exercise</li>
            <li><strong>Progress Tracking:</strong> Your progress is saved locally - pick up where you left off</li>
            <li><strong>Character Mastery:</strong> Track which characters you've mastered and which need more practice</li>
            <li><strong>Achievements:</strong> Unlock achievements as you progress through the curriculum</li>
          </ul>

          <h3>The 15-Lesson Curriculum</h3>
          <ul className="feature-list">
            <li><strong>Lessons 1-3 (Beginner):</strong> E, T, I, A, N, M, S, O - Learn the basics and spell SOS!</li>
            <li><strong>Lessons 4-5:</strong> H, U, V, F, L, R, W, J, P - Common letters for building words</li>
            <li><strong>Lessons 6-7 (Intermediate):</strong> B, C, D, G, K, Q, X, Y, Z - Complete the alphabet</li>
            <li><strong>Lesson 8:</strong> Numbers 0-9 with their special patterns</li>
            <li><strong>Lessons 9-12 (Advanced):</strong> Punctuation marks, conversation practice, complete character set</li>
            <li><strong>Lessons 13-15 (Expert):</strong> Speed training (15-25 WPM), Farnsworth method, final mastery test</li>
          </ul>

          <h3>Exercise Types</h3>
          <p>
            Each lesson includes a variety of exercise types to reinforce learning:
          </p>
          <ul className="feature-list">
            <li><strong>Learn:</strong> Introduction to new characters with audio playback</li>
            <li><strong>Listen:</strong> Hear morse code and identify the character</li>
            <li><strong>Type:</strong> See a character and type its morse code</li>
            <li><strong>Word:</strong> Practice complete words and sentences</li>
            <li><strong>Speed:</strong> Timed challenges to improve your WPM</li>
            <li><strong>Mixed:</strong> Random practice with all learned characters</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Ready to Start?</h2>
          <p>
            <strong>Complete Beginners:</strong> Start with Practice Mode! Work through the 15 lessons
            at your own pace. You'll learn every character systematically and build real skills.
          </p>
          <p>
            <strong>Have Some Experience?</strong> Jump into Chat Mode to practice with real people,
            or use Practice Mode to sharpen specific skills and increase your speed.
          </p>
          <p>
            You can switch between Practice and Chat Mode anytime. Your progress in Practice Mode
            is saved automatically, so you can always pick up where you left off!
          </p>
          <p>
            Remember: Everyone starts as a beginner, and practice makes perfect! Good luck on your
            Morse code journey! 📡
          </p>
        </section>
      </div>
    </div>
  );
}

export default Guide;

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
            in minutes. Our platform is designed to be intuitive, whether you're a complete beginner
            or an experienced Morse code operator.
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
            When your partner sends you Morse code, you'll see and hear the dots and dashes in
            real-time. The platform provides:
          </p>
          <ul className="feature-list">
            <li><strong>Visual Feedback:</strong> Dots and dashes appear as they're sent</li>
            <li><strong>Audio Feedback:</strong> Different tones for your messages vs. partner's messages</li>
            <li><strong>Live Translation:</strong> Instant text conversion of incoming Morse code</li>
            <li><strong>Message History:</strong> Scroll through your conversation transcript</li>
          </ul>
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

          <h3>Volume Control</h3>
          <p>
            Use the volume button (🔊) to adjust the audio feedback level or mute it entirely if
            you prefer silent practice.
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
            You'll see visual indicators when both users are typing at the same time. Don't worry
            - the system handles simultaneous transmission gracefully, and each message is clearly
            attributed to its sender.
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
            two-circle mode is particularly effective on mobile, providing large, easy-to-tap buttons.
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
          <h2>Ready to Chat?</h2>
          <p>
            Now that you know how to use Morse Me Please, you're ready to start chatting! Enter
            the chat room, get matched with a partner, and begin your Morse code journey. Remember,
            everyone starts as a beginner - practice makes perfect!
          </p>
        </section>
      </div>
    </div>
  );
}

export default Guide;

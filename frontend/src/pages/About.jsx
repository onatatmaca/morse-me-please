// src/pages/About.jsx
import React from 'react';
import './Pages.css';

function About() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">About Morse Me Please</h1>

        <section className="page-section">
          <h2>Connect Through Timeless Communication</h2>
          <p>
            Morse Me Please is a real-time communication platform that connects strangers worldwide
            through the fascinating language of Morse code. In an age of instant messaging and emojis,
            we bring back the art of dot-dash communication with a modern, futuristic twist.
          </p>
          <p>
            Our platform offers a unique way to practice Morse code while connecting with people
            from around the globe. Whether you're a radio amateur, a history enthusiast, or simply
            curious about learning Morse code, Morse Me Please provides an immersive environment
            to chat, learn, and improve your skills.
          </p>
        </section>

        <section className="page-section">
          <h2>What is Morse Code?</h2>
          <p>
            Morse code is a method of encoding text characters using standardized sequences of two
            different signal durations: dots (·) and dashes (—). Developed in the 1830s and 1840s
            by Samuel Morse and Alfred Vail for the telegraph, it revolutionized long-distance
            communication and remains one of the most iconic communication systems in history.
          </p>
          <p>
            Despite being over 180 years old, Morse code is still used today by amateur radio
            operators, pilots, and as an accessibility tool. It's a universal language that
            transcends spoken languages, requiring only the understanding of dots and dashes to
            communicate effectively.
          </p>
        </section>

        <section className="page-section">
          <h2>Why Morse Code Chat?</h2>
          <p>
            Learning Morse code improves cognitive abilities, pattern recognition, and concentration.
            Our platform makes this educational journey fun and social by connecting you with other
            learners and enthusiasts in real-time conversations.
          </p>
          <p>
            Key benefits of practicing Morse code:
          </p>
          <ul className="feature-list">
            <li><strong>Cognitive Enhancement:</strong> Improves memory, focus, and pattern recognition</li>
            <li><strong>Historical Connection:</strong> Connect with a communication method used for nearly two centuries</li>
            <li><strong>Accessibility:</strong> Morse code can be used by people with various disabilities</li>
            <li><strong>Emergency Communication:</strong> A valuable skill for situations where voice communication isn't possible</li>
            <li><strong>Amateur Radio:</strong> Essential for ham radio operators and enthusiasts</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Our Mission</h2>
          <p>
            We created Morse Me Please to preserve and celebrate this historic communication method
            while making it accessible to a new generation. By combining real-time chat capabilities
            with an intuitive, futuristic interface, we aim to make learning Morse code engaging,
            social, and fun.
          </p>
          <p>
            Our platform features live Morse-to-text translation, adjustable speed settings (WPM),
            multiple input modes, and instant partner matching. Whether you're tapping on your
            keyboard, using our single-circle interface, or the advanced two-circle mode, we provide
            the tools you need to master Morse code communication.
          </p>
        </section>

        <section className="page-section">
          <h2>The Technology</h2>
          <p>
            Morse Me Please is built with modern web technologies including React and WebSocket for
            real-time communication. Our duplex communication system allows both users to send and
            receive Morse code simultaneously, creating a natural conversation flow that mirrors
            real-world Morse code communication.
          </p>
          <p>
            Every beep, every dash, every dot is transmitted in real-time, creating an authentic
            Morse code experience. Our live translation feature helps beginners learn by showing
            the text equivalent of each Morse sequence as it's being sent.
          </p>
        </section>

        <section className="page-section">
          <h2>Join the Community</h2>
          <p>
            Ready to start your Morse code journey? Enter the chat room, get matched with a
            partner, and begin communicating through dots and dashes. Practice makes perfect,
            and every conversation helps you improve your skills.
          </p>
          <p>
            Morse Me Please is completely free to use. No registration required, no paywalls,
            just pure Morse code communication. Start chatting now and become part of a global
            community keeping this historical communication art alive.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;

// src/pages/Privacy.jsx
import React from 'react';
import './Pages.css';

function Privacy() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Privacy Policy</h1>

        <p className="page-intro">
          <em>Last updated: November 18, 2025</em>
        </p>

        <section className="page-section">
          <h2>Overview</h2>
          <p>
            We are committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard information when
            you use our real-time Morse code chat platform.
          </p>
          <p>
            We believe in transparency and responsible data handling. We only collect what is
            necessary to provide and improve our service and never sell your personal information.
          </p>
        </section>

        <section className="page-section">
          <h2>Information We Collect</h2>

          <h3>Username</h3>
          <p>
            When you enter Morse Me Please, you provide a username for display during chat
            sessions. This username is:
          </p>
          <ul className="feature-list">
            <li>Chosen by you at the time of entry</li>
            <li>Visible to your chat partners</li>
            <li>Stored temporarily for service analytics</li>
          </ul>

          <h3>Connection Data</h3>
          <p>
            We automatically collect certain technical information for service operation:
          </p>
          <ul className="feature-list">
            <li>Connection status and session duration</li>
            <li>Browser type and device information</li>
            <li>Session timing and activity patterns</li>
          </ul>

          <h3>Technical Information</h3>
          <p>
            Standard web server data is collected to maintain service quality and security:
          </p>
          <ul className="feature-list">
            <li>Network routing information</li>
            <li>Service access timestamps</li>
            <li>Performance metrics and error logs</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Analytics</h2>
          <p>
            We use Google Analytics to understand how visitors use our platform. Google Analytics
            collects information such as:
          </p>
          <ul className="feature-list">
            <li>Pages visited and time spent on site</li>
            <li>Geographic location (country/city level)</li>
            <li>Browser and device information</li>
            <li>Traffic sources (how you found our site)</li>
          </ul>
          <p>
            This information is anonymized and used solely to improve our service. You can opt out
            of Google Analytics tracking by using browser extensions like Google Analytics Opt-out
            Browser Add-on.
          </p>
        </section>

        <section className="page-section">
          <h2>Cookies and Local Storage</h2>
          <p>
            Morse Me Please uses minimal cookies and local storage:
          </p>

          <h3>Essential Cookies</h3>
          <p>
            We use session cookies to maintain your connection and match you with chat partners.
            These are essential for the platform to function and are deleted when you close your
            browser.
          </p>

          <h3>Preference Storage</h3>
          <p>
            Your settings (WPM, volume, frequency, input mode) are stored in your browser's local storage
            to remember your preferences between sessions. This data never leaves your device.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            Google Analytics uses cookies to track user behavior. You can disable these through
            your browser settings or by using privacy-focused browser extensions.
          </p>
        </section>

        <section className="page-section">
          <h2>How We Use Your Information</h2>
          <p>
            We use collected information solely to:
          </p>
          <ul className="feature-list">
            <li>Facilitate real-time Morse code chat sessions</li>
            <li>Match you with available chat partners</li>
            <li>Display online user counts</li>
            <li>Improve platform performance and user experience</li>
            <li>Understand usage patterns to guide feature development</li>
            <li>Ensure platform stability and troubleshoot technical issues</li>
            <li>Monitor service health and prevent abuse</li>
          </ul>
          <p>
            <strong>We never:</strong>
          </p>
          <ul className="feature-list">
            <li>Sell or rent your information to third parties</li>
            <li>Use your information for advertising purposes</li>
            <li>Share your information except as required by law</li>
            <li>Retain data longer than necessary for service operation</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul className="feature-list">
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure WebSocket connections for real-time chat</li>
            <li>Database encryption and access controls</li>
            <li>Regular security updates and monitoring</li>
            <li>Automated cleanup of old records</li>
          </ul>
          <p>
            While we strive to protect your information, no internet transmission is 100% secure.
            You use our platform at your own risk.
          </p>
        </section>

        <section className="page-section">
          <h2>Third-Party Services</h2>

          <h3>Google Analytics</h3>
          <p>
            We use Google Analytics to collect anonymized usage statistics. Google's privacy
            policy can be found at: https://policies.google.com/privacy
          </p>

          <h3>Buy Me A Coffee</h3>
          <p>
            Our platform includes a Buy Me A Coffee widget for optional donations. If you choose
            to support us, you'll be redirected to Buy Me A Coffee's platform, which has its own
            privacy policy.
          </p>
        </section>

        <section className="page-section">
          <h2>Children's Privacy</h2>
          <p>
            Morse Me Please is not intended for children under 13. We do not knowingly collect
            information from children under 13. If you are a parent or guardian and believe your
            child has provided us with personal information, please contact us so we can delete it.
          </p>
        </section>

        <section className="page-section">
          <h2>International Users</h2>
          <p>
            Morse Me Please is accessible worldwide. If you access our platform from outside your
            country of residence, please note that your information may be transferred to, stored,
            and processed in different countries. By using our service, you consent to this transfer.
          </p>
        </section>

        <section className="page-section">
          <h2>Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="feature-list">
            <li>Access any personal information we hold about you</li>
            <li>Request deletion of your information</li>
            <li>Opt out of analytics tracking</li>
            <li>Use the platform with any username (including pseudonyms)</li>
            <li>Disconnect at any time</li>
          </ul>
        </section>

        <section className="page-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on this
            page with an updated "Last updated" date. Continued use of Morse Me Please after
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="page-section">
          <h2>Data Retention</h2>
          <p>
            We practice responsible data retention to balance service improvement with privacy:
          </p>
          <ul className="feature-list">
            <li><strong>Service Logs:</strong> Retained for up to 30 days for quality assurance and troubleshooting</li>
            <li><strong>Analytics Data:</strong> Retained by Google Analytics per their data retention policy</li>
            <li><strong>User Preferences:</strong> Stored locally in your browser indefinitely (under your control)</li>
          </ul>
          <p>
            Operational data is automatically purged after the retention period to minimize data storage.
            This automated cleanup process runs daily to ensure compliance with our retention policies.
          </p>
        </section>

        <section className="page-section">
          <h2>Service Analytics and Improvement</h2>
          <p>
            To maintain and improve Morse Me Please, we collect aggregated usage metrics including:
          </p>
          <ul className="feature-list">
            <li>Platform performance indicators (response times, error rates)</li>
            <li>Feature usage statistics (which input modes are most popular, average WPM)</li>
            <li>Session patterns (peak usage times, session durations)</li>
            <li>Communication metadata for service optimization</li>
          </ul>
          <p>
            This data helps us understand how the platform is used, identify technical issues,
            optimize matching algorithms, and plan new features. Analytics are conducted on
            aggregated, de-identified data wherever possible.
          </p>
        </section>

        <section className="page-section">
          <h2>Contact</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your information,
            you can contact us through the Buy Me A Coffee widget on our platform or open an
            issue on our project repository.
          </p>
        </section>

        <section className="page-section">
          <h2>Summary</h2>
          <p>
            In short: Morse Me Please collects standard web service data (usernames, connection information,
            usage metrics) to provide and improve our platform. We retain operational data for up to 30 days,
            use Google Analytics for anonymous statistics, and never sell your data. We're committed to
            responsible data handling and your privacy.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;

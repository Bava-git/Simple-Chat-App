import React from 'react';
import '../assets/styles/HomePage.css';

const HomePage = () => {
    return (
        <div className="home-wrapper">
            <header className="home-header">
                <h1>Welcome to ChatApp</h1>
                <p>Your secure and blazing-fast messaging experience—100% free.</p>
            </header>

            <section className="feature-grid">
                <div className="feature-box">
                    <h2>🔐 Encryption</h2>
                    <p>End-to-end encryption ensures your messages are private and for your eyes only.</p>
                </div>
                <div className="feature-box">
                    <h2>⚡ Speed</h2>
                    <p>Instant delivery powered by real-time WebSocket technology.</p>
                </div>
                <div className="feature-box">
                    <h2>🛡️ Security</h2>
                    <p>Built with best-in-class protection against data breaches and phishing attacks.</p>
                </div>
                <div className="feature-box">
                    <h2>💸 Free Forever</h2>
                    <p>No subscriptions, no hidden fees. Just pure, free communication.</p>
                </div>
            </section>

            <footer className="home-footer">
                <p>Start chatting now — because secure connection shouldn't come with a price tag.</p>
            </footer>
        </div>
    );
};

export default HomePage;

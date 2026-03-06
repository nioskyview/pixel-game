# Pixel Quiz Game: Architectural Blueprint (Executive Summary)

This document provides a high-level, visual overview of the game's new "Vertical Slice" architecture. It is designed for Product Managers and non-technical stakeholders to understand how the system is organized to ensure stability and rapid feature delivery.

## 1. The Big Picture: Feature Pillars
Our architecture is now organized into four independent "Islands" or "Pillars." This means a change in one area (like changing a sound effect) will never accidentally break another area (like logic for calculating scores).

![Architecture Infographic](../assets/vsa_refactoring_visual.png)

### 🛡️ Authentication Gate (Gatekeeper)
Handles player identity and security. It ensures every score submitted is authentic and linked to a valid player session.
- **Goal**: Security & Session management.

### 🧠 Quiz Core (The Brain)
The heart of the game logic. It manages question delivery, time limits, and score calculations. By isolating this, we can easily add new types of questions (images, audio, etc.) without touching the rest of the app.
- **Goal**: Core Gameplay Logic.

### 🏆 Global Rankings (The Ledger)
Synchronizes with our cloud databases to provide real-time leaderboards. It is decoupled from the game logic to ensure that even if the ranking server is slow, the game remains smooth for the player.
- **Goal**: Competitive Data Persistence.

### 🎵 Symphony Engine (Experience)
Manages all audio assets and visual effects. It reacts to game events (correct/wrong answers) but operates on its own dedicated thread to prevent UI lag.
- **Goal**: Immersive User Experience.

---

## 2. Why this matters for the Product
- **Zero Regression**: New features don't break old ones.
- **Faster Implementation**: Developers focus on one pillar at a time.
- **Clear Roadmap**: Progress can be tracked by "Enabled Pillars" in the sprint.

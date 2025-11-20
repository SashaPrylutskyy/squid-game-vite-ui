# Squid Game Vite UI

This project is the frontend part of the "Squid Game" competition management system, built with React and Vite. It provides a user interface for various game participant roles: from players and staff to VIP guests and organizers.

The project uses a retro style (inspired by old Reddit and 90s interfaces) to create a unique atmosphere.

## Key Features

- **Role-Based Access Control:** Interfaces adapt to the user's role (Player, Worker, Host, VIP, Salesman).
- **Competition Management:** Organizers can create games, manage rounds, and track statistics.
- **Gameplay:** Players see their status, vote, and interact with the game.
- **Investments:** VIP users can place bets on players.

## Main Links (Routes)

### Public Pages
- `/login` - System login.
- `/register` - Registration for new organizers or VIPs.
- `/join/:refCode` - Player joining via referral code.
- `/accept-offer/:token` - Accepting a job offer (for staff).

### General
- `/dashboard` - Main dashboard (redirects to the appropriate interface based on role).

### For Organizers (Host / Frontman)
- `/competitions` - List of all competitions.
- `/competitions/:id` - Details of a specific competition (managing rounds, players).
- `/competitions/:id/statistics` - Competition statistics.
- `/staff` - Staff management.

### For Players (Player)
- `/my-game` - Player's personal cabinet (status, voting).

### For Staff (Worker)
- `/my-tasks` - Worker's task panel.

### For Salesmen (Salesman)
- `/referral` - Generating referral codes for new players.

### For VIPs
- `/invest` - Investment and betting panel.

## Project Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open in browser: `http://localhost:5173` (or another port specified in the console).

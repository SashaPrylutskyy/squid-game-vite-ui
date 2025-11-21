# Squid Game Management System API Documentation

## Overview

This API manages the Squid Game Management System, handling user authentication, game logic, competition management, and player interactions.

**Base URL**: `/api`

## 1. Authentication & Authorization

The API uses **JSON Web Tokens (JWT)** for securing endpoints. Clients must obtain a token by logging in and then include it in the `Authorization` header of subsequent requests.

### 1.1 Obtaining a JWT
To access protected resources, you must first authenticate to receive a JWT.

*   **URL**: `/auth/login`
*   **Method**: `POST`
*   **Auth Required**: No

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Success Response**

*   **Code**: `200 OK`
*   **Content**: The response body contains the raw JWT string.

```text
eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNj...
```

**Error Response**

*   **Code**: `401 Unauthorized`
*   **Content**:

```json
{
  "error": "Invalid credentials"
}
```

### 1.2 Using the JWT
Include the JWT in the `Authorization` header for all protected endpoints. The scheme must be `Bearer`.

**Header Format**

```http
Authorization: Bearer <your_token_here>
```

**Example Request**

```http
GET /api/users/player/status HTTP/1.1
Host: api.squidgame.com
Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29t...
```

### 1.3 Token Expiration & Errors
Tokens have a configurable expiration time. If a token is missing, invalid, or expired, the API returns standard HTTP error codes.

*   **401 Unauthorized**: Token is missing, invalid, or expired.
    ```json
    {
      "error": "Full authentication is required to access this resource"
    }
    ```
*   **403 Forbidden**: User is authenticated but lacks the necessary role.
    ```json
    {
      "error": "Access is denied"
    }
    ```

### 1.4 Register User
Registers a new user with a specific role (HOST or VIP).

*   **URL**: `/auth/register`
*   **Method**: `POST`
*   **Auth Required**: No

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "HOST",
  "birthday": "1990-01-01",
  "firstName": "John",
  "lastName": "Doe",
  "profilePhoto": "/path/to/photo.jpg",
  "sex": "MALE",
  "balance": 1000000000
  // Optional, for VIPs
}
```

**Response**

*   **201 Created**

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "HOST",
  "status": "ALIVE"
}
```

### 1.3 Join via Referral Code
Registers a new player using a referral code.

*   **URL**: `/auth/join`
*   **Method**: `POST`
*   **Auth Required**: No

**Request Body**

```json
{
  "refCode": "HyQ6Ansg",
  "email": "player@example.com",
  "password": "password",
  "birthday": "1995-05-05",
  "firstName": "Player",
  "lastName": "One",
  "sex": "MALE"
}
```

**Response**

*   **200 OK**

```json
{
  "id": 10,
  "email": "player@example.com",
  "role": "PLAYER",
  "status": "ALIVE"
}
```

---

## 2. Users

### 2.1 Get Users
Retrieves a list of users filtered by role and assignment status.

*   **URL**: `/users`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Query Parameters**

*   `role` (required): The role to filter by (e.g., `WORKER`, `PLAYER`).
*   `isAssigned` (optional): Filter by assignment status (`true`/`false`).

**Response**

*   **200 OK**

```json
[
  {
    "id": 5,
    "email": "worker@example.com",
    "role": "WORKER",
    "status": "ALIVE"
  }
]
```

### 2.2 Get Worker Assignment
Retrieves the current assignment for the authenticated worker.

*   **URL**: `/users/worker/assignment`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `WORKER`, `FRONTMAN`

**Response**

*   **200 OK**

```json
{
  "currentRound": {
    "id": 12,
    "gameTitle": "Red Light, Green Light",
    "status": "IN_PROGRESS"
  },
  "playersToReport": [
    {
      "id": 101,
      "email": "player101@example.com",
      "role": "PLAYER",
      "status": "ALIVE"
    }
  ]
}
```

### 2.3 Get Player Status
Retrieves the current status of the authenticated player.

*   **URL**: `/users/player/status`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `PLAYER`

**Response**

*   **200 OK**

```json
{
  "competition": {
    "id": 5,
    "title": "Squid Game 2025"
  },
  "statusInCompetition": "ALIVE",
  "currentRound": {
    "id": 12,
    "roundNumber": 1,
    "gameTitle": "Red Light, Green Light",
    "status": "IN_PROGRESS"
  },
  "activeVote": {
    "canVote": false,
    "hasVoted": false
  }
}
```

---

## 3. Job Offers (Staff Hiring)

### 3.1 Make Job Offer
Creates a job offer for a specific email and role.

*   **URL**: `/job-offer`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`, `THE_OFFICER`, `MANAGER`

**Request Body**

```json
{
  "email": "candidate@example.com",
  "role": "WORKER"
}
```

**Response**

*   **201 Created**

```json
{
  "token": "uuid-token",
  "email": "candidate@example.com",
  "role": "WORKER",
  "status": "PENDING"
}
```

### 3.2 Accept Job Offer
Accepts a job offer and registers the user.

*   **URL**: `/job-offer/{token}/accept`
*   **Method**: `POST`
*   **Auth Required**: No

**Request Body**

```json
{
  "password": "securePassword",
  "firstName": "Staff",
  "lastName": "Member",
  "birthday": "1985-08-20",
  "sex": "FEMALE"
}
```

**Response**

*   **202 Accepted**

```json
{
  "email": "candidate@example.com",
  "role": "WORKER",
  "offerStatus": "ACCEPTED"
}
```

### 3.3 Get All Job Offers
Retrieves all job offers for the current lobby.

*   **URL**: `/job-offer`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`, `MANAGER`, `THE_OFFICER`

**Response**

*   **200 OK**

```json
[
  {
    "email": "candidate@example.com",
    "role": "WORKER",
    "offerStatus": "PENDING",
    "lobbyId": 1
  }
]
```

### 3.4 Get Staff
Retrieves all accepted job offers (staff members).

*   **URL**: `/job-offer/staff`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`, `MANAGER`, `THE_OFFICER`

**Response**

*   **200 OK**

```json
[
  {
    "email": "worker@example.com",
    "role": "WORKER",
    "offerStatus": "ACCEPTED"
  }
]
```

---

## 4. Assignment

### 4.1 Assign Players
Assigns a list of players to a competition.

*   **URL**: `/assignment`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Request Body**

```json
{
  "competitionId": 5,
  "playerIds": [10, 11, 12]
}
```

**Response**

*   **201 Created**

```json
{
  "competitionId": 5,
  "playerIds": [10, 11, 12]
}
```

### 4.2 Remove Players
Removes a list of players from a competition.

*   **URL**: `/assignment`
*   **Method**: `DELETE`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Request Body**

```json
{
  "competitionId": 5,
  "playerIds": [10]
}
```

**Response**

*   **200 OK**

```json
{
  "competitionId": 5,
  "playerIds": [10]
}
```

---

## 5. Competitions

### 5.1 Create Competition
Creates a new competition.

*   **URL**: `/competition/{title}`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Response**

*   **203 Created**

```json
{
  "id": 5,
  "title": "Squid Game 2025",
  "status": "PENDING",
  "lobbyId": 1
}
```

### 5.2 Start Competition
Starts a competition (changes status to ACTIVE).

*   **URL**: `/competition/{competitionId}/start`
*   **Method**: `PATCH`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Response**

*   **200 OK**

```json
{
  "id": 5,
  "title": "Squid Game 2025",
  "status": "ACTIVE",
  "lobbyId": 1
}
```

### 5.3 Get My Competitions
Retrieves competitions for the current lobby.

*   **URL**: `/competition`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Response**

*   **200 OK**

```json
[
  {
    "id": 5,
    "title": "Squid Game 2025",
    "status": "ACTIVE"
  }
]
```

### 5.4 Get All Competitions (VIP)
Retrieves all competitions system-wide.

*   **URL**: `/competition/list-all`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `VIP`

**Response**

*   **200 OK**

```json
[
  {
    "id": 5,
    "title": "Squid Game 2025",
    "status": "ACTIVE",
    "lobbyId": 1
  }
]
```

### 5.5 Get Competition Users
Retrieves users in a competition, optionally filtered by status and sex.

*   **URL**:
    *   `/competition/{competitionId}`
    *   `/competition/{competitionId}/{userStatus}`
    *   `/competition/{competitionId}/{userStatus}/{sex}`
*   **Method**: `GET`
*   **Auth Required**: Yes

**Response**

*   **200 OK**

```json
[
  {
    "id": 10,
    "email": "player@example.com",
    "status": "ALIVE"
  }
]
```

---

## 6. Games

### 6.1 Add Game
Adds a new game definition to the system.

*   **URL**: `/game`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Request Body**

```json
{
  "gameTitle": "Tug of War",
  "description": "Team based strength game...",
  "gameDuration": 30
}
```

**Response**

*   **203 Created**

```json
{
  "id": 1,
  "gameTitle": "Tug of War",
  "description": "Team based strength game...",
  "gameDuration": 30
}
```

### 6.2 Get Games
Retrieves all available games.

*   **URL**: `/game`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Response**

*   **200 OK**

---

## 7. Rounds

### 7.1 Add Rounds
Adds a list of games as rounds to a competition.

*   **URL**: `/round`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Request Body**

```json
{
  "competitionId": 5,
  "gameIds": [1, 2, 3]
}
```

**Response**

*   **203 Created**

```json
{
  "competitionId": 5,
  "roundSummaryDTOs": [
    {
      "id": 10,
      "gameId": 1,
      "roundNumber": 1
    },
    {
      "id": 11,
      "gameId": 2,
      "roundNumber": 2
    }
  ]
}
```

### 7.2 Get Current Round
Retrieves details of the current round.

*   **URL**: `/round/{competitionId}/current_round`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `HOST`, `FRONTMAN`

**Response**

*   **200 OK**

```json
{
  "id": 12,
  "competitionId": 5,
  "gameId": 1,
  "roundNumber": 1,
  "status": "IN_PROGRESS",
  "startedAt": 1762541511151,
  "endedAt": null
}
```

### 7.3 Get Next Round
Retrieves details of the next scheduled round.

*   **URL**: `/round/{competitionId}/next_round`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`

**Response**

*   **200 OK**

```json
{
  "id": 13,
  "competitionId": 5,
  "gameId": 2,
  "roundNumber": 2,
  "status": "PENDING",
  "startedAt": null,
  "endedAt": null
}
```

### 7.4 Start Next Round
Starts the next round in the sequence.

*   **URL**: `/round/{competitionId}/next_round/start`
*   **Method**: `PATCH`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`

**Response**

*   **200 OK**

```json
{
  "id": 13,
  "competitionId": 5,
  "gameId": 2,
  "roundNumber": 2,
  "status": "IN_PROGRESS",
  "startedAt": 1762541511151,
  "endedAt": null
}
```

### 7.5 End Current Round
Ends the currently active round.

*   **URL**: `/round/{competitionId}/current_round/end`
*   **Method**: `PATCH`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`

**Response**

*   **200 OK**

```json
{
  "id": 12,
  "competitionId": 5,
  "gameId": 1,
  "roundNumber": 1,
  "status": "COMPLETED",
  "startedAt": 1762541511151,
  "endedAt": 1762541529989
}
```

### 7.6 Get Round Users
Retrieves users in a round, optionally filtered by status and sex.

*   **URL**:
    *   `/round/{roundId}`
    *   `/round/{roundId}/{userStatus}`
    *   `/round/{roundId}/{userStatus}/{sex}`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`, `HOST`

**Response**

*   **200 OK**

```json
[
  {
    "id": 10,
    "email": "player@example.com",
    "status": "PASSED"
  }
]
```

---

## 8. Round Results

### 8.1 Report Player Status
Reports the outcome for a player in a round.

*   **URL**: `/round_result/{roundId}/{playerId}/{userStatus}`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `WORKER`
*   **Parameters**:
    *   `userStatus`: `PASSED` or `ELIMINATED`

**Response**

*   **203 Created**

```json
{
  "roundId": 12,
  "userId": 10,
  "status": "PASSED",
  "time": 1762681090338
}
```

### 8.2 Get Reported Players
Retrieves all reported results for a round.

*   **URL**: `/round_result/{roundId}/reported`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`

**Response**

*   **200 OK**

```json
{
  "roundId": 12,
  "players": [
    {
      "id": 10,
      "email": "player@example.com",
      "role": "PLAYER",
      "status": "PASSED"
    }
  ]
}
```

### 8.3 Confirm Reports
Confirms the reported results for a round.

*   **URL**: `/round_result/confirmation`
*   **Method**: `PATCH`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`

**Request Body**

```json
{
  "isValid": true,
  "roundId": 12,
  "playerIds": [10, 11, 12]
}
```

**Response**

*   **200 OK**

```json
{
  "roundId": 12,
  "players": [
    {
      "id": 10,
      "email": "player@example.com",
      "role": "PLAYER",
      "status": "PASSED"
    }
  ]
}
```

---

## 9. Voting

### 9.1 Vote
Casts a vote to continue or quit the games.

*   **URL**: `/voting/{roundId}/vote/{isQuit}`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `PLAYER`

**Response**

*   **200 OK**

```json
{
  "user": {
    "id": 10,
    "email": "player@example.com",
    "role": "PLAYER",
    "status": "ALIVE"
  },
  "quit": false
}
```

### 9.2 Get Vote Records
Retrieves all votes for a round.

*   **URL**: `/voting/{roundId}`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`, `HOST`

**Response**

*   **200 OK**

```json
[
  {
    "user": {
      "id": 10,
      "email": "player@example.com",
      "role": "PLAYER",
      "status": "ALIVE"
    },
    "quit": false
  }
]
```

### 9.3 Get Vote Results
Retrieves the aggregated results of the vote.

*   **URL**: `/voting/{roundId}/results`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `FRONTMAN`, `HOST`

**Response**

*   **200 OK**

```json
{
  "continueGame": 100,
  "quitGame": 5,
  "remaining": 105
}
```

---

## 10. Transactions & Referrals

### 10.1 Make Deposit
Deposits money into a competition's prize pool.

*   **URL**: `/transaction/deposit`
*   **Method**: `POST`
*   **Auth Required**: Yes
*   **Roles**: `VIP`

**Request Body**

```json
{
  "competitionId": 5,
  "amount": 1000000
}
```

**Response**

*   **200 OK**

```json
{
  "id": 100,
  "competition": {
    "id": 5,
    "title": "Squid Game 2025",
    "status": "ACTIVE"
  },
  "sender": {
    "id": 50,
    "email": "vip@example.com",
    "role": null,
    "status": null
  },
  "recipient": null,
  "amount": 1000000,
  "transactionType": "DEPOSIT",
  "createdAt": 1762976389203
}
```

### 10.2 Get Referral Code
Retrieves the referral code for the authenticated salesman.

*   **URL**: `/ref-code`
*   **Method**: `GET`
*   **Auth Required**: Yes
*   **Roles**: `SALESMAN`

**Response**

*   **200 OK**

```json
{
  "code": "HyQ6Ansg",
  "ownerEmail": "salesman@example.com"
}
```
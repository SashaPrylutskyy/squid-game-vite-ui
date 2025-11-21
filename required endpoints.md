# Required Backend Endpoints for Game Reports

To fully implement the requested Game Reports, the following API endpoints and data field updates are required.

## 1. User Data Updates

### 1.1 Enhanced User DTO
**Requirement**: Add `birthday` and `createdAt` to the User DTO to enable demographic and registration dynamics reports.

*   **Endpoint**: `GET /users`
*   **Change**: Add fields to the response object.
*   **Expected JSON**:
    ```json
    {
      "id": 1,
      "email": "player@example.com",
      "role": "PLAYER",
      "status": "ALIVE",
      "sex": "MALE",
      "birthday": "1990-05-20",       // [NEW]
      "createdAt": "2025-10-01T12:00:00Z" // [NEW]
    }
    ```

## 2. Player Statistics

### 2.1 Player Survival & Activity Stats
**Requirement**: Get aggregated statistics for player performance and participation.

*   **URL**: `/reports/players/statistics`
*   **Method**: `GET`
*   **Auth Required**: Yes (HOST, FRONTMAN)
*   **Expected JSON**:
    ```json
    [
      {
        "userId": 10,
        "email": "player@example.com",
        "roundsPassed": 5,
        "competitionsEntered": 2,
        "avgLifespanSeconds": 3600,
        "fastestEliminationRound": 1,
        "confirmationRate": 0.95 // (reportedAt / confirmedAt match rate)
      }
    ]
    ```

## 3. Competition Analytics

### 3.1 Competition Financials & Chronology
**Requirement**: detailed timeline and financial summary for a competition.

*   **URL**: `/reports/competition/{id}/details`
*   **Method**: `GET`
*   **Auth Required**: Yes (HOST, FRONTMAN)
*   **Expected JSON**:
    ```json
    {
      "competitionId": 5,
      "totalPrizePool": 5000000000,
      "vipContributions": 2000000000,
      "rounds": [
        {
          "roundNumber": 1,
          "gameTitle": "Red Light, Green Light",
          "startedAt": "2025-11-01T10:00:00Z",
          "endedAt": "2025-11-01T10:30:00Z",
          "durationSeconds": 1800,
          "playersStarted": 456,
          "playersEliminated": 200,
          "eliminationRate": 0.43
        }
      ]
    }
    ```

## 4. Round Statistics

### 4.1 Top Hardest Rounds
**Requirement**: Identify rounds with highest elimination rates or shortest survival times globally.

*   **URL**: `/reports/rounds/top-hardest`
*   **Method**: `GET`
*   **Auth Required**: Yes (HOST, FRONTMAN)
*   **Expected JSON**:
    ```json
    [
      {
        "roundId": 105,
        "competitionId": 5,
        "gameTitle": "Tug of War",
        "eliminationRate": 0.85,
        "avgSurvivalTimeSeconds": 120
      }
    ]
    ```

## 5. Voting Analytics

### 5.1 Voting Analysis
**Requirement**: Analyze voting patterns (Quit vs Continue) broken down by demographics.

*   **URL**: `/reports/voting/analysis`
*   **Method**: `GET`
*   **Auth Required**: Yes (HOST, FRONTMAN)
*   **Expected JSON**:
    ```json
    {
      "totalVotes": 1000,
      "quitPercentage": 0.15,
      "continuePercentage": 0.85,
      "byDemographics": {
        "age_18_25": { "quit": 10, "continue": 90 },
        "age_26_40": { "quit": 20, "continue": 80 },
        "sex_MALE": { "quit": 12, "continue": 88 },
        "sex_FEMALE": { "quit": 18, "continue": 82 }
      }
    }
    ```

## 6. Financial Reports

### 6.1 VIP Ratings & Dynamics
**Requirement**: Track VIP investment activity.

*   **URL**: `/reports/financial/vip-rating`
*   **Method**: `GET`
*   **Auth Required**: Yes (HOST, FRONTMAN)
*   **Expected JSON**:
    ```json
    [
      {
        "vipId": 55,
        "email": "vip@example.com",
        "totalContributed": 100000000,
        "depositCount": 5,
        "lastDepositAt": "2025-11-10T15:00:00Z"
      }
    ]
    ```

## 7. Staff Performance

### 7.1 Worker Efficiency
**Requirement**: Metrics on worker reporting speed and accuracy.

*   **URL**: `/reports/staff/efficiency`
*   **Method**: `GET`
*   **Auth Required**: Yes (HOST, FRONTMAN)
*   **Expected JSON**:
    ```json
    [
      {
        "workerId": 22,
        "email": "worker@example.com",
        "reportsSubmitted": 150,
        "avgConfirmationTimeSeconds": 45,
        "rejectedReports": 2
      }
    ]
    ```

### 7.2 Recruitment Statistics
**Requirement**: Track effectiveness of referral codes.

*   **URL**: `/reports/staff/recruitment`
*   **Method**: `GET`
*   **Auth Required**: Yes (HOST, FRONTMAN)
*   **Expected JSON**:
    ```json
    [
      {
        "salesmanId": 33,
        "email": "salesman@example.com",
        "refCode": "ABC1234",
        "playersRecruited": 50,
        "activePlayers": 10
      }
    ]
    ```

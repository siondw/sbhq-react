## Project Overview for the SBHQ App

### The Idea:

The app is a **live sports-prop quiz platform** where users register, join live "quiz lobbies" (structured as matches), and compete by answering real-time sports-related prop questions. The unique aspect of this app is the role of the **Game Master**, who dynamically controls the flow of questions and submissions during live events. The goal should be to be able to handle a lobby of 100-1000 users simultaneously, without crashes.

### How It Works:

1. **Live Quiz Lobbies**: Users register and join a live quiz lobby. Each lobby corresponds to a live sports event or match.
2. **Game Master Controls**: The Game Master poses prop-based questions to users in real-time. For example:
   - **Question**: "What will be the first play of the drive?"
   - **Options**: "Run" or "Pass"
3. **User Submissions**: Users select their answers within a time window controlled by the Game Master.
   - Submissions are locked when the Game Master closes the question.
4. **Waiting for Results**: Once users submit answers, everyone waits for the actual event (e.g., the first play of the drive) to occur in the live sports match.
5. **Game Master Validation**: After the event occurs, the Game Master submits the correct answer (e.g., "Run").
6. **Advancement/Elimination**: Based on their answers:
   - Users who answered correctly advance to the next question.
   - Users who answered incorrectly are eliminated.

This process repeats until only one winner remains or the event ends.

### Key Aspects:

- **Interactive and Dynamic**: The Game Master’s control ensures a highly engaging and flexible experience.
- **Sports-Prop Focus**: The questions revolve around live sports betting-style props, making it unique and appealing to sports fans.
- **Real-Time Engagement**: Users are actively involved in every stage, from answering questions to awaiting results tied to real-world events.

### Technology Stack:

1. **Frontend**:
   - **React**: For building a responsive, real-time user interface.
2. **Backend**:
   - **Supabase**: For handling real-time updates for lobbies, questions, submissions, and results.
   - **Supabase Authentication**: For secure user login and registration.
   - **Supabase Functions (Optional / Likely not needed)**: For server-side logic, such as result processing or analytics.
3. **Development Tools**:
   - **Version Control**: Using GitHub/Git for collaboration and tracking.

### User Flow

#### **1. Registration and Login**
- **Step 1.1**: User logs in using Firebase phone-based authentication.
- **Step 1.2**: After login:
  - If the user is registered for a contest where the **pregame lobby** is open, they are redirected directly to the lobby.
  - If the contest has started, they are directed to the active contest screen.
    - **Missed Questions**: If the user has missed any rounds, they are marked eliminated.
    - **Connection Drops**: If the user was still active, they can rejoin the contest at their current round.

#### **2. Pregame Lobby**
- **Step 2.1**: Users in the pregame lobby see:
  - A countdown to the contest start time.
  - The number of participants currently in the lobby.

#### **3. Answering Questions**
- **Step 3.1**: The Game Master posts a question in real-time.
  - Users are shown:
    - The question text.
    - Multiple-choice options.
- **Step 3.2**: Users select their answers and are redirected to the **Submitted Screen**.

#### **4. Results and Progression**
- **Step 4.1**: Once the Game Master submits the correct answer:
  - **Eliminated Users**: Redirected to the **Eliminated Screen**.
  - **Correct Users**: Redirected to the **Correct Screen**.
- **Step 4.2**: Users remain on the Correct Screen until the Game Master updates the game round and specifies a new question.

#### **5. Contest Completion**
- **Step 5.1**: The contest ends when:
  - Only one user remains (winner).
  - All rounds are completed.
- **Step 5.2**: Winner is shown on a **Winner Screen** (optional addition).

### Admin Dashboard

The **Admin Dashboard** is a critical feature that allows the Game Master to control the flow of the live quiz. It provides tools to manage contests, questions, and participants in real-time. Its important that there is some authentication for this screen, it can be somehting as simple as just a password Below is a breakdown of its functionalities:

#### **1. Contest Management**
- **Create Contests**:
  - Admin can create a new contest by providing:
    - Contest name.
    - Start time (timestamp).
    - Entry fee (if applicable).
- **View/Edit Active Contests**:
  - See all active contests and their current statuses (e.g., `lobbyOpen`, `submissionOpen`, `currentRound`).
  - Update contest details, such as closing the lobby or marking the contest as finished.

#### **2. Question Management**
- **Add Questions**:
  - Admin can add questions to a specific contest. Each question includes:
    - Question text.
    - Multiple-choice options.
    - The round number it belongs to.
- **Manage Questions**:
  - Admin can edit or delete questions before the contest begins.
  - During the contest, the Game Master selects and activates a question for users to answer.

#### **3. Real-Time Control**
- **Open/Close Submission Window**:
  - Admin can manually open and close the submission window for each round.
- **Submit Correct Answer**:
  - After the live event occurs, the admin inputs the correct answer for the active question.
- **Update Round**:
  - Once the results are processed, the admin advances the game to the next round by specifying the next question.

#### **4. Participant Management**
- **View Participants**:
  - Admin can view all participants registered for a contest and their statuses (e.g., active, eliminated).
- **Deactivate/Reactivate Participants**:
  - Optionally, the admin can manually mark a user as eliminated (e.g., for rule violations).

#### **5. Monitor Progress**
- **Live Round Overview**:
  - A summary screen displays:
    - Current question.
    - Number of users who have submitted answers.
    - Number of active participants remaining.
### Database Schema

#### Tables

1. **`users`**:
   - **Columns**:
     - `id` (UUID, primary key, linked to `auth.users.id` for authentication)
     - `username` (text)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)
     - `email` (text)
     - `role` (text, e.g., admin/user)

2. **`contests`**:
   - **Columns**:
     - `id` (UUID, primary key)
     - `name` (text)
     - `current_round` (integer)
     - `finished` (boolean)
     - `lobby_open` (boolean)
     - `submission_open` (boolean)
     - `start_time` (timestamptz)
     - `price` (numeric)
     - `created_at` (timestamp)
   - **Relationships**:
     - Links to `questions` and `participants`.

3. **`participants`**:
   - **Columns**:
     - `id` (UUID, primary key)
     - `contest_id` (UUID, foreign key, references `contests.id`)
     - `user_id` (UUID, foreign key, references `users.id`)
     - `active` (boolean)
     - `elimination_round` (integer)

4. **`questions`**:
   - **Columns**:
     - `id` (UUID, primary key)
     - `contest_id` (UUID, foreign key, references `contests.id`)
     - `round` (integer)
     - `question` (text)
     - `options` (JSONB)
     - `correct_option` (text)

5. **`answers`**:
   - **Columns**:
     - `id` (UUID, primary key)
     - `participant_id` (UUID, foreign key, references `participants.id`)
     - `round` (integer)
     - `answer` (text)
     - `timestamp` (timestamp)
     - `contest_id` (UUID, foreign key, references `contests.id`)
     - `question_id` (UUID, foreign key, references `questions.id`)

#### Relationships

1. **`users` ↔ `participants`**:
   - `participants.user_id` references `users.id`.

2. **`contests` ↔ `participants`**:
   - `participants.contest_id` references `contests.id`.

3. **`contests` ↔ `questions`**:
   - `questions.contest_id` references `contests.id`.

4. **`participants` ↔ `answers`**:
   - `answers.participant_id` references `participants.id`.

5. **`questions` ↔ `answers`**:
   - `answers.question_id` references `questions.id`.

6. **`contests` ↔ `answers`**:
   - `answers.contest_id` references `contests.id`.




# PathPilot

PathPilot is a student behavior analytics and decision tracking web app.

## Project Structure
- `public/`: Contains the frontend HTML, CSS, and JS files.
- `server.js`: The Express backend server that serves the frontend and handles API endpoints.
- `database.js`: Setup for the SQLite database.

## Prerequisites
- Node.js installed

## How to Run Step-by-Step

1. **Install dependencies:**
   Open a terminal in the project root directory and run:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the server:**
   Start the Node.js server by running:
   \`\`\`bash
   node server.js
   \`\`\`
   You should see a message saying `Connected to the SQLite database.` and `Server is running on http://localhost:3000`.

3. **Open the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

4. **Use PathPilot:**
   - Go through the onboarding process if testing for the first time.
   - Use the Dashboard to see analytics, which will start updating as you log your daily activities.
   - Click "+ Log Today" to add a new daily log that gets saved into the SQLite database.
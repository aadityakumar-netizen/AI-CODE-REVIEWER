# AI Code Review System

A full-stack web app where a user pastes source code and receives a structured,
AI-generated code review: overall score, bugs, security issues, performance
issues, style issues, best-practice suggestions, and a suggested improved
version of the code. Reviews are saved and can be revisited or deleted.
Includes JWT authentication (register/login).

## Tech stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Frontend:** React, Vite
- **AI:** Pluggable provider layer — local/free (Ollama) by default, swappable
  for a hosted API later without touching the rest of the app
- **Auth:** JWT + bcrypt-hashed passwords
- **Security:** Helmet, CORS restricted to a known origin, rate limiting
- **Testing:** Jest + Supertest (`npm test` in `server/`), plus a Postman
  collection for manual/exploratory testing

## Project status

All 16 planned phases complete: setup, Express, MongoDB, the Review model,
the REST API, Postman testing, the React frontend, frontend↔backend wiring,
the AI provider abstraction, AI-generated reviews, saving AI reviews,
UI wiring, authentication, security hardening, automated tests, and
production static serving.

## Project structure

```
ai-code-review-system/
├── client/                # React + Vite frontend
│   └── src/
│       ├── components/    # Layout, ReviewResult
│       ├── pages/         # ReviewPage, HistoryPage
│       └── services/      # api.js (fetch wrapper), reviewService.js
├── server/
│   ├── tests/             # Jest test suite
│   ├── postman/           # Postman collection
│   └── src/
│       ├── config/        # env loading, DB connection
│       ├── controllers/   # Request handlers
│       ├── middleware/    # Error handling, validation, auth, rate limiting
│       ├── models/        # Review, User
│       ├── routes/        # reviews, auth
│       ├── services/      # AI provider abstraction, prompt builder, review service
│       ├── utils/         # extractJson, validateAIOutput, token
│       ├── app.js         # Express app config
│       └── server.js      # Entry point
├── .env.example
├── .gitignore
└── README.md
```

## Local development

Two terminals, with MongoDB running (locally or Atlas) and, optionally,
Ollama running locally for real AI reviews:

```bash
# Terminal 1 — backend
cd server
npm install
cp ../.env.example .env   # fill in real values
npm run dev               # http://localhost:5000

# Terminal 2 — frontend
cd client
npm install
cp .env.example .env
npm run dev                # http://localhost:5173
```

## Continuous integration

GitHub Actions runs the backend Jest test suite, frontend linting, and the production frontend build on pushes and pull requests to `main`/`master`.

## Running tests

```bash
cd server
npm test
```

## Deployment

This is set up to deploy as a **single service**: the Express server serves
the built React app directly, so you only need to host one process.

```bash
# 1. Build the frontend
cd client
npm install
npm run build          # outputs to client/dist

# 2. Set production env vars for the server (see .env.example), plus:
#    NODE_ENV=production
#    CORS_ORIGIN doesn't matter in this mode (same-origin), but leave it set
#    MONGODB_URI pointing at your production database (e.g. MongoDB Atlas)
#    JWT_SECRET set to a real, long random value — never reuse the example

# 3. Start the server
cd ../server
npm install
npm start               # serves the API AND client/dist together
```

Any platform that can run a Node process (Render, Railway, a VPS, etc.) works
for this — there's nothing platform-specific in the code. Just make sure
`client/dist` exists (from step 1) before starting the server, and that your
`MONGODB_URI` and `JWT_SECRET` are set as real environment variables in that
platform's dashboard, not committed to the repo.

If you'd rather host the frontend and backend as two separate services
(e.g. frontend on a static host, backend on its own server), that also works
without code changes — just set `CORS_ORIGIN` on the backend to the deployed
frontend's real URL, and `VITE_API_BASE_URL` in the frontend's build-time env
to the deployed backend's real URL.

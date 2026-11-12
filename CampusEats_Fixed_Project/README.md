# CampusEats – repaired project

## Requirements
- Node.js LTS and npm
- MongoDB Community Server running locally, or a MongoDB Atlas URI

## Setup
1. Open this folder in VS Code.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Ensure MongoDB is running and set `MONGO_URI` in `.env`.
5. Change `JWT_SECRET` to a private random string of at least 24 characters.
6. Run `npm run seed` if you want the sample food menu.
7. Run `npm run dev` (or `npm start`).
8. Open http://localhost:3000.

## Test authentication
- Open Login / Register and choose Register.
- Enter your name, email and a password of at least 6 characters.
- After registration, the app signs you in automatically.
- Log out, then use the same email and password to log in.

Health check: http://localhost:3000/api/health

## Important
- The online payment option is demo-only and does not process real payments.
- Never commit `.env` or share your MongoDB credentials/JWT secret.
- Sample food/vendor information is demo data.

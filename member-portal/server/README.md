# Member API (local)

Start API: `node server/index.js` (from member-portal folder)
Env: create `server/.env` with `jwtSecret=...`
Test: GET http://localhost:5001/test
Auth: POST http://localhost:5002/auth/login with JSON `{ "email": "member@creditcoop.com", "password": "password123" }`
Verify: GET http://localhost:5001/auth/is-verify with header `Authorization: Bearer <token>`

Common issues
- Port busy: stop any other node process using 5001.
- DB: ensure PostgreSQL service is running and DB `slz_members` exists.
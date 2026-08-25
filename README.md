# Postify Studio – Full Stack SaaS Platform

Multi‑role (Admin / Client / Employee) digital agency platform with service requests, real‑time chat & notifications, task assignments, submissions workflow, analytics scaffolding, and extensible services catalog.

## 1. Features (Snapshot)
Backend:
- Auth (JWT access + refresh), RBAC, admin bootstrap scripts
- Service requests lifecycle + assignment & submission entities
- Real‑time: Socket.IO (chat, live notifications, service request pushes)
- Notifications: DB + (optional) email + real‑time events
- File uploads (local + optional Cloudinary) with size/type validation
- Email templates (Nodemailer) and pluggable provider support
- Security hardening (Helmet, rate limiting, CORS), centralized errors, logging

Frontend (React + Vite):
- Auth context with token persistence + profile refresh
- Dashboard layouts per role, protected routing
- Live service request & notification toasts (legacy + new event names supported)
- Dynamic projects (client service requests) list (no demo data)
- Reusable API layer with Axios + caching helper & graceful fallbacks
- Motion & UX: TailwindCSS, Framer Motion / react‑spring / GSAP, toast feedback

## 2. Monorepo Structure
```
root/
  README.md                  # (this file)
  package.json               # Workspace helper scripts (concurrently)
  start-servers.bat          # Windows convenience launcher
  backend/                   # Express + Mongoose API
  frontend/                  # React (Vite) SPA
```

Backend & frontend each have their own `package.json`. Root scripts proxy into subfolders.

## 3. Core Data Flow
1. Client submits Service Request -> stored (ServiceRequest) -> per‑admin Notification created -> Socket.IO emits `new-service-request` & `new-notification` to admin rooms.
2. Admin views & assigns work (Assignment) to Employee -> Employees submit (Submission) -> Notifications / optional emails.
3. Chat messages persisted (Message) + emitted to conversation & recipient personal rooms; recipient receives `new-message-notification`.

## 4. Real‑time Event Reference
Current canonical events (new naming):
- `new-service-request` – A service request was created (payload: minimal request meta)
- `new-notification` – A new admin notification entity
- `new-message-notification` – Summary of a newly received chat message
- `receive-message` – Full chat message inside conversation room
- `user-online` / `user-offline` – Presence signals
- Typing: `user-typing`, `user-stopped-typing`

Legacy events still listened for in frontend (backwards compatibility): `newServiceRequest`, `adminNotification`.

## 5. Key REST Endpoints (Additions Highlighted)
Base prefix: `/api`

Clients (`/api/client`): now includes:
- `POST /service-requests` – Create request
- `GET /service-requests` – List
- `GET /projects` – (NEW) Compact project/service request list used by Projects page

See `backend/README.md` for the exhaustive list across Admin / Employee / Services / Upload / Messages / Auth.

## 6. Environment Variables
Backend (required unless marked optional):
```
NODE_ENV=development
PORT=5000                     # (Render auto-assigns in production)
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-refresh
JWT_EXPIRE=7d                 # optional override
JWT_REFRESH_EXPIRE=30d        # optional override
FRONTEND_URL=http://localhost:5173  # or deployed frontend origin
ADMIN_EMAIL=admin@postifystudio.com # for bootstrap scripts / emails
ADMIN_PASSWORD=strongpass123       # used by setup/reset scripts

# Optional / Feature Flags
OPENAI_API_KEY=your-openai-key         # Enables AI routes
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=app-password
EMAIL_FROM=noreply@postifystudio.com
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760               # bytes, default 10MB
API_KEY=optional-internal-api-key    # if using API key guard paths
BASE_URL=https://your-backend-host   # used for absolute file links
```

Frontend:
```
VITE_API_URL=http://localhost:5000/api   # In production: https://your-backend.onrender.com/api
```

## 7. Local Development
Install all:
```
npm run install:all
```
Start both (concurrently):
```
npm run dev
```
Individually:
```
npm run dev:backend
npm run dev:frontend
```
Default ports: Backend 5000, Vite 5173. Ensure `FRONTEND_URL` matches actual dev origin for CORS & sockets.

### Admin Bootstrap
Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in backend `.env` then run (from backend folder):
```
node scripts/setupAdmin.js
```

## 8. Deployment (Render)
Recommended: TWO services (Static Frontend + Web Service Backend) using the monorepo subdirectory feature.

### 8.1 Backend (Web Service)
1. New Render Web Service -> Select repo -> set Root Directory to `backend`.
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables: copy from section 6 (exclude PORT). Set `NODE_ENV=production` and `FRONTEND_URL` to the final frontend URL (e.g. `https://postify-frontend.onrender.com`).
5. Add any optional keys (Cloudinary, email). Save & deploy.

### 8.2 Frontend (Static Site)
1. New Static Site -> Root Directory: `frontend`.
2. Build Command: `npm install && npm run build`
3. Publish Directory: `dist`
4. Environment Variable: `VITE_API_URL=https://<your-backend-service>.onrender.com/api`
5. First deploy; note the generated frontend domain.
6. Go BACK to backend service settings and (if not already) update `FRONTEND_URL` to this exact origin, then redeploy backend for CORS & Socket.IO allow‑list.

### 8.3 CORS / Sockets Notes
`server.js` uses `FRONTEND_URL` plus explicit local dev ports; in production only the provided `FRONTEND_URL` will matter. Ensure it matches protocol + host (no trailing slash). Socket client removes `/api` automatically: keep `VITE_API_URL` with `/api` suffix; the socket code strips it.

### 8.4 Single Service Alternative (Optional)
You can build the frontend inside the monorepo and serve it from Express (already supported when `NODE_ENV=production`). Steps: deploy only backend (Root Directory `.` or `backend` + adjust build hook). Add a prestart script to build frontend then copy `frontend/dist` relative to backend. (Two‑service approach yields better caching & build times.)

## 9. Production Checklist
- [ ] Strong JWT secrets & no default admin password
- [ ] `FRONTEND_URL` set & matches deployed domain
- [ ] DB user with least privileges (if Atlas) & IP allowlist
- [ ] Optional email credentials (or disable email features)
- [ ] Cloudinary keys only if remote media desired
- [ ] Log retention / monitoring configured (Render logs)
- [ ] Rate limits tuned if public exposure increases

## 10. Updating Real‑time Event Names
Frontend currently listens to both legacy and new kebab‑case names. Once all emits use the new forms (`new-service-request`, `new-notification`), you can safely remove legacy listeners from components to reduce noise.

## 11. Common Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 401 on sockets | Wrong / expired JWT | Re-login; ensure token passed into `socketManager.connect(token)` |
| CORS error | FRONTEND_URL mismatch | Update backend env & redeploy |
| Service requests not appearing | Socket event name mismatch or API auth issue | Check emits in backend controller & network tab for `/client/service-requests` |
| Notifications not created | Missing recipient / model fields | Confirm Notification.create with `recipient`, `recipientModel` |
| Frontend uses demo data | Outdated build | Re-build frontend after backend route `/api/client/projects` exists |

## 12. Scripts Reference (Root)
```
npm run install:all    # Install backend + frontend
npm run dev            # Concurrent dev
npm run build          # Frontend build only
npm start              # Backend start (production style)
```

## 13. License
MIT

---
Contributions & refinements welcome – focus next on test coverage, rate limit tuning, and removing legacy event listeners after full migration.

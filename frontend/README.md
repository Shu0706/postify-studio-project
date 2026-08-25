# Postify Studio Frontend (React + Vite)

Role‑aware single page application for the Postify Studio platform.

## Tech Stack
- React 19 + Vite
- Routing: `react-router-dom`
- State: Context (Auth / Theme) + local storage tokens
- Styling: TailwindCSS + custom global styles
- Animations: Framer Motion, react-spring, GSAP, AOS
- Real‑time: `socket.io-client`
- HTTP: Axios wrapper (`src/services/api.js`) + caching utility
- UI Feedback: react-toastify

## Environment
Create `frontend/.env` (or use Render Static Site Var):
```
VITE_API_URL=http://localhost:5000/api
```
In production set to your backend URL with `/api` suffix, e.g. `https://postify-backend.onrender.com/api`.

The socket manager strips `/api` automatically to connect to the root origin.

## Scripts
```
npm run dev        # Start Vite dev server (default :5173)
npm run build      # Production build (outputs dist/)
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

## Key Paths
```
src/
	context/        # AuthContext, ThemeContext
	routes/         # Route protection + AppRouter
	services/       # API abstractions (auth, services, admin, messaging)
	components/     # Shared + role specific UI
	pages/          # Route-level screens
	utils/          # socketManager, helpers, logging, animations
```

## Real‑time Events Consumed
- `new-service-request` (and legacy `newServiceRequest`)
- `new-notification` (and legacy `adminNotification`)
- `new-message-notification`
- Conversation events: `receive-message`, typing indicators

## Adding a New API Service Wrapper
1. Create file in `src/services/` (follow pattern of existing service files).
2. Import Axios instance from `api.js` for consistent headers & error handling.
3. Export functions returning `response.data` only.

## Deployment (Static Hosting / Render)
The build artifact (`dist/`) is framework-agnostic. For Render:
1. Static Site -> Root Directory `frontend`.
2. Build Command: `npm install && npm run build`.
3. Publish Directory: `dist`.
4. Env Var: `VITE_API_URL=https://<backend>.onrender.com/api`.
5. After first deploy, set backend `FRONTEND_URL` to the resulting frontend URL & redeploy backend for CORS and Socket.IO.

## Troubleshooting
| Issue | Fix |
|-------|-----|
| 401 profile fetch | Token expired – re-login |
| Socket auth error | Ensure `VITE_API_URL` correct & JWT passed to `socketManager.connect` |
| CORS blocked | Backend `FRONTEND_URL` mismatch |
| Projects page empty | Backend `/api/client/projects` route deployed? Auth header valid? |

## Next Improvements
- Remove legacy event listeners post migration
- Add Suspense fallbacks / skeleton loaders
- Add automated tests (React Testing Library / Vitest)

---
MIT License

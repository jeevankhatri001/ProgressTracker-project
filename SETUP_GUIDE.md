# Gym Progress Tracker - Setup & Deployment Guide

## Backend Setup (FastAPI)

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
```bash
cd "c:\Jeevan\Project\Progress Tracking\backend"
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the development server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

---

## Frontend Setup (React + Material-UI)

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd "c:\Jeevan\Project\Progress Tracking\frontend"
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (optional, if using non-standard API URL):
```env
VITE_API_URL=http://localhost:8000/api
```

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or similar)

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## Full-Stack Workflow

### Start Both Services

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Open in Browser
Navigate to `http://localhost:5173` (or the URL shown by Vite)

---

## Project Structure

```
Progress Tracking/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── requirements.txt        # Python dependencies
│   ├── models/                 # (reused from CLI)
│   ├── storage/                # (reused from CLI)
│   └── app/
│       ├── api/
│       │   ├── routes/         # API endpoints
│       │   └── schemas.py      # Pydantic models
│       └── config.py
│
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   ├── pages/              # Page components
    │   ├── services/           # API client
    │   ├── hooks/              # Custom React hooks
    │   ├── types/              # TypeScript types
    │   ├── App.tsx             # Main app component
    │   └── theme.ts            # Material-UI theme
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## API Endpoints

### User Profile
- `POST /api/user` - Create user
- `GET /api/user` - Get current user
- `DELETE /api/user` - Delete user

### Workout Plan
- `POST /api/plan` - Create plan
- `GET /api/plan` - Get current plan
- `DELETE /api/plan` - Delete plan

### Workout Sessions
- `POST /api/sessions` - Log session
- `GET /api/sessions` - List sessions (with filters)
- `DELETE /api/sessions/{date}` - Delete session

### Analytics
- `GET /api/analytics/personal-records` - Personal records
- `GET /api/analytics/progression?exercise=...` - Exercise progression
- `GET /api/analytics/muscle-groups` - Muscle group stats
- `GET /api/analytics/exercise-frequency` - Exercise counts
- `GET /api/analytics/volume-summary` - Volume stats
- `GET /api/analytics/strength-progress` - Strength improvements

### Export
- `GET /api/export/sessions/csv` - Export sessions to CSV
- `GET /api/export/user-profile/csv` - Export user profile CSV
- `GET /api/export/plan/csv` - Export plan CSV
- `GET /api/export/progress-report` - Export progress report

---

## Environment Variables

### Backend
- No environment variables required for local development
- Default: `localhost:8000`

### Frontend
Optional `.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Run on different port
uvicorn main:app --host 0.0.0.0 --port 8001
```

**Module not found errors:**
Ensure you're in the correct directory and Python path includes the project root.

### Frontend Issues

**Port 5173 already in use:**
Vite will automatically try port 5174, 5175, etc.

**CORS errors:**
Ensure backend is running and URL matches in `.env.local`

**API calls failing:**
1. Check backend is running (`http://localhost:8000/health`)
2. Verify CORS is enabled in `backend/main.py`
3. Check browser console for detailed errors

---

## Development Notes

### Real-Time Reload
- **Backend**: Files change → Uvicorn auto-reloads
- **Frontend**: Files change → Vite hot-module replacement

### Testing the API
Use Swagger UI at `http://localhost:8000/docs` to test endpoints interactively

### Building for Production
```bash
cd frontend
npm run build
cd ../backend
pip install gunicorn
gunicorn main:app
```

---

## Features Included

✅ User profile management  
✅ Workout plan creation  
✅ Session logging with exercises/sets  
✅ Personal records tracking  
✅ Muscle group analytics  
✅ Volume and strength metrics  
✅ Session history with filtering  
✅ Data export (CSV, reports)  
✅ Professional Material-UI design  
✅ Fully typed TypeScript codebase  
✅ Responsive design  

---

## Next Steps

1. Install dependencies for both backend and frontend
2. Start both development servers
3. Open `http://localhost:5173` in your browser
4. Create a user profile to get started
5. Build your workout plan
6. Start logging workouts
7. View analytics and track progress

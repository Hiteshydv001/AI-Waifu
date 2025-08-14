# Deployment Guide

## Frontend Deployment on Vercel

### Prerequisites
- GitHub account
- Vercel account connected to GitHub

### Steps:
1. **Push code to GitHub**:
   ```bash
   cd Frontend/
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set root directory to: `WaifuCore/Frontend`
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

3. **Environment Variables in Vercel**:
   - Add environment variable: `VITE_API_BASE_URL` = `https://your-railway-app.railway.app`

## Backend Deployment on Railway

### Prerequisites
- GitHub account
- Railway account connected to GitHub

### Steps:
1. **Push code to GitHub** (if not done already):
   ```bash
   cd WaifuCore/
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Set root directory to: `WaifuCore/`
   - Railway will automatically detect the Python app

3. **Environment Variables in Railway**:
   - `PORT`: Railway will set this automatically
   - Add any API keys you need:
     - `GOOGLE_API_KEY`: Your Gemini API key
     - `GROQ_API_KEY`: Your Groq API key
     - `ELEVENLABS_API_KEY`: Your ElevenLabs API key (if using)

4. **Domain Configuration**:
   - Railway will provide a domain like: `https://your-app-name.railway.app`
   - Copy this URL and use it in Vercel's `VITE_API_BASE_URL`

## Files Created/Modified for Deployment:

### Frontend:
- `vercel.json`: Vercel configuration
- `.env.production`: Production environment variables

### Backend:
- `railway.json`: Railway configuration
- `nixpacks.toml`: Build configuration for Railway
- `Procfile`: Process file for Railway
- `requirements-railway.txt`: Lightweight requirements for Railway
- `main_api.py`: Updated to use PORT environment variable and added health checks

## Post-Deployment:
1. Update the `VITE_API_BASE_URL` in Vercel with your Railway backend URL
2. Test both deployments
3. Check logs in both platforms for any issues

## Optional: Custom Domain
- Add custom domain in Vercel for frontend
- Add custom domain in Railway for backend

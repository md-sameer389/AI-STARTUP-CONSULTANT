# Deployment Checklist

## Render Setup
- [ ] PostgreSQL database created on Render
- [ ] Redis created on Render  
- [ ] Web service created with correct start command
- [ ] Background worker created
- [ ] All environment variables set on both services

## Vercel Setup
- [ ] Project imported from GitHub
- [ ] Root directory set to frontend
- [ ] NEXT_PUBLIC_API_URL set to Render backend URL

## Post Deploy Verification
- [ ] https://your-backend.onrender.com/health returns ok
- [ ] https://your-frontend.vercel.app loads home page
- [ ] Register new account works
- [ ] Login works
- [ ] Start analysis works
- [ ] All 7 agents complete
- [ ] PDF report accessible via Cloudinary URL

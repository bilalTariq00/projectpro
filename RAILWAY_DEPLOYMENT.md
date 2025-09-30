# Railway Deployment Guide

## Environment Variables to Set in Railway

Copy these environment variables to your Railway project:

```
DATABASE_URL=mysql://root:dBNPUXyPCjLweRqziukZKQMAOjXFEtzx@mainline.proxy.rlwy.net:19492/railway
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
APP_URL=https://projectpro-production.up.railway.app
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=rana.talha3d@gmail.com
MAIL_PASS=qbsv rbno hfsu skas
MAIL_FROM=ProjectPro <no-reply@example.com>
APP_PUBLIC_URL=https://projectpro-production.up.railway.app
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
```

## Steps to Deploy:

1. Go to Railway dashboard
2. Create new project or use existing
3. Connect your GitHub repository
4. Set all environment variables above
5. Railway will auto-deploy when you push to main branch

## After Deployment:

1. Your app will be available at: `https://projectpro-production.up.railway.app`
2. Test the health endpoint: `https://projectpro-production.up.railway.app/api/health`
3. Your APK will work globally with this URL

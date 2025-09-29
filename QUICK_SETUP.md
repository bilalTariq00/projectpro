# Quick Setup Guide for Your Friend

## The Problem
Your friend is getting a `ECONNREFUSED` error because the app is trying to connect to MySQL, but MySQL isn't running on their Windows machine.

## Easiest Solutions

### Option 1: Use Railway (Recommended - No MySQL installation needed)

1. **Create a free Railway account** at https://railway.app
2. **Create a new MySQL database:**
   - Click "New Project" → "Database" → "MySQL"
   - Wait for it to deploy (takes 1-2 minutes)
   - Copy the connection string (looks like: `mysql://root:password@containers-us-west-xxx.railway.app:xxxx/railway`)

3. **Update the `.env` file** in the project with the Railway database URL:
   ```
   DATABASE_URL=mysql://root:your_password@containers-us-west-xxx.railway.app:xxxx/railway
   ```

4. **Install dependencies:**
   ```bash
   npm install
   npm rebuild bcrypt better-sqlite3
   ```

5. **Run the app:**
   ```bash
   npm run dev
   ```

### Option 2: Install MySQL on Windows

1. **Download MySQL:** https://dev.mysql.com/downloads/installer/
2. **Install with default settings**
3. **Create database:**
   ```sql
   CREATE DATABASE projectpro;
   ```
4. **Update `.env` file:**
   ```
   DATABASE_URL=mysql://root:your_mysql_password@localhost:3306/projectpro
   ```

## Important Notes

- **Delete the `node_modules` folder** before running `npm install`
- **Always run `npm rebuild bcrypt better-sqlite3`** after installing dependencies
- **Make sure to create a `.env` file** in the project root with the database configuration

## Environment File Template

Create a `.env` file in the project root with this content:

```
DATABASE_URL=mysql://root:password@localhost:3306/projectpro
PORT=3000
HOST=localhost
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
APP_URL=http://localhost:3000
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=rana.talha3d@gmail.com
MAIL_PASS=qbsv rbno hfsu skas
MAIL_FROM="ProjectPro <no-reply@example.com>"
APP_PUBLIC_URL=http://localhost:3000
```

Just replace the `DATABASE_URL` with your actual database connection string!

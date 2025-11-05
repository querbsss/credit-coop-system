# Credit Cooperative System - Render Deployment Guide

## 🚀 Deploy to Render

This guide will help you deploy your Credit Cooperative System to Render.com using the included `render.yaml` configuration.

### Prerequisites
- GitHub account with your project repository
- Render account (free tier available)
- Your project code pushed to GitHub

### 📋 Services Overview

Your application will be deployed as multiple services:
1. **PostgreSQL Database** - Managed database service
2. **Backend API** - Core API service
3. **Landing Page** - Public website with server
4. **Member Portal Backend** - Member-specific API
5. **Member Portal Frontend** - Member dashboard
6. **Staff Portal Backend** - Staff management API  
7. **Staff Portal Frontend** - Staff interface

### 🔧 Step-by-Step Deployment

#### Step 1: Prepare Your Repository
1. Ensure all your code is committed and pushed to GitHub
2. The `render.yaml` file should be in your repository root
3. Verify your `.gitignore` excludes unnecessary files

#### Step 2: Connect to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub account if not already connected
4. Select your `credit-coop-system` repository
5. Render will automatically detect the `render.yaml` file

#### Step 3: Configure Environment Variables
The `render.yaml` includes most environment variables, but you may need to set some manually:

**For JWT_SECRET (Member & Staff backends):**
- In the Render dashboard, go to each backend service
- Add environment variable: `JWT_SECRET` with a secure random string
- You can generate one at: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

**Database Connection:**
- The `DATABASE_URL` is automatically set when you create the PostgreSQL service
- No manual configuration needed

#### Step 4: Deploy Database First
1. Render will create the PostgreSQL database first
2. Wait for it to be fully deployed before other services start
3. Note the database connection details

#### Step 5: Run Database Migrations
Once your services are deployed, you'll need to set up your database schema:

1. Go to your database service in Render dashboard
2. Use the "Connect" button to get connection details
3. Run your SQL migration files from the `migrations/` folder
4. You can use a database client or the Render shell to execute:

```bash
# Connect to your database and run migrations
psql "postgresql://your-database-url"

# Then run your migration files
\i path/to/your/migration.sql
```

#### Step 6: Update Frontend API URLs
After deployment, update the frontend environment variables with actual URLs:

1. **Member Portal Frontend**:
   - Set `REACT_APP_API_URL` to your member backend URL
   - Example: `https://credit-coop-member-backend.onrender.com`

2. **Staff Portal Frontend**:
   - Set `REACT_APP_API_URL` to your staff backend URL  
   - Example: `https://credit-coop-staff-backend.onrender.com`

### 🔍 Monitoring Deployment

#### Check Service Status
1. Monitor each service in the Render dashboard
2. Check logs for any deployment errors
3. Verify all services are "Live" status

#### Test Endpoints
Once deployed, test these endpoints:

- **Backend API**: `https://your-backend.onrender.com/health`
- **Landing Page**: `https://your-landing.onrender.com`
- **Member Portal**: `https://your-member-portal.onrender.com`
- **Staff Portal**: `https://your-staff-portal.onrender.com`

### 🛠️ Troubleshooting

#### Common Issues:

1. **Build Failures**
   - Check logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

2. **Database Connection Issues**
   - Verify DATABASE_URL is set correctly
   - Check if database service is fully deployed
   - Ensure database migrations have been run

3. **CORS Errors**
   - Update CORS origins in your backend services
   - Include your actual Render URLs in allowed origins

4. **Frontend Can't Connect to Backend**
   - Verify REACT_APP_API_URL is set correctly
   - Ensure backend services are deployed and accessible
   - Check network tab in browser for API call errors

### 📁 File Structure After Deployment

```
Your Render Services:
├── credit-coop-database (PostgreSQL)
├── credit-coop-backend (Node.js API)
├── credit-coop-landing (React + Express)
├── credit-coop-member-backend (Express API)
├── credit-coop-member-portal (React SPA)
├── credit-coop-staff-backend (Express API)
└── credit-coop-staff-portal (React SPA)
```

### 🔐 Security Considerations

1. **Environment Variables**: All sensitive data should be in environment variables
2. **JWT Secrets**: Use strong, unique secrets for each service
3. **Database**: Enable SSL connections in production
4. **CORS**: Restrict origins to your actual domains
5. **File Uploads**: Configure proper file size limits and validation

### 💰 Cost Considerations

**Free Tier Limits:**
- Free tier includes 750 hours/month across all services
- With 7 services, you'll use ~5,040 hours/month
- Consider upgrading to paid tier or optimizing service architecture

**Optimization Options:**
1. Combine frontend and backend services where possible
2. Use static site deployment for pure React apps
3. Consider serverless functions for lighter backends

### 🔄 Continuous Deployment

Render automatically redeploys when you push to your connected GitHub branch:
1. Push changes to your repository
2. Render detects changes and rebuilds affected services
3. Zero-downtime deployment for web services

### 📞 Support

If you encounter issues:
1. Check Render documentation: [render.com/docs](https://render.com/docs)
2. Review service logs in the Render dashboard
3. Check GitHub Issues for common problems
4. Contact Render support if needed

### ✅ Post-Deployment Checklist

- [ ] All services show "Live" status
- [ ] Database is accessible and migrated
- [ ] Frontend applications load correctly
- [ ] API endpoints respond properly
- [ ] User authentication works
- [ ] File uploads function (if applicable)
- [ ] Email notifications work (if configured)
- [ ] Monitor service performance and logs

Your Credit Cooperative System is now deployed and ready to serve your users! 🎉
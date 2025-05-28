# ZenLink Deployment Guide

## Vercel Deployment Setup

This guide will help you deploy ZenLink to Vercel with separate environments for production and development.

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: You'll need separate PostgreSQL databases for production and development

### Step 1: Database Setup

#### Option A: Using Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new database for production: `zenlink-production`
3. Create a new database for development: `zenlink-development`
4. Copy the connection strings for each

#### Option B: External Database Provider
Use services like:
- **Supabase**: Free tier with PostgreSQL
- **PlanetScale**: MySQL-compatible
- **Railway**: PostgreSQL hosting
- **Neon**: Serverless PostgreSQL

### Step 2: Vercel Project Setup

1. **Import Repository**:
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Domains**:
   - **Production**: `zenlink.no` (main branch)
   - **Development**: `dev.zenlink.no` (dev branch)

3. **Environment Variables**:
   Set these in your Vercel project settings:

   **For Production (main branch)**:
   ```
   DATABASE_URL=postgresql://your-production-db-url
   JWT_SECRET=your-production-jwt-secret
   MAILTRAP_USER=your-production-mailtrap-user
   MAILTRAP_PASS=your-production-mailtrap-password
   NODE_ENV=production
   ```

   **For Preview/Development (dev branch)**:
   ```
   DATABASE_URL=postgresql://your-development-db-url
   JWT_SECRET=your-development-jwt-secret
   MAILTRAP_USER=your-development-mailtrap-user
   MAILTRAP_PASS=your-development-mailtrap-password
   NODE_ENV=development
   ```

### Step 3: Branch Configuration

1. **Main Branch** (`main` or `master`):
   - Deploys to `zenlink.no`
   - Uses production environment variables
   - Automatic deployments on push

2. **Development Branch** (`dev`):
   - Deploys to `dev.zenlink.no`
   - Uses development environment variables
   - Automatic deployments on push

### Step 4: Database Migration

Before first deployment, run migrations:

```bash
# For production database
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# For development database
DATABASE_URL="your-development-db-url" npx prisma migrate deploy
```

Or use Vercel's build process (already configured in package.json).

### Step 5: Domain Configuration

1. **Custom Domains**:
   - Go to your Vercel project settings
   - Add custom domain: `zenlink.no` for production
   - Add custom domain: `dev.zenlink.no` for development

2. **DNS Configuration**:
   - Point `zenlink.no` to Vercel's servers
   - Point `dev.zenlink.no` to Vercel's servers
   - Vercel will provide the necessary DNS records

### Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `MAILTRAP_USER` | Mailtrap username for emails | Yes |
| `MAILTRAP_PASS` | Mailtrap password for emails | Yes |
| `NODE_ENV` | Environment mode | Auto-set |

### Build Configuration

The project is configured with:
- **Build Command**: `npm run vercel-build`
- **Install Command**: `npm install`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x (latest)

### Troubleshooting

1. **Build Failures**:
   - Check environment variables are set correctly
   - Ensure database is accessible from Vercel
   - Verify all dependencies are in package.json

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check database allows external connections
   - Ensure SSL is configured if required

3. **Migration Issues**:
   - Run `prisma migrate reset` on development
   - For production, use `prisma migrate deploy`
   - Check Prisma version compatibility

### Security Notes

- Never commit `.env` files to version control
- Use different JWT secrets for each environment
- Regularly rotate API keys and secrets
- Enable database SSL in production
- Use Vercel's environment variable encryption

### Monitoring

- **Vercel Analytics**: Monitor performance and usage
- **Vercel Logs**: Debug deployment and runtime issues
- **Database Monitoring**: Track query performance
- **Error Tracking**: Consider adding Sentry or similar

## Quick Commands

```bash
# Deploy to production
git push origin main

# Deploy to development
git push origin dev

# Check deployment status
vercel --prod  # for production
vercel         # for preview

# View logs
vercel logs --prod  # production logs
vercel logs         # preview logs
```

# Deployment Guide - ConsignPro

This guide provides detailed instructions for deploying the ConsignPro logistics platform to various hosting providers.

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database schema finalized
- [ ] Production database created
- [ ] Email service configured
- [ ] SSL certificates ready (if self-hosting)
- [ ] Domain name configured
- [ ] Backup strategy in place

## 🚀 Deployment Options

## Option 1: Vercel (Recommended for Quick Setup)

### 1. Prerequisites
- GitHub account
- Vercel account (free tier available)
- PostgreSQL database (Railway, Supabase, or Neon)

### 2. Database Setup

#### Using Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add postgresql

# Get connection string
railway variables
```

#### Using Neon
1. Visit https://neon.tech
2. Create new project
3. Copy connection string

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add EMAIL_SERVER
vercel env add EMAIL_FROM
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

### 4. Post-Deployment

```bash
# Run migrations
DATABASE_URL="your-production-db-url" npx prisma migrate deploy

# Seed database (optional)
DATABASE_URL="your-production-db-url" npx prisma db seed
```

---

## Option 2: Docker + Any VPS (DigitalOcean, AWS, etc.)

### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/consignment
      - NEXTAUTH_URL=https://yourdomain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - EMAIL_SERVER=${EMAIL_SERVER}
      - EMAIL_FROM=${EMAIL_FROM}
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=consignment
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

### 3. Deploy

```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

---

## Option 3: AWS (EC2 + RDS)

### 1. Create RDS PostgreSQL Instance
1. Go to AWS RDS Console
2. Create PostgreSQL database
3. Note connection details

### 2. Launch EC2 Instance
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL client
sudo apt-get install -y postgresql-client

# Install PM2
sudo npm install -g pm2
```

### 3. Deploy Application
```bash
# Clone repository
git clone your-repo-url
cd consignment

# Install dependencies
npm install

# Set environment variables
cat > .env << EOL
DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/consignment"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret"
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@yourdomain.com"
EOL

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start npm --name "consignment" -- start
pm2 save
pm2 startup
```

### 4. Set up Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Option 4: Heroku

### 1. Prerequisites
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login
```

### 2. Create Application
```bash
# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Get database URL
heroku config:get DATABASE_URL
```

### 3. Configure Environment
```bash
heroku config:set NEXTAUTH_SECRET="your-secret"
heroku config:set NEXTAUTH_URL="https://your-app-name.herokuapp.com"
heroku config:set EMAIL_SERVER="smtp://..."
heroku config:set EMAIL_FROM="noreply@yourdomain.com"
```

### 4. Deploy
```bash
# Add buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy

# Seed database (optional)
heroku run npx prisma db seed
```

---

## 🔐 Security Checklist

- [ ] Use strong `NEXTAUTH_SECRET` (min 32 characters)
- [ ] Enable SSL/HTTPS
- [ ] Set secure CORS policies
- [ ] Use environment variables (never commit secrets)
- [ ] Enable database connection SSL
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Implement rate limiting
- [ ] Enable database backups
- [ ] Monitor error logs

## 📧 Email Configuration

### Gmail (Development)
```env
EMAIL_SERVER="smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587"
EMAIL_FROM="your-email@gmail.com"
```

### SendGrid (Production)
```env
EMAIL_SERVER="smtp://apikey:your-sendgrid-api-key@smtp.sendgrid.net:587"
EMAIL_FROM="noreply@yourdomain.com"
```

### AWS SES
```env
EMAIL_SERVER="smtp://your-aws-username:your-aws-password@email-smtp.region.amazonaws.com:587"
EMAIL_FROM="noreply@yourdomain.com"
```

## 📊 Monitoring

### Recommended Tools
- **Vercel Analytics** - Built-in for Vercel deployments
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Infrastructure monitoring
- **Uptime Robot** - Uptime monitoring

### Setup Sentry
```bash
npm install @sentry/nextjs

# Configure
npx @sentry/wizard -i nextjs
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma
        run: npx prisma generate

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 🗄️ Database Backup

### Automated Backups (PostgreSQL)

```bash
# Create backup script
cat > backup.sh << 'EOL'
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="your-database-url"

pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$TIMESTAMP.sql
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
EOL

chmod +x backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## 🔍 Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check connection
psql "your-database-url"

# Verify SSL requirement
DATABASE_URL="postgresql://...?sslmode=require"
```

**2. Prisma Migration Failed**
```bash
# Reset and redeploy
npx prisma migrate reset
npx prisma migrate deploy
```

**3. Build Errors**
```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

**4. Email Not Sending**
```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check credentials
```

## 📈 Performance Optimization

### Enable Caching
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### Database Optimization
```prisma
// Add indexes for frequently queried fields
model Shipment {
  @@index([trackingNumber])
  @@index([status])
  @@index([senderId])
}
```

## 🎯 Post-Deployment

1. **Test all features**
   - Registration/Login
   - Package creation
   - Tracking
   - Admin functions

2. **Set up monitoring**
   - Error tracking
   - Uptime monitoring
   - Performance metrics

3. **Create documentation**
   - User guides
   - Admin manual
   - API documentation

4. **Configure backups**
   - Database backups
   - File backups
   - Backup testing

5. **Security audit**
   - SSL verification
   - Environment variables
   - Access controls

## 📞 Support

For deployment issues:
- Check logs: `vercel logs` or `docker-compose logs`
- Review environment variables
- Verify database connection
- Check Prisma migrations
- Consult platform-specific docs

---

**Happy Deploying! 🚀**

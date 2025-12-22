# Ketogenic Therapy Diet Recipes App

A modern web application for managing ketogenic therapy diet recipes with automatic macro calculations and keto ratio tracking.

## Features

- **Food Items Management**: Add and manage food items with their nutritional values (protein, fat, carbs per 100g)
- **CSV Bulk Upload**: Import multiple food items at once via CSV file
- **Recipe Creation**: Create recipes with multiple ingredients and cooking instructions
- **Automatic Calculations**:
  - Total macros (protein, fat, carbs)
  - Total calories and calories per serving
  - Keto ratio (fat to protein+carbs ratio)
- **Target Ratio Setting**: Set your target keto ratio (e.g., 3:1, 4:1)
- **Visual Feedback**: Color-coded keto ratios based on how close they are to your target

## Prerequisites

- **Node.js >= 20.9.0** (required for Next.js 16)
- **Docker** and **Docker Compose** (for running the application)

## Quick Start

### Option 1: Docker (Recommended for Production)

Run both the database and web application in Docker containers:

1. **Configure environment variables**:
   ```bash
   cp .env.docker .env.docker.local
   # Edit .env.docker.local and set a strong NEXTAUTH_SECRET
   ```

2. **Start all services**:
   ```bash
   docker-compose --env-file .env.docker.local up -d
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

The first startup will automatically:
- Build the Docker image
- Start PostgreSQL database
- Run database migrations
- Start the web application

### Option 2: Local Development

Run the application locally with only the database in Docker:

1. **Update Node.js** (if needed):
   ```bash
   # Using nvm (recommended)
   nvm install 20
   nvm use 20

   # Or download from https://nodejs.org/
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the PostgreSQL database**:
   ```bash
   docker-compose up -d postgres
   ```

4. **Initialize the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Adding Food Items

#### Single Item
1. Go to the **Food Items** tab
2. Click **"+ Add Food Item"**
3. Enter:
   - Food name (e.g., "Full cream milk")
   - Protein in grams per 100g (e.g., 3.5)
   - Fat in grams per 100g (e.g., 3.4)
   - Carbs in grams per 100g (e.g., 6.3)
4. Click **"Add Food Item"**

#### Bulk Upload via CSV
1. Go to the **Food Items** tab
2. Click **"Upload CSV"**
3. Select a CSV file with the following format:
   ```csv
   Item,Pro,Fat,Carb
   "Milk full fat",3.5,3.4,6.3
   "Eggs whole",13,11,1.1
   "Butter",0.9,81,0.1
   ```
4. The app will import all valid items and show a summary

**CSV Format Rules:**
- First row: Header row with columns `Item,Pro,Fat,Carb`
- Item names should be in double quotes
- Pro, Fat, Carb are numeric values (grams per 100g)
- A sample CSV file is included: `sample-food-items.csv`

### Creating Recipes

1. Go to the **Recipes** tab
2. Click **"+ Add Recipe"**
3. Enter:
   - Recipe name
   - Number of servings
   - Add ingredients (select food item and specify grams)
   - Cooking instructions
4. Click **"Add Recipe"**

The app will automatically calculate:
- Total protein, fat, and carbs
- Total calories
- Calories per serving
- Keto ratio (fat / (protein + carbs))

### Setting Target Ratio

1. Go to the **Settings** tab
2. Set your target keto ratio (e.g., 3.0 for a 3:1 ratio)
3. Click **"Save Settings"**

Common therapeutic ratios:
- **4:1** - Classic therapeutic ketogenic diet (strictest)
- **3:1** - Modified ketogenic diet (common for therapy)
- **2:1** - Less restrictive ketogenic diet
- **1:1** - Modified Atkins diet approach

## Docker Commands

### View logs:
```bash
# All services
docker-compose logs -f

# Web app only
docker-compose logs -f web

# Database only
docker-compose logs -f postgres
```

### Rebuild and restart:
```bash
# Rebuild after code changes
docker-compose --env-file .env.docker.local up --build -d

# Restart without rebuilding
docker-compose restart
```

### Stop services:
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v
```

### Access container shell:
```bash
# Web app container
docker exec -it keto-recipes-web sh

# Database container
docker exec -it keto-recipes-db psql -U ketouser -d ketorecipes
```

## Database Management

### View database (Prisma Studio):
```bash
# If running locally
npx prisma studio

# If running in Docker
docker exec -it keto-recipes-web npx prisma studio
```

### Run migrations:
```bash
# Local development
npx prisma migrate dev

# Production (Docker automatically runs this on startup)
docker exec -it keto-recipes-web npx prisma migrate deploy
```

### Reset database:
```bash
# Local development
npx prisma db push --force-reset

# Docker
docker-compose down -v
docker-compose --env-file .env.docker.local up -d
```

## Production Deployment

### Requirements
- Server with Docker and Docker Compose installed
- Domain name (optional, for HTTPS)
- Reverse proxy like Nginx or Traefik (for HTTPS)

### Deployment Steps

1. **Clone the repository on your server**:
   ```bash
   git clone <your-repo-url>
   cd keto-recipes
   ```

2. **Create production environment file**:
   ```bash
   cp .env.docker .env.production
   ```

3. **Edit `.env.production` with secure values**:
   ```bash
   # Generate a strong secret
   NEXTAUTH_SECRET=$(openssl rand -base64 32)

   # Set your production URL
   NEXTAUTH_URL=https://yourdomain.com
   ```

4. **Update `docker-compose.yml` for production** (optional optimizations):
   ```yaml
   # Change database password in production
   # Add volume for database backups
   # Configure resource limits
   ```

5. **Start the application**:
   ```bash
   docker-compose --env-file .env.production up -d
   ```

6. **Set up HTTPS with Nginx** (recommended):
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

7. **Enable SSL with Let's Encrypt**:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Database Backups

**Create a backup**:
```bash
docker exec keto-recipes-db pg_dump -U ketouser ketorecipes > backup_$(date +%Y%m%d).sql
```

**Restore from backup**:
```bash
cat backup_20231215.sql | docker exec -i keto-recipes-db psql -U ketouser -d ketorecipes
```

**Automated backups** (add to crontab):
```bash
# Daily backup at 2 AM
0 2 * * * docker exec keto-recipes-db pg_dump -U ketouser ketorecipes > /backups/keto_$(date +\%Y\%m\%d).sql
```

### Monitoring

**Check application health**:
```bash
# Check if containers are running
docker-compose ps

# Check resource usage
docker stats keto-recipes-web keto-recipes-db

# View recent logs
docker-compose logs --tail=100 web
```

**Set up monitoring tools** (optional):
- Uptime monitoring: UptimeRobot, Healthchecks.io
- Application monitoring: Sentry, LogRocket
- Server monitoring: Prometheus + Grafana

### Updating the Application

1. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

2. **Rebuild and restart**:
   ```bash
   docker-compose --env-file .env.production up --build -d
   ```

3. **Verify deployment**:
   ```bash
   docker-compose logs -f web
   ```

### Security Best Practices

- Use strong, unique `NEXTAUTH_SECRET` in production
- Enable HTTPS with valid SSL certificate
- Change default database credentials
- Regularly backup your database
- Keep Docker images updated (`docker-compose pull`)
- Use environment variables for all secrets (never commit to git)
- Set up firewall rules (only expose ports 80, 443)
- Enable Docker container resource limits
- Regular security updates for the host OS

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Docker)
- **ORM**: Prisma 7
- **Authentication**: NextAuth.js
- **Containerization**: Docker & Docker Compose

## Prisma 7 Configuration

This project uses Prisma 7, which has a new configuration approach:

- **`prisma/schema.prisma`**: Defines your database schema (models, relationships)
- **`prisma.config.ts`**: Configures datasource connection using `defineConfig` from `prisma/config`
- **`lib/prisma.ts`**: PrismaClient initialization with `datasourceUrl` option for runtime configuration

The database URL is configured in `prisma.config.ts` and passed at runtime via the `DATABASE_URL` environment variable. This allows for flexible configuration across different environments.

For more information, see:
- [Prisma Config Reference](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Upgrade to Prisma ORM 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)

## Project Structure

```
keto-recipes/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth.js authentication
│   │   ├── food-items/     # Food items CRUD endpoints
│   │   ├── recipes/        # Recipes CRUD endpoints
│   │   └── preferences/    # User preferences endpoint
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Main app page
├── components/
│   ├── FoodItems.tsx       # Food items management UI
│   ├── Recipes.tsx         # Recipes management UI with calculations
│   ├── Settings.tsx        # Settings page for target ratio
│   └── SessionProvider.tsx # NextAuth session provider
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   └── schema.prisma       # Database schema
├── prisma.config.ts        # Prisma 7 datasource configuration
├── docker-compose.yml      # Docker services (PostgreSQL + Web)
├── Dockerfile              # Multi-stage build for Next.js
├── .dockerignore           # Docker build exclusions
├── .env                    # Local development environment
├── .env.docker             # Docker environment template
└── next.config.ts          # Next.js configuration
```

## Database Schema

- **User**: User accounts with authentication credentials
- **FoodItem**: Food items with nutritional values per 100g (linked to creator)
- **Recipe**: Recipe information (name, instructions, servings, public/private status)
- **RecipeIngredient**: Links recipes to food items with quantities
- **UserPreference**: User preferences (target keto ratio)

## Troubleshooting

### Docker: Port already in use
If port 3000 or 5433 is already in use:
```yaml
# Edit docker-compose.yml and change the port mapping
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Docker: Build fails
```bash
# Clean Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose --env-file .env.docker.local up --build
```

### Node version issues (local development)
Make sure you're using Node.js >= 20.9.0:
```bash
node --version
```

### Database connection issues
```bash
# Check if containers are running
docker ps

# Check container logs
docker-compose logs postgres

# Restart containers
docker-compose restart

# Full reset (WARNING: deletes all data)
docker-compose down -v
docker-compose --env-file .env.docker.local up -d
```

### Next.js build errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prisma errors
```bash
# Regenerate Prisma client
npx prisma generate

# Reset and sync database
npx prisma db push --force-reset
```

## Features Implemented

- User authentication and authorization
- Multi-user support with data isolation
- Public/private recipe sharing
- CSV bulk import for food items
- Automatic macro and keto ratio calculations
- Docker deployment for production
- Responsive mobile-friendly design

## Future Enhancements

Some ideas for additional features:
- Search and filter for recipes and food items
- Recipe categories and tags
- Favorites and meal planning
- Export recipes to PDF
- Import food items from nutritional databases
- Meal planning calendar
- Keep track of meals to understand historical trends

## License

Apache-2.0 license

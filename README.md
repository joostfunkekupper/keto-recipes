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
- **Docker** (for PostgreSQL database)

## Installation

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
   docker-compose up -d
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

## Database Management

### View database:
```bash
npx prisma studio
```

### Reset database:
```bash
npx prisma db push --force-reset
```

### Stop database:
```bash
docker-compose down
```

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Docker)
- **ORM**: Prisma

## Project Structure

```
keto-recipes/
├── app/
│   ├── api/
│   │   ├── food-items/     # Food items CRUD endpoints
│   │   ├── recipes/        # Recipes CRUD endpoints
│   │   └── preferences/    # User preferences endpoint
│   └── page.tsx            # Main app page
├── components/
│   ├── FoodItems.tsx       # Food items management UI
│   ├── Recipes.tsx         # Recipes management UI with calculations
│   └── Settings.tsx        # Settings page for target ratio
├── lib/
│   └── prisma.ts           # Prisma client singleton
├── prisma/
│   └── schema.prisma       # Database schema
├── docker-compose.yml      # PostgreSQL setup
└── .env                    # Database connection string
```

## Database Schema

- **FoodItem**: Stores food items with nutritional values per 100g
- **Recipe**: Stores recipe information (name, instructions, servings)
- **RecipeIngredient**: Links recipes to food items with quantities
- **UserPreference**: Stores user preferences (target keto ratio)

## Troubleshooting

### Port 5433 already in use
Change the port in `docker-compose.yml` and update `.env` accordingly.

### Node version issues
Make sure you're using Node.js >= 20.9.0:
```bash
node --version
```

### Database connection issues
1. Ensure Docker container is running: `docker ps`
2. Check connection string in `.env`
3. Try restarting the container: `docker-compose restart`

## Future Enhancements

Some ideas for additional features:
- User authentication (multi-user support)
- Search and filter for recipes and food items
- Recipe categories and tags
- Favorites and meal planning
- Export recipes to PDF
- Import food items from nutritional databases
- Recipe sharing

## License

Apache-2.0 license

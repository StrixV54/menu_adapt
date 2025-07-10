# MenuAdapt - Dish Management Application

A comprehensive dish exploration and recipe discovery platform built with React, TypeScript, and Node.js.

## About

This project implements a full-stack dish management application featuring:

- **Dish Details**: Complete information display with ingredients, cooking times, and origin
- **Advanced Search**: Auto-suggest search across dish names, ingredients, and locations
- **Smart Filtering**: Pagination, sorting, and multi-criteria filtering
- **Ingredient-based Suggestions**: Find dishes you can make with available ingredients
- **Browser Storage**: Persistent user state across sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Technology Stack

- **Frontend**: React, TypeScript, React Router, React Query, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL, Drizzle ORM
- **Features**: Real-time search, caching, responsive design

## Documentation

📖 **Detailed documentation available:**
- **[Frontend Features & Setup](README_FRONTEND.md)** - Complete frontend documentation
- **[Backend API Documentation](backend/API_DOCUMENTATION.md)** - API endpoints and examples
- **[Database Setup Guide](backend/SETUP_DATABASE.md)** - PostgreSQL configuration

## Quick Start

### Prerequisites
- Node.js (v16+), PostgreSQL, npm/yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd menu_adapt
   npm install
   cd backend && npm install
   ```

2. **Database setup**
   ```bash
   # Follow backend/SETUP_DATABASE.md for detailed instructions
   createdb indian_cuisine_db
   cd backend && npm run db:migrate
   ```

3. **Environment configuration**
   ```bash
   # Frontend: Create .env with VITE_BACKEND_URL=http://localhost:5000
   # Backend: Create .env with DATABASE_URL and PORT
   ```

4. **Start the application**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   ```

5. **Access the application**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:5000/api
   ```

## Key Features

✅ **Comprehensive Dish Database** - 255+ Indian dishes with detailed information
✅ **Intelligent Search** - Multi-type auto-suggestions and filtering
✅ **Recipe Discovery** - Find dishes based on available ingredients
✅ **Modern UI/UX** - Responsive design with TypeScript and React Query
✅ **Performance Optimized** - Caching, pagination, and efficient data loading

For detailed feature descriptions, API documentation, and setup instructions, see the linked documentation files above.

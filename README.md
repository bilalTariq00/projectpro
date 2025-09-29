# Project-pro

A comprehensive project management application built with React, Express.js, and MySQL.

## Features

- 📊 Dashboard and analytics
- 📅 Calendar and scheduling
- 👥 User management and authentication
- 💳 Subscription plans and payments
- 📱 Mobile app support
- 🌐 Multi-language support
- 📈 Job tracking and reporting

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: MySQL with Drizzle ORM
- **Mobile**: Capacitor
- **Payments**: Stripe
- **Authentication**: Passport.js

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Talha5t5/Project-pro.git
cd Project-pro
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations

## Project Structure

```
├── client/          # React frontend
├── server/          # Express.js backend
├── shared/          # Shared schemas and types
├── android/         # Android app
├── ios/             # iOS app
├── migrations/      # Database migrations
└── dist/           # Production build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

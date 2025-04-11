# Pokémon Tournament Manager (PokéTourneys)

A modern Progressive Web App (PWA) for managing and participating in Pokémon Trading Card Game tournaments. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Authentication & Authorization**
  - Sign up and login system using Supabase Auth
  - Role-based access (Players and Shops)
  - Secure session management

- **Player Features**
  - Account management
  - Pokémon Player ID tracking
  - Tournament registration
  - Deck list submission
  - Tournament browsing and filtering

- **Shop Features**
  - Tournament creation and management
  - Player registration management
  - Real-time tournament chat
  - Deck list management

- **Technical Features**
  - Progressive Web App (PWA) support
  - Responsive design
  - Real-time updates
  - Offline capabilities
  - Dark mode support

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/poke-tourneys.git
   cd poke-tourneys
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL migrations in `supabase/migrations/`
   - Enable the following Supabase features:
     - Authentication
     - Realtime
     - Storage

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
poke-tourneys/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
├── public/                # Static assets
├── supabase/             # Supabase configuration
└── ...config files
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred hosting platform (Vercel recommended):
   ```bash
   vercel
   ```

3. Set up environment variables in your hosting platform.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
# poke-app

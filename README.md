# Fitzio

Fitzio is a web application that connects trainers and athletes to make training smarter, more efficient, and more personal.

## Overview

Fitzio provides a platform where:
- **Trainers** can create, customize, and assign workouts to their athletes
- **Athletes** can view and complete their assigned workouts and questionnaires
- Both parties can track progress effectively

## Features

### For Trainers
- Create and manage workout programs
- Create and assign questionnaires
- Assign workouts to athletes
- Track athlete progress
- Manage athlete relationships
- Profile management

### For Athletes
- View assigned workouts
- Complete workouts and mark them as done
- Fill out assigned questionnaires
- Track personal progress
- Profile management

## Tech Stack

- **Frontend**: Svelte with SvelteKit
- **UI**: TailwindCSS
- **Backend**: Supabase (PostgreSQL + Authentication)
- **i18n**: Multi-language support (English, Spanish, Catalan)

## Setup and Installation

1. Clone the repository
```bash
git clone [repository-url]
cd fitzio
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Run the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## Database Schema

The application uses Supabase with the following main entities:
- Users (auth.users)
- Profiles
- Workouts
- Workout Assignments
- Exercises
- Questionnaires
- Questionnaire Assignments
- Responses
- Trainer-Athlete relationships

## Project Structure

- `/src/routes`: Page routes organized by user role and feature
- `/src/lib/components`: Reusable UI components
- `/src/lib/services`: API services for data interaction
- `/src/lib/i18n`: Internationalization files
- `/supabase/migrations`: Database migration files

## Contribution

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Admin Dashboard

The Fitzio platform includes an admin dashboard for privileged users with administrative access. Admin users cannot be created through the regular registration form - they must be created directly in Supabase.

### Creating an Admin User

To create an admin user directly in Supabase:

1. Create a user through the Supabase Authentication dashboard or using the Auth API
2. After the user is created, insert a profile record with role 'admin' in the profiles table:

```sql
INSERT INTO profiles (id, email, role, username, first_name, last_name, created_at)
VALUES (
  'user-uuid-from-auth', -- The user UUID from auth.users
  'admin@example.com',   -- The user's email
  'admin',               -- Role must be 'admin'
  'admin_username',      -- Optional username
  'Admin',               -- Optional first name
  'User',                -- Optional last name
  now()                  -- Current timestamp
);
```

3. Admin users can access the admin dashboard at `/dashboard/admin`

### Admin Dashboard Features

- View system-wide statistics
- Manage all users
- View all workouts and questionnaires
- Access platform analytics

## Development

[Your existing development instructions]

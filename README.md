
  # USTU CAMPUS

  This is a code bundle for Design DigiHub College App. The original project is available at https://www.figma.com/design/srfWcBqXdKIZiM1YJU0Iyk/Design-DigiHub-College-App.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Supabase Setup

  1. Create a `.env` file in the project root.
  2. Copy values from `.env.example` and add your real Supabase project values:

  ```env
  VITE_SUPABASE_URL=https://your-project-ref.supabase.co
  VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
  VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
  CLERK_SECRET_KEY=your-clerk-secret-key
  ```

  3. Run [supabase/bootstrap.sql](supabase/bootstrap.sql) in Supabase SQL Editor.
  4. Then run [supabase/migrations/add-clerk-support.sql](supabase/migrations/add-clerk-support.sql) to add Clerk user columns and policies.
  5. Restart the dev server after updating `.env`.

  ## Authentication (Clerk)

  - Users must sign in/sign up before accessing the app.
  - First login syncs Clerk user data to Supabase student_profile table with `clerk_user_id`.
  - Sign up/Sign in pages: `/sign-up` and `/sign-in`.
  - All dashboard routes are protected and redirect unauthenticated users to sign-in.
  - Use UserButton in sidebar to sign out.

  ## Database Tables

  The app is DB-driven and expects these primary tables:

  - `student_profile`, `academic_info`, `student_skills`, `student_achievements`
  - `notices`, `todays_classes`, `upcoming_events`
  - `timetable`, `calendar_events`
  - `attendance_by_subject`, `attendance_records`
  - `semester_marks`, `previous_semesters`
  - `fee_structure`, `payment_history`
  - `issued_books`, `available_books`
  - `canteen_menu`
  - `feedback_subjects`, `feedback_categories`, `feedback_submissions`

  Use your Supabase `anon` key (not the `service_role` key) in frontend apps.
  
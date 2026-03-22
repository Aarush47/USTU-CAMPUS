# Teacher Portal Setup Guide

## ✅ What's Been Built

Your teacher portal structure is now complete with:

### Pages Created:
1. **Teacher Dashboard** (`/teacher`)
   - Overview stats (Classes, Students, Pending Assignments, Today's Classes)
   - Quick start guide cards

2. **Classes Management** (`/teacher/classes`)
   - Create new classes
   - View all classes
   - Edit/Delete classes
   - Student count display

3. **Attendance Marking** (`/teacher/attendance`)
   - Select date and class
   - Mark attendance (Present/Absent/Late)
   - Quick actions (Mark all present)
   - Table view of all students

4. **Assignments** (`/teacher/assignments`)
   - Create new assignments
   - View all assignments
   - Submission tracking
   - Edit/Delete assignments

5. **Resources** (`/teacher/resources`)
   - Upload study materials
   - Organize by class
   - Delete resources

### Components Created:
- `TeacherRoute.tsx` - Role-based access control (checks if user is teacher)
- `TeacherLayout.tsx` - Sidebar navigation for teacher portal
- `TeacherProtectedLayout.tsx` - Protected wrapper

---

## 🔐 Setting Up Role-Based Access (IMPORTANT)

### Step 1: Create Users Table in Supabase

1. Go to your Supabase dashboard
2. Open **SQL Editor**
3. Paste the contents of: `supabase/migrations/add-users-table.sql`
4. Click **Run**

This creates:
- `users` table with email, name, role (student/teacher/admin)
- Indexes for fast lookups
- RLS policies

### Step 2: Add Test Users

After creating the users table, run these SQL commands in Supabase:

```sql
-- Insert a test teacher
INSERT INTO public.users (email, name, role)
VALUES ('teacher@example.com', 'John Teacher', 'teacher')
ON CONFLICT (email) DO NOTHING;

-- Insert test students
INSERT INTO public.users (email, name, role)
VALUES 
  ('student1@example.com', 'Alice Student', 'student'),
  ('student2@example.com', 'Bob Student', 'student')
ON CONFLICT (email) DO NOTHING;
```

### Step 3: Test Role-Based Access

1. **Start dev server:** `npm run dev`
2. **Sign up as teacher:** 
   - Use email: `teacher@example.com`
   - After signup, update the user role to 'teacher' in Supabase
3. **Visit:** `http://localhost:5173/teacher`
   - ✅ Should see Teacher Dashboard
4. **Sign in as student:** 
   - Use email: `student1@example.com`
   - Try visiting `/teacher`
   - ✅ Should see "Access Denied"

---

## 📋 Next Steps (Phase 2)

### To fully connect the system:

1. **Connect Classes to Supabase**
   - Update `TeacherClasses.tsx` to fetch from `public.classes`
   - Add logic to create classes via API

2. **Connect Attendance to Supabase**
   - Update `TeacherAttendance.tsx` to save attendance records
   - Link to student attendance dashboard

3. **Connect Assignments to Supabase**
   - Update `TeacherAssignments.tsx` to save assignments
   - Show student submissions

4. **Connect Resources to Supabase**
   - Add file upload functionality
   - Save to Supabase storage

5. **Add Teacher-Student Navigation**
   - Add button to switch between portals
   - Or show role-specific homepages

---

## 🧪 Testing Checklist

- [ ] Users table created in Supabase
- [ ] Test teacher user can access `/teacher`
- [ ] Test teacher sees dashboard with stats
- [ ] Test student cannot access `/teacher` (gets access denied)
- [ ] Student can still access `/` (student portal)
- [ ] All pages load without errors

---

## 💾 Database Schema Ready

Your current tables are:
- `users` - User profiles with roles
- `student_profile` - Student details (synced from Clerk)
- `classes` - Classes (ready for teacher data)
- `enrollments` - Student enrollment in classes
- `assignments` - Teacher assignments
- `submissions` - Student submissions
- `attendance` - Daily attendance records
- `resources` - Study materials

---

## 🚀 Running the Tests

```bash
# Start dev server
npm run dev

# Open browser to:
# - http://localhost:5173 (Student Portal)
# - http://localhost:5173/teacher (Teacher Portal)
```

**Teachers:** Email ending in @teacher will get teacher access after role update
**Students:** Any other email will get student access

---

## ⚠️ Important Notes

1. **Role-based access is checked on:**
   - Supabase users table (backend check)
   - Frontend route protection (UI redirect)
   
2. **Both checks are important for security** - don't rely on UI alone

3. **Current flow:**
   - User signs up with Clerk
   - Clerk user synced to `student_profile`
   - Then manually update `users` table with role

4. **Next optimization:** Auto-sync Clerk user → users table with default 'student' role

---

## 📞 Support

If you hit issues:
- Check Supabase SQL for users table creation
- Verify test user roles are set correctly
- Check browser console for errors
- Check network tab to see API responses

Good luck! 🎯

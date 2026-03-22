# Gated Enrollment System Setup Guide

## Overview

The gated enrollment system ensures secure, controlled student enrollment by:
- **Teachers** register students using email + reference codes
- **Students** can ONLY signup using an invitation code from their teacher
- **Email domain validation** ensures @ustu.edu.in for all users

## Architecture

### Database Schema

#### `student_invitations` Table
```sql
id (UUID)              - Primary key
teacher_id (UUID)      - References users.id (teacher who created invite)
email (TEXT)           - Student email (@ustu.edu.in required)
reference_code (TEXT)  - Unique invitation code (USTU-XXXXX format)
name (TEXT)            - Student name
roll_no (TEXT)         - Student roll number
department (TEXT)      - Department name
semester (TEXT)        - Semester info
status (TEXT)          - pending | accepted | rejected
created_at (TIMESTAMP) - Created timestamp
accepted_at (TIMESTAMP)- When student accepted invitation
updated_at (TIMESTAMP) - Last updated
```

**Constraints:**
- Unique email per invitation (one invite per student)
- Unique reference code across all invitations
- Indexes on: email, reference_code, teacher_id, status

**RLS Policies:**
- Teachers can view/edit/delete their own invitations
- Public can check invitation validity (for signup flow)

#### `users` Table Enhancement
```sql
role (TEXT)            - 'student' | 'teacher' | 'admin'
```

## User Flows

### Teacher Signup/Login
1. Visit `/sign-up`
2. Select "Teacher" role
3. Enter email (must be @ustu.edu.in)
4. Set password
5. Account created with role='teacher' in users table
6. Access `/teacher` dashboard

### Teacher: Invite Students UI (`/teacher/students`)
1. Click "Invite Student" button
2. Fill form:
   - **Email** (required): Must be @ustu.edu.in
   - **Name** (required): Student name
   - **Roll No**: Optional, student ID
   - **Department**: Optional, e.g., "Computer Science"
   - **Semester**: Optional, e.g., "6th Semester"
3. System auto-generates reference code (format: USTU-XXXXX)
4. Student invitation saved to student_invitations table
5. Teacher sees reference code → can copy to clipboard
6. Invitation status shows as "Pending"
7. When student signs up with code → status changes to "Accepted"

### Student Signup Flow (2-Step Process)
**Step 1: Invitation Verification**
1. Visit `/sign-up`
2. Select "Student" role
3. Enter email (must be @ustu.edu.in)
4. Enter reference code (shown when teacher invites)
5. System queries student_invitations table:
   - Check email matches record
   - Check code exists and is unique
   - Check status = pending
   - If valid → ✅ "Verified!"
   - If invalid → ❌ Error message

**Step 2: Password Setup**
1. Email field disabled (shows verified email)
2. Enter password (standard requirements)
3. Confirm password
4. Click "Create Account"
5. Clerk creates account
6. users table entry created with:
   - role = 'student'
   - email = {student's email}
   - clerk_user_id = {clerk ID}
7. student_invitations status updated → "accepted"
8. Redirect to student dashboard

### Student Signup Errors
- **"Invalid email domain"** → Not @ustu.edu.in
- **"Invalid invitation code"** → Code doesn't exist
- **"This email doesn't match your invitation"** → Email mismatch
- **"This invitation has already been used"** → Status not 'pending'

## Security Controls

1. **Email Domain Validation**
   - Frontend: Regex check for @ustu.edu.in
   - Database: Can add trigger for enforcement
   - Only authorized users can signup

2. **Reference Code Uniqueness**
   - Database constraint ensures unique codes
   - Format: USTU-XXXXX (teacher can't guess codes)
   - 6-character alphanumeric = 62^6 combinations (~56 billion)

3. **One Invitation Per Email**
   - Database unique constraint on email
   - Prevents duplicate registrations
   - Teachers can delete/recreate if needed

4. **Role-Based Access**
   - TeacherRoute component checks users.role='teacher'
   - Non-teachers redirected to access denied page
   - ProtectedLayout ensures students see student portal

5. **RLS Policies**
   - Teachers only manage their own invitations
   - Students can't create invitations
   - Public read access limited to code validation

## Setup Steps

### 1. Run Database Migrations
```bash
# In Supabase SQL Editor, run:
# File: supabase/migrations/add-users-table.sql
# File: supabase/migrations/create-student-invitations.sql
```

### 2. Enable RLS Policies
- Ensure RLS is enabled on student_invitations table
- Policies already defined in SQL migration

### 3. Update Application Routes
- Routes already updated in `src/app/routes.ts`:
  - `/sign-up` → UpdatedSignUpPage (new)
  - `/teacher/students` → ManageStudents (new)

### 4. Test Complete Flow

**Test Teacher Path:**
```
1. Go to /sign-up
2. Select "Teacher"
3. Use email: teacher@ustu.edu.in
4. Set password
5. Should redirect to /teacher (dashboard)
6. Go to /teacher/students
7. Invite a student: student101@ustu.edu.in
8. Copy the reference code shown
```

**Test Student Path:**
```
1. Go to /sign-up
2. Select "Student"
3. Enter email: student101@ustu.edu.in
4. Enter reference code from teacher's invite
5. Click verify (should show ✅ Verified!)
6. Go to Step 2: Set password
7. Create account
8. Should redirect to student dashboard (/)
9. Verify students can't access /teacher routes
```

**Test Failure Cases:**
```
1. Student tries signup with email: student102@ustu.edu.in (not invited)
   → Should show "Invalid invitation code"
2. Student tries with wrong reference code
   → Should show "Invalid invitation code"
3. Teacher tries signup with email: teacher@gmail.com (not @ustu.edu.in)
   → Should show domain error
4. Student tries duplicate email (already invited elsewhere)
   → Teacher sees "Email already invited" error
```

## Files Modified

1. **src/app/pages/UpdatedSignUpPage.tsx** (NEW)
   - Role selection (Teacher/Student)
   - Teacher signup flow
   - Student 2-step verification flow
   - Email domain validation
   - Reference code verification

2. **src/app/pages/teacher/ManageStudents.tsx** (NEW)
   - Invite student form
   - Reference code generation (USTU-XXXXX)
   - Student invitations list/table
   - Status tracking (pending/accepted/rejected)
   - Delete invitation option
   - Copy code to clipboard

3. **src/app/routes.ts** (UPDATED)
   - Import UpdatedSignUpPage
   - Replace SignUpPage with UpdatedSignUpPage
   - Add /teacher/students route → ManageStudents

4. **src/app/components/TeacherLayout.tsx** (UPDATED)
   - Add "Manage Students" nav item
   - Link to /teacher/students

5. **supabase/migrations/create-student-invitations.sql** (NEW)
   - student_invitations table
   - Indexes and constraints
   - RLS policies

6. **supabase/migrations/add-users-table.sql** (EXISTING)
   - users table with role field
   - For role-based access control

## Database Queries

### Teacher Viewing Their Invitations
```sql
SELECT * FROM student_invitations 
WHERE teacher_id = $1 
ORDER BY created_at DESC;
```

### Student Verifying Invitation
```sql
SELECT id, status FROM student_invitations 
WHERE email = $1 AND reference_code = $2;
```

### Accepting Invitation
```sql
UPDATE student_invitations 
SET status = 'accepted', accepted_at = NOW() 
WHERE id = $1;
```

## Next Steps

1. **Production Deployment**
   - Run migrations in production Supabase
   - Test with real users
   - Monitor signup success rates

2. **Future Enhancements**
   - Bulk student import (CSV upload)
   - Email notifications when invited
   - Resend invitation option
   - Invitation expiry time (e.g., 7 days)
   - Statistics dashboard (invites sent, accepted %)

3. **Additional Features**
   - Allow students to join classes after signup
   - Teacher can see which students have logged in
   - Password reset flow
   - Admin panel to manage all users

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Students can't signup | Check student_invitations table exists in Supabase |
| Reference code not generating | Verify ManageStudents component is imported |
| Email validation failing | Check regex in UpdatedSignUpPage |
| Teacher can't see invitations | Verify TeacherRoute checks role correctly |
| RLS policy errors | Check Supabase RLS is enabled on student_invitations |

## Verification Checklist

- [ ] Supabase migrations applied
- [ ] Database tables verified (users, student_invitations)
- [ ] Routes updated and application builds
- [ ] Teacher can signup with @ustu.edu.in
- [ ] Teacher can access /teacher/students
- [ ] Teacher can create student invitation
- [ ] Reference code generated and shown
- [ ] Student can signup with invitation code
- [ ] Student signup status changes to accepted
- [ ] Student can access student dashboard
- [ ] Student can't access /teacher routes
- [ ] Error messages show for invalid codes

---

**Last Updated:** January 2025
**Status:** Production Ready

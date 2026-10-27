# StaffSync - Enterprise HRMS

StaffSync is an enterprise Human Resource Management System featuring complete Node.js, Express, MongoDB (Mongoose), JWT authentication, and bcryptjs password security.

---

## 1. System Architecture & Features

### Core Modules
* **Authentication & Role-Based Access Control (RBAC)**:
  * Real JWT verification via `Authorization: Bearer <token>`.
  * Strong password encryption via `bcryptjs` (10 rounds salt).
  * Three permission levels:
    * `hr_admin`: Organization-wide employee onboarding, company leave decisions, global announcements, organization headcount & department analytics.
    * `manager`: Direct report management, team leave approvals with review notes, training cohort creation, team attendance metrics.
    * `employee`: Self-service attendance clocking, leave application submission & review tracking, company bulletin viewing, professional course enrollment.
* **Attendance Management**:
  * Real-time work shift clock-in and clock-out.
  * Atomic date records (`YYYY-MM-DD`) preventing duplicate check-ins on the same calendar day.
  * Automatic duration calculation (hours/minutes) and status assignment (`present`, `half_day`, `late`).
* **Leave Workflows**:
  * Formal leave requests (Annual, Sick, Casual, Unpaid) with date spans and reason.
  * Multi-stage status lifecycle (`pending`, `approved`, `rejected`).
  * Strict manager boundary: managers can only approve or reject requests from their assigned direct reports.
* **Corporate Bulletins & Announcements**:
  * HR Admin publication engine with urgency prioritization (`high`, `medium`, `low`) and audience segmentation (`all`, `manager`, `employee`).
  * Per-user read receipt sets (`readBy`).
* **Training & Development Portal**:
  * Cohort creation with seat capacity limits.
  * Real-time enrollment tracking preventing over-subscription and duplicate enrollments.
* **Dashboard Analytics**:
  * Aggregation pipelines (`$match`, `$group`) computing real headcount, attendance rates, and pending queues.

---

## 2. Database Collections & Schemas

| Collection | Model Path | Primary Fields & Constraints |
| :--- | :--- | :--- |
| `users` | `server/models/User.ts` | `name`, `email` (unique, lowercase), `password` (select: false, bcrypt), `role` (`hr_admin`, `manager`, `employee`), `department`, `position`, `managerId` (ref: User), `status` |
| `attendances` | `server/models/Attendance.ts` | `user` (ref: User), `date` (YYYY-MM-DD), `clockIn`, `clockOut`, `durationMinutes`, `status` (`present`, `half_day`, `late`), unique compound index: `{ user: 1, date: 1 }` |
| `leaves` | `server/models/Leave.ts` | `user` (ref: User), `leaveType` (`annual`, `sick`, `casual`, `unpaid`), `startDate`, `endDate`, `days`, `reason`, `status` (`pending`, `approved`, `rejected`), `reviewedBy` (ref: User), `reviewNote`, `reviewedAt` |
| `announcements` | `server/models/Announcement.ts` | `title`, `content`, `priority` (`low`, `medium`, `high`), `targetRole` (`all`, `manager`, `employee`), `createdBy` (ref: User), `readBy` (`[ObjectId]`) |
| `trainings` | `server/models/Training.ts` | `title`, `description`, `category`, `instructor`, `capacity`, `startDate`, `endDate`, `createdBy` (ref: User), `enrolledEmployees` (`[{ user, enrolledAt, status }]`) |

---

## 3. Environment Configuration

Define these environment variables in `.env`:

```env
# Application Port
PORT=3000

# MongoDB Connection String
# Optional external MongoDB (e.g. mongodb://localhost:27017/staffsync or MongoDB Atlas).
# If left empty, StaffSync automatically boots an embedded MongoDB engine.
MONGODB_URI=""

# JWT Security Secrets
JWT_SECRET="staffsync_enterprise_secret_jwt_key_2026_super_secure"
JWT_EXPIRE="7d"

# Node Environment
NODE_ENV="development"
```

---

## 4. Setup & Running the Application

### Installation & Starting
```bash
# Install dependencies
npm install

# Start the full-stack server (Node.js/Express + Vite on Port 3000)
npm run dev

# Optional: Seed the database independently
npm run seed
```

---

## 5. Pre-configured Demo Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | Sarah Connor | `hr@staffsync.io` | `Password123!` |
| **Engineering Manager** | Marcus Vance | `manager@staffsync.io` | `Password123!` |
| **Senior Employee** | David Kim | `david@staffsync.io` | `Password123!` |
| **Frontend Engineer** | Elena Rostova | `elena@staffsync.io` | `Password123!` |
| **Product Designer** | Aisha Patel | `aisha@staffsync.io` | `Password123!` |

---

## 6. End-to-End Verification Scenarios

You can verify the complete 8-step workflow directly in the application by clicking the **"E2E Test Suite"** navigation tab or issuing a request to `POST /api/e2e-test`:

1. **HR creates an employee**: Provisions an employee in MongoDB with bcryptjs hashed password and manager assignment.
2. **Employee logs in and marks attendance**: Verifies JWT issuance, executes daily clock-in and clock-out with worked duration calculation.
3. **Employee submits leave request**: Creates an annual leave record in `pending` state.
4. **Assigned manager reviews request**: Validates manager authority, approves the request, and appends feedback note.
5. **Employee sees updated leave status**: Fetches updated status (`approved`) and review notes.
6. **HR publishes an announcement**: Broadcasts bulletin; employee accesses and marks read receipt.
7. **Manager creates training & employee enrolls**: Publishes technical course and enrolls employee within capacity limits.
8. **RBAC barrier tests**: Confirms unauthorized actions (e.g. employee creating users or approving leaves) return HTTP `403 Forbidden`.

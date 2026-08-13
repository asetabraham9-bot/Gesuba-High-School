# Milestone 9.5 - Exam Publish & Admin Approval Workflow

## Overview
This milestone implements the complete exam publishing and admin approval workflow for the Gesuba High School Management System.

## Features Implemented

### 1. Exam Publishing (Instructor Action)
**Endpoint:** `POST /exams/:id/publish`
**Authorization:** INSTRUCTOR role required
**Status Transition:** DRAFT → PENDING_APPROVAL

**Request Body:**
```json
{
  "message": "Ready for approval"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exam": {
      "_id": "ObjectId",
      "title": "Mathematics Midterm",
      "status": "PENDING_APPROVAL",
      "createdBy": { "email": "instructor@school.com", "name": "Mrs. Smith" },
      "classLevelId": { "section": "A", "gradeId": "ObjectId" },
      "subjectId": { "name": "Mathematics" },
      "totalMarks": 100,
      "startAt": "2024-09-15T10:00:00Z",
      "endAt": "2024-09-15T11:30:00Z",
      "durationMinutes": 90
    }
  }
}
```

**Validation Rules:**
- Exam must be in DRAFT status
- Exam must have at least one question
- Only instructor who created the exam can publish it

**Error Scenarios:**
- `400` - Exam is not in DRAFT status
- `400` - Exam has no questions
- `403` - Not the exam creator
- `404` - Exam not found

---

### 2. Get Exams for Approval (Admin Action)
**Endpoint:** `GET /exams/approval-queue`
**Authorization:** ADMIN role required
**Purpose:** View all pending exam approvals

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "_id": "ObjectId",
        "title": "Mathematics Midterm",
        "status": "PENDING_APPROVAL",
        "createdBy": { "email": "instructor@school.com", "name": "Mrs. Smith" },
        "classLevelId": { "section": "A", "gradeId": "ObjectId" },
        "subjectId": { "name": "Mathematics" },
        "totalMarks": 100,
        "startAt": "2024-09-15T10:00:00Z",
        "endAt": "2024-09-15T11:30:00Z",
        "durationMinutes": 90,
        "createdAt": "2024-09-01T08:00:00Z"
      }
    ]
  }
}
```

**Sorting:** Returns exams sorted by most recent first

---

### 3. Approve Exam (Admin Action)
**Endpoint:** `POST /exams/:id/approve`
**Authorization:** ADMIN role required
**Status Transition:** PENDING_APPROVAL → APPROVED

**Request Body:**
```json
{
  "message": "Approved - Ready for administration"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exam": {
      "_id": "ObjectId",
      "title": "Mathematics Midterm",
      "status": "APPROVED",
      "approvedBy": { "email": "admin@school.com", "name": "School Admin" },
      "approvedAt": "2024-09-01T09:00:00Z",
      "totalMarks": 100,
      "startAt": "2024-09-15T10:00:00Z",
      "endAt": "2024-09-15T11:30:00Z"
    }
  }
}
```

**Fields Updated:**
- `status` → "APPROVED"
- `approvedBy` → Admin user ID
- `approvedAt` → Current timestamp

**Error Scenarios:**
- `400` - Exam is not in PENDING_APPROVAL status
- `403` - User is not an ADMIN
- `404` - Exam not found

---

### 4. Reject Exam (Admin Action)
**Endpoint:** `POST /exams/:id/reject`
**Authorization:** ADMIN role required
**Status Transition:** PENDING_APPROVAL → REJECTED

**Request Body:**
```json
{
  "rejectionReason": "Questions need better formatting and more variety in question types"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exam": {
      "_id": "ObjectId",
      "title": "Mathematics Midterm",
      "status": "REJECTED",
      "rejectionReason": "Questions need better formatting and more variety in question types",
      "approvedBy": { "email": "admin@school.com", "name": "School Admin" },
      "approvedAt": "2024-09-01T09:00:00Z"
    }
  }
}
```

**Fields Updated:**
- `status` → "REJECTED"
- `rejectionReason` → Provided reason
- `approvedBy` → Admin user ID
- `approvedAt` → Current timestamp

**Validation Rules:**
- `rejectionReason` must be 10-1000 characters
- Exam must be in PENDING_APPROVAL status

**Error Scenarios:**
- `400` - Exam is not in PENDING_APPROVAL status
- `400` - Rejection reason too short or too long
- `403` - User is not an ADMIN
- `404` - Exam not found

---

## Workflow State Diagram

```
DRAFT
  ↓ (Instructor publishes via /exams/:id/publish)
PENDING_APPROVAL
  ├─→ APPROVED (Admin approves via /exams/:id/approve)
  │     ↓ (Exam can now be administered)
  │   COMPLETED (After exam runs)
  │
  └─→ REJECTED (Admin rejects via /exams/:id/reject)
       ↓ (Instructor can edit and republish)
     DRAFT (Status reverted by instructor if needed)
```

---

## Authorization Matrix

| Operation | INSTRUCTOR | ADMIN | STUDENT |
|-----------|-----------|-------|---------|
| Publish Exam | ✅ (own exams only) | ❌ | ❌ |
| View Approval Queue | ❌ | ✅ | ❌ |
| Approve Exam | ❌ | ✅ | ❌ |
| Reject Exam | ❌ | ✅ | ❌ |
| View Rejected Exam | ✅ (own exams) | ✅ | ❌ |

---

## Service Functions

### publishExam(examId, instructorId)
- Validates exam is in DRAFT status
- Ensures exam has at least one question
- Verifies instructor ownership
- Transitions status to PENDING_APPROVAL
- Returns populated exam document

### approveExam(examId, adminId)
- Validates exam is in PENDING_APPROVAL status
- Records admin who approved
- Timestamps approval
- Transitions status to APPROVED
- Returns populated exam document

### rejectExam(examId, adminId, rejectionReason)
- Validates exam is in PENDING_APPROVAL status
- Validates rejection reason length (10-1000 chars)
- Records admin who rejected
- Stores rejection reason
- Timestamps rejection
- Returns populated exam document

### getExamsForApproval()
- Retrieves all PENDING_APPROVAL exams
- Populates instructor, classLevel, subject info
- Sorted by most recent first
- Used by admin dashboard

---

## Testing Workflow

### Step 1: Create and Publish Exam
1. Instructor creates exam (status: DRAFT)
2. Instructor adds multiple questions to exam
3. Instructor calls `POST /exams/:id/publish`
4. Exam status changes to PENDING_APPROVAL

### Step 2: Admin Reviews
1. Admin calls `GET /exams/approval-queue`
2. Views all pending exams with instructor and subject info
3. Reviews exam details, questions, and metadata

### Step 3a: Approve Exam
1. Admin calls `POST /exams/:id/approve`
2. Exam status changes to APPROVED
3. Exam ready for administration

### Step 3b: Reject Exam
1. Admin calls `POST /exams/:id/reject` with reason
2. Exam status changes to REJECTED
3. Instructor can edit questions and republish

---

## Database Schema Changes

### Exam Model Fields
- `status` - Enum: DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, COMPLETED
- `rejectionReason` - String, optional, 10-1000 characters
- `approvedBy` - ObjectId reference to User (optional)
- `approvedAt` - Date (optional)
- `resultsReleased` - Boolean (for future milestone: release exam results)

### Indexes
- `status` - For querying exams by status
- `(createdBy, status)` - For instructor's exams by status
- `(classLevelId, subjectId)` - For finding exams by class and subject

---

## API Route Summary

| Method | Path | Role | Purpose |
|--------|------|------|---------|
| POST | `/exams/:id/publish` | INSTRUCTOR | Publish exam for approval |
| GET | `/exams/approval-queue` | ADMIN | View pending exams |
| POST | `/exams/:id/approve` | ADMIN | Approve exam |
| POST | `/exams/:id/reject` | ADMIN | Reject exam with reason |

---

## Security Considerations

1. **Instructor Ownership Check**: publishExam verifies `createdBy` matches `instructorId`
2. **Status Validation**: All operations validate current exam status before proceeding
3. **Question Requirement**: Cannot publish empty exams
4. **Admin-Only Actions**: Approval/rejection restricted to ADMIN role via middleware
5. **Rejection Tracking**: All rejections logged with reason and admin info
6. **Audit Trail**: `approvedAt` and `approvedBy` fields track approval chain

---

## Error Handling

All operations follow consistent AppError patterns:

```typescript
throw new AppError(
  statusCode,
  ERROR_CODE,
  "User-friendly message"
);
```

Common error codes:
- `INVALID_OPERATION` - Invalid status transition or missing data
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Exam not found
- `VALIDATION_ERROR` - Schema validation failure

---

## Integration with Previous Milestones

- **Milestone 9.3A (Academic Foundation)**: Uses ClassLevel, Grade, Subject, Instructor data
- **Milestone 9.4 (Question Management)**: Validates question count before publishing
- **Milestone 9.5 (Exam Workflow)**: Completes the exam preparation phase
- **Milestone 9.6+ (Future)**: Exam scheduling, student attempts, grading

---

## Deployment Checklist

- ✅ Service functions implemented with full authorization
- ✅ Controller handlers with proper request/response handling
- ✅ Routes defined with middleware chains
- ✅ Validation schemas created (Zod)
- ✅ Error handling integrated
- ✅ TypeScript compilation verified
- ✅ Database indexes exist for status queries
- ⏳ Integration tests (ready for student creation)
- ⏳ End-to-end workflow verification

---

## Next Steps (Milestone 9.6+)

1. **Exam Scheduling**: Lock exam dates, schedule notifications
2. **Student Exam Access**: Release approved exams to eligible students
3. **Exam Attempts**: Track student submissions and timing
4. **Answer Evaluation**: MCQ auto-grading, manual grading for short answers
5. **Results Publishing**: Release graded results to students

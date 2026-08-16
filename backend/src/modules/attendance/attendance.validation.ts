import { z } from "zod";
import { AttendanceStatus } from "@/models/attendance.model";

export const markAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  classLevelId: z.string().min(1, "Class level ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
  status: z.enum(Object.values(AttendanceStatus) as [string, ...string[]]),
  notes: z.string().max(500).optional()
});

export const getStudentAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  classLevelId: z.string().optional(),
  subjectId: z.string().optional(),
  startDate: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    "Invalid start date format"
  ),
  endDate: z.string().optional().refine(
    (date) => !date || !isNaN(Date.parse(date)),
    "Invalid end date format"
  ),
  status: z.enum(Object.values(AttendanceStatus) as [string, ...string[]]).optional()
});

export const getClassAttendanceSchema = z.object({
  classLevelId: z.string().min(1, "Class level ID is required"),
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
  subjectId: z.string().optional()
});

export const bulkMarkAttendanceSchema = z.object({
  classLevelId: z.string().min(1, "Class level ID is required"),
  subjectId: z.string().min(1, "Subject ID is required"),
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid date format"
  ),
  records: z.array(
    z.object({
      studentId: z.string().min(1, "Student ID is required"),
      status: z.enum(Object.values(AttendanceStatus) as [string, ...string[]]),
      notes: z.string().max(500).optional()
    })
  ).min(1, "At least one attendance record is required")
});

export const attendanceReportSchema = z.object({
  classLevelId: z.string().min(1, "Class level ID is required"),
  startDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid start date format"
  ),
  endDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid end date format"
  )
});

export type MarkAttendanceRequest = z.infer<typeof markAttendanceSchema>;
export type GetStudentAttendanceRequest = z.infer<typeof getStudentAttendanceSchema>;
export type GetClassAttendanceRequest = z.infer<typeof getClassAttendanceSchema>;
export type BulkMarkAttendanceRequest = z.infer<typeof bulkMarkAttendanceSchema>;
export type AttendanceReportRequest = z.infer<typeof attendanceReportSchema>;

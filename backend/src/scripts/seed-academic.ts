import mongoose from "mongoose";

import { env } from "../config/env.js";
import { Grade } from "../models/grade.model.js";
import { ClassLevel } from "../models/class-level.model.js";
import { Subject } from "../models/subject.model.js";
import { User } from "../models/user.model.js";
import { InstructorAssignment } from "../models/instructor.assignment.model.js";
import { hashPassword } from "../modules/auth/auth.service.js";

async function seedAcademicData() {
  await mongoose.connect(env.MONGODB_URI);

  console.log("🌱 Starting academic data seeding...");

  try {
    // 1. Create Grades (9, 10, 11, 12)
    console.log("\n📚 Creating grades...");
    const grades: Record<number, any> = {};

    for (let num = 9; num <= 12; num++) {
      const existing = await Grade.findOne({ number: num });

      if (existing) {
        grades[num] = existing;
        console.log(`  ✓ Grade ${num} already exists`);
      } else {
        const grade = await Grade.create({
          name: `Grade ${num}`,
          number: num,
          description: `Academic year grade level ${num}`,
          isActive: true
        });
        grades[num] = grade;
        console.log(`  ✓ Created Grade ${num}`);
      }
    }

    // 2. Create Class Levels (A, B, C for each grade)
    console.log("\n🏫 Creating class levels...");
    const classLevels: Record<string, any> = {};
    const sections = ["A", "B", "C"];

    for (const gradeNum of [9, 10, 11, 12]) {
      for (const section of sections) {
        const key = `${gradeNum}-${section}`;
        const existing = await ClassLevel.findOne({
          gradeId: grades[gradeNum]._id,
          section
        });

        if (existing) {
          classLevels[key] = existing;
          console.log(`  ✓ Class Level ${key} already exists`);
        } else {
          const classLevel = await ClassLevel.create({
            gradeId: grades[gradeNum]._id,
            section,
            capacity: 50,
            isActive: true
          });
          classLevels[key] = classLevel;
          console.log(`  ✓ Created Class Level ${key}`);
        }
      }
    }

    // 3. Create Subjects (Math, Physics, English, Biology, History)
    console.log("\n📖 Creating subjects...");
    const subjectNames = [
      { name: "Mathematics", code: "MATH" },
      { name: "Physics", code: "PHYS" },
      { name: "English", code: "ENG" },
      { name: "Biology", code: "BIO" },
      { name: "History", code: "HIST" },
      { name: "Chemistry", code: "CHEM" }
    ];

    const subjects: Record<string, any> = {};

    for (const gradeNum of [9, 10, 11, 12]) {
      for (const subj of subjectNames) {
        const key = `${gradeNum}-${subj.code}`;
        const existing = await Subject.findOne({
          code: subj.code,
          gradeId: grades[gradeNum]._id
        });

        if (existing) {
          subjects[key] = existing;
          console.log(`  ✓ Subject ${key} already exists`);
        } else {
          const subject = await Subject.create({
            name: subj.name,
            code: subj.code,
            gradeId: grades[gradeNum]._id,
            description: `${subj.name} for Grade ${gradeNum}`,
            isActive: true
          });
          subjects[key] = subject;
          console.log(`  ✓ Created Subject ${key}`);
        }
      }
    }

    // 4. Create Instructors
    console.log("\n👨‍🏫 Creating instructors...");
    const instructorEmails = [
      "mrs.smith@gesuba.edu.et",
      "mr.johnson@gesuba.edu.et",
      "dr.patel@gesuba.edu.et",
      "ms.williams@gesuba.edu.et"
    ];

    const instructors: any[] = [];

    for (const email of instructorEmails) {
      let instructor = await User.findOne({ email });

      if (!instructor) {
        const passwordHash = await hashPassword("Instructor123!");
        instructor = await User.create({
          email,
          passwordHash,
          role: "INSTRUCTOR",
          status: "ACTIVE",
          emailVerified: true
        });
        console.log(`  ✓ Created Instructor: ${email}`);
      } else {
        console.log(`  ✓ Instructor ${email} already exists`);
      }

      instructors.push(instructor);
    }

    // 5. Create Instructor Assignments
    console.log("\n🎓 Creating instructor assignments...");
    const academicYear = "2024-2025";

    for (let i = 0; i < instructors.length; i++) {
      const instructor = instructors[i];

      // Assign instructor to a few class levels and subjects
      for (let gradeNum = 9; gradeNum <= 10; gradeNum++) {
        // Assign to first section (A) for simplicity
        const classLevelKey = `${gradeNum}-A`;
        const subjectIndex = i % subjectNames.length;
        const subjectKey = `${gradeNum}-${subjectNames[subjectIndex].code}`;

        const existing = await InstructorAssignment.findOne({
          instructorId: instructor._id,
          classLevelId: classLevels[classLevelKey]._id,
          subjectId: subjects[subjectKey]._id,
          academicYear
        });

        if (existing) {
          console.log(
            `  ✓ Assignment exists: ${instructor.email} → ${classLevelKey} (${subjectNames[subjectIndex].name})`
          );
        } else {
          await InstructorAssignment.create({
            instructorId: instructor._id,
            classLevelId: classLevels[classLevelKey]._id,
            subjectId: subjects[subjectKey]._id,
            academicYear,
            status: "ACTIVE"
          });
          console.log(
            `  ✓ Created assignment: ${instructor.email} → ${classLevelKey} (${subjectNames[subjectIndex].name})`
          );
        }
      }
    }

    console.log("\n✅ Academic data seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`  • Grades: 4 (9-12)`);
    console.log(`  • Class Levels: 12 (3 per grade)`);
    console.log(`  • Subjects: 24 (6 per grade)`);
    console.log(`  • Instructors: ${instructors.length}`);
    console.log(`  • Academic Year: ${academicYear}`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}

seedAcademicData().catch((error) => {
  console.error(error);
  process.exit(1);
});

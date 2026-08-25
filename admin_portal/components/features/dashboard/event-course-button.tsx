"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import type { EventCourseCreditRow } from "@/lib/queries/registrations";
import { downloadCsv, slugifyFilename } from "@/lib/csv";
import { Button } from "@/components/ui/button";

interface EventCourseExportButtonProps {
  eventName: string;
  rows: EventCourseCreditRow[];
}

const HEADERS = [
  "First name",
  "Last name",
  "Student ID",
  "Email",
  "Major",
  "Course",
  "Status",
  "Registered at",
];

const ALL_COURSES = "All courses";

export function EventCourseExportButton({
  eventName,
  rows,
}: EventCourseExportButtonProps) {
  const courses = useMemo(
    () => Array.from(new Set(rows.map((r) => r.course_name))).sort(),
    [rows],
  );
  const [selectedCourse, setSelectedCourse] = useState(ALL_COURSES);

  const filteredRows =
    selectedCourse === ALL_COURSES
      ? rows
      : rows.filter((r) => r.course_name === selectedCourse);

  function handleDownload() {
    const suffix =
      selectedCourse === ALL_COURSES
        ? "course-collab"
        : `course-collab-${slugifyFilename(selectedCourse)}`;

    downloadCsv(
      `${slugifyFilename(eventName)}-${suffix}-${new Date().toISOString().slice(0, 10)}.csv`,
      HEADERS,
      filteredRows.map((r) => [
        r.first_name,
        r.last_name,
        r.student_id,
        r.email,
        r.major,
        r.course_name,
        r.status,
        r.registered_at,
      ]),
    );
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <select
        value={selectedCourse}
        onChange={(e) => setSelectedCourse(e.target.value)}
        disabled={courses.length === 0}
        className="min-h-[44px] min-w-0 flex-1 truncate rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-light text-white outline-none focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:w-auto"
      >
        <option value={ALL_COURSES} className="bg-white text-black">
          {ALL_COURSES}
        </option>
        {courses.map((course) => (
          <option key={course} value={course} className="bg-white text-black">
            {course}
          </option>
        ))}
      </select>

      <Button
        variant="outline"
        onClick={handleDownload}
        disabled={filteredRows.length === 0}
        className="shrink-0 whitespace-nowrap"
      >
        <Download className="h-4 w-4" strokeWidth={1.75} />
        Export ({filteredRows.length})
      </Button>
    </div>
  );
}

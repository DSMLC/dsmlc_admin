import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  getCourseRetention,
  getEventDetail,
  getEventFeedback,
} from "@/lib/queries/events";
import {
  getEventCourseCreditRegistrations,
  getRegistrationsByEvent,
} from "@/lib/queries/registrations";
import { formatDate } from "@/lib/date";
import { categoryColor } from "@/lib/palette";
import { StatCard } from "@/components/ui/dashboard/stat-card";
import { RsvpTurnoutChart } from "@/components/features/dashboard/graphs/rsvp-chart";
import { CourseRetentionChart } from "@/components/features/dashboard/graphs/course-retention-chart";
import { RegistrationFormDialog } from "@/components/features/dashboard/forms/registration-form-dialog";
import { EventCourseExportButton } from "@/components/features/dashboard/event-course-button";
import { CopyableId } from "@/components/ui/dashboard/event-id";
import { RegistrationsTable } from "@/components/features/dashboard/tables/registrations-table";
import { CheckInScanner } from "@/components/features/dashboard/checkin-scanner";
import { TriggerLabel } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ eventId: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function EventDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { eventId } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page ?? "1") || 1;

  const [
    event,
    feedback,
    registrationsPage,
    courseRetention,
    courseCreditRows,
  ] = await Promise.all([
    getEventDetail(eventId),
    getEventFeedback(eventId),
    getRegistrationsByEvent(eventId, currentPage),
    getCourseRetention(eventId),
    getEventCourseCreditRegistrations(eventId),
  ]);

  if (!event) notFound();

  const catColor = categoryColor(event.event_type);

  return (
    <div>
      <div className="mb-6 flex flex-col items-start gap-4">
        <Link
          href="/dashboard/events"
          aria-label="Back to events"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] text-[#c0c0c0] transition-colors hover:border-white/30 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>

        <div>
          <div className="mb-2 flex items-center gap-3">
            <span
              className="rounded-full border px-2.5 py-1 text-xs"
              style={{ borderColor: `${catColor}66`, color: catColor }}
            >
              {event.event_type}
            </span>
            <span className="text-xs font-light text-[#8a8a8a]">
              {formatDate(event.event_date)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#f2f2f2]">
              {event.event_name}
            </h1>
            <CopyableId value={event.event_id} label="event_id" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          index={0}
          label="Turnout Rate"
          value={`${event.turnoutRate}%`}
        />
        <StatCard
          index={1}
          label="Avg. Rating"
          value={event.avgRating !== null ? `★ ${event.avgRating}` : "—"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[14px] border border-[#1e1e1e] bg-[#111111] p-6">
          <h2 className="mb-4 text-sm font-light text-[#9a9a9a]">
            RSVP vs. Actual
          </h2>
          <RsvpTurnoutChart
            data={[
              {
                label: event.event_name,
                rsvp: event.rsvp,
                attended: event.attended,
                atDoor: event.atDoor,
              },
            ]}
          />
        </div>

        <div className="rounded-[14px] border border-[#1e1e1e] bg-[#111111] p-6">
          <h2 className="mb-4 text-sm font-light text-[#9a9a9a]">
            Feedback ({feedback.length} responses)
          </h2>
          <div className="max-h-[260px] space-y-4 overflow-y-auto pr-1">
            {feedback.map((f) => (
              <div
                key={f.feedback_id}
                className="border-b border-[#191919] pb-4 last:border-0 last:pb-0"
              >
                <div className="mb-1 flex items-center gap-2 text-sm text-[#f2f2f2]">
                  <span className="text-brand">★</span>
                  {f.rating}
                </div>
                {f.comment && (
                  <p className="text-sm font-light text-[#9a9a9a]">
                    &ldquo;{f.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
            {feedback.length === 0 && (
              <p className="text-sm font-light text-[#8a8a8a]">
                No feedback submitted for this event yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {courseRetention.courseGroup.total > 0 && (
        <div className="mt-6 rounded-[14px] border border-[#1e1e1e] bg-[#111111] p-6">
          <h2 className="mb-1 text-sm font-light text-[#9a9a9a]">
            Course Collab Retention
          </h2>
          <p className="mb-4 text-xs font-light text-[#8a8a8a]">
            Attendance rate for registrants who signed up for course credit vs.
            everyone else.
          </p>
          <CourseRetentionChart
            courseGroup={courseRetention.courseGroup}
            generalGroup={courseRetention.generalGroup}
          />
        </div>
      )}

      <div className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-light text-[#9a9a9a]">Registrations</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <CheckInScanner eventId={event.event_id} />
            <EventCourseExportButton
              eventName={event.event_name}
              rows={courseCreditRows}
            />
            <RegistrationFormDialog
              mode="create"
              eventId={event.event_id}
              trigger={
                <TriggerLabel variant="primary">
                  + Add registration
                </TriggerLabel>
              }
            />
          </div>
        </div>

        <RegistrationsTable
          eventId={event.event_id}
          registrations={registrationsPage.registrations}
          currentPage={registrationsPage.page}
          totalPages={registrationsPage.totalPages}
        />
      </div>
    </div>
  );
}

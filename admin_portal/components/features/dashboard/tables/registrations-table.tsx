"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/dashboard/data-table";
import { RegistrationFormDialog } from "@/components/features/dashboard/forms/registration-form-dialog";
import { TriggerLabel } from "@/components/ui/button";
import { statusColor } from "@/lib/palette";
import type { RegistrationRow } from "@/lib/queries/registrations";

interface RegistrationsTableProps {
  eventId: string;
  registrations: RegistrationRow[];
  currentPage: number;
  totalPages: number;
}

export function RegistrationsTable({
  eventId,
  registrations,
  currentPage,
  totalPages,
}: RegistrationsTableProps) {
  const columns: DataTableColumn<RegistrationRow>[] = [
    {
      id: "name",
      header: "Name",
      width: "18%",
      render: (r) => `${r.first_name} ${r.last_name}`,
    },
    {
      id: "email",
      header: "Email",
      width: "24%",
      render: (r) => r.email,
      className: "px-6 py-4 text-[#8a8a8a]",
    },
    {
      id: "status",
      header: "Status",
      width: "16%",
      render: (r) => {
        const color = statusColor(r.status);
        return (
          <span
            className="inline-block shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs capitalize"
            style={{ borderColor: `${color}66`, color }}
          >
            {r.status.replace("-", " ")}
          </span>
        );
      },
      className: "px-6 py-4",
    },
    {
      id: "course_credit",
      header: "Course credit",
      width: "16%",
      render: (r) => r.course_name ?? "—",
      className: "px-6 py-4 text-[#8a8a8a]",
    },
    {
      id: "source",
      header: "Source",
      width: "14%",
      render: (r) => r.coming_from ?? "—",
      className: "px-6 py-4 text-[#8a8a8a]",
    },
    {
      id: "actions",
      header: "",
      width: "12%",
      render: (r) => (
        <RegistrationFormDialog
          mode="edit"
          eventId={eventId}
          registration={r}
          trigger={
            <TriggerLabel
              variant="secondary"
              className="shrink-0 whitespace-nowrap px-4 py-1.5 text-xs"
            >
              Edit
            </TriggerLabel>
          }
        />
      ),
      className: "px-6 py-4 text-right",
    },
  ];

  return (
    <DataTable
      data={registrations}
      columns={columns}
      getRowKey={(r) => r.registration_id}
      minWidth="640px"
      emptyMessage="No registrations match your search."
      search={{
        placeholder: "Search registrations...",
        filterFn: (r, query) => {
          const q = query.toLowerCase();
          const fullName = `${r.first_name} ${r.last_name}`.toLowerCase();
          return (
            fullName.includes(q) ||
            r.first_name.toLowerCase().includes(q) ||
            r.last_name.toLowerCase().includes(q) ||
            r.email.toLowerCase().includes(q)
          );
        },
      }}
      filters={[
        {
          id: "status",
          label: "Status",
          getValue: (r) => r.status.replace("-", " "),
        },
        {
          id: "course_credit",
          label: "Course",
          getValue: (r) => r.course_name ?? "No course credit",
        },
        {
          id: "source",
          label: "Source",
          getValue: (r) => r.coming_from ?? "Unknown",
        },
      ]}
      pagination={{
        currentPage,
        totalPages,
        basePath: `/dashboard/events/${eventId}`,
      }}
    />
  );
}

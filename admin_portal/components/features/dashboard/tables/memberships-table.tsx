"use client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/dashboard/data-table";
import { MemberFormDialog } from "@/components/features/dashboard/forms/member-form-dialog";
import { MemberQrDialog } from "@/components/features/dashboard/forms/member-qr-dialog";
import { TriggerLabel } from "@/components/ui/button";
import type { MemberRow } from "@/lib/queries/members";

const columns: DataTableColumn<MemberRow>[] = [
  {
    id: "name",
    header: "Name",
    width: "20%",
    render: (member) => `${member.first_name} ${member.last_name}`,
  },
  {
    id: "email",
    header: "Email",
    width: "26%",
    render: (member) => member.email,
    className: "px-6 py-4 text-white/50",
  },
  {
    id: "student_id",
    header: "Student ID",
    width: "14%",
    render: (member) => member.student_id ?? "—",
    className: "px-6 py-4 text-white/50",
  },
  {
    id: "type",
    header: "Type",
    width: "12%",
    render: (member) => member.membership_type,
    className: "px-6 py-4 text-white/50",
  },
  {
    id: "mailing",
    header: "Mailing",
    width: "16%",
    render: (member) => (
      <span
        className={
          member.mailing
            ? "rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-400"
            : "rounded-full bg-white/5 px-2 py-1 text-xs text-white/40"
        }
      >
        {member.mailing ? "Subscribed" : "Not subscribed"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    width: "16%",
    render: (member) => (
      <div className="flex justify-end gap-2">
        <MemberQrDialog
          qrToken={member.qr_token}
          memberName={`${member.first_name} ${member.last_name}`}
          membershipType={member.membership_type}
        />
        <MemberFormDialog
          mode="edit"
          member={member}
          trigger={
            <TriggerLabel variant="secondary" className="px-4 py-1.5 text-xs">
              Edit
            </TriggerLabel>
          }
        />
      </div>
    ),
    className: "px-6 py-4 text-right",
  },
];

interface MembershipsTableProps {
  members: MemberRow[];
}

export function MembershipsTable({ members }: MembershipsTableProps) {
  return (
    <DataTable
      data={members}
      columns={columns}
      getRowKey={(member) => member.membership_id}
      minWidth="720px"
      emptyMessage="No members match your search."
      search={{
        placeholder: "Search members...",
        filterFn: (member, query) => {
          const q = query.toLowerCase();
          const fullName =
            `${member.first_name} ${member.last_name}`.toLowerCase();
          return (
            fullName.includes(q) ||
            member.first_name.toLowerCase().includes(q) ||
            member.last_name.toLowerCase().includes(q) ||
            member.email.toLowerCase().includes(q)
          );
        },
      }}
      filters={[
        {
          id: "type",
          label: "Type",
          getValue: (member) => member.membership_type,
        },
        {
          id: "mailing",
          label: "Mailing",
          getValue: (member) =>
            member.mailing ? "Subscribed" : "Not subscribed",
        },
      ]}
    />
  );
}

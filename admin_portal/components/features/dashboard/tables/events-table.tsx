"use client";

import Link from "next/link";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/dashboard/data-table";
import { categoryColor } from "@/lib/palette";
import { formatDate } from "@/lib/date";

interface EventRow {
  event_id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  rsvp: number;
  attended: number;
  atDoor: number;
  turnoutRate: number;
  avgRating: number | null;
}

interface EventsTableProps {
  events: EventRow[];
}

const columns: DataTableColumn<EventRow>[] = [
  {
    id: "event",
    header: "Event",
    width: "24%",
    render: (event) => (
      <Link
        href={`/dashboard/events/${event.event_id}`}
        className="text-[#f2f2f2] transition-colors hover:text-brand"
      >
        {event.event_name}
      </Link>
    ),
  },
  {
    id: "category",
    header: "Category",
    width: "18%",
    render: (event) => {
      const color = categoryColor(event.event_type);
      return (
        <span
          className="inline-block shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs"
          style={{ borderColor: `${color}66`, color }}
        >
          {event.event_type}
        </span>
      );
    },
  },
  {
    id: "date",
    header: "Date",
    width: "11%",
    render: (event) => formatDate(event.event_date),
    className: "px-6 py-4 text-[#8a8a8a]",
  },
  {
    id: "rsvp_atdoor_att",
    header: "RSVP / At-door / ATT.",
    width: "19%",
    render: (event) =>
      `${event.rsvp} / ${event.atDoor ?? 0} / ${event.attended}`,
    className: "px-6 py-4 text-[#8a8a8a]",
  },
  {
    id: "turnout",
    header: "Turnout",
    width: "14%",
    render: (event) => `${event.turnoutRate}%`,
    className: "px-6 py-4 text-[#8a8a8a]",
  },
  {
    id: "rating",
    header: "Rating",
    width: "14%",
    render: (event) =>
      event.avgRating !== null ? `★ ${event.avgRating}` : "—",
    className: "px-6 py-4 text-[#8a8a8a]",
  },
];

export function EventsTable({ events }: EventsTableProps) {
  return (
    <DataTable
      data={events}
      columns={columns}
      getRowKey={(event) => event.event_id}
      minWidth="760px"
      emptyMessage="No events match your search."
      search={{
        placeholder: "Search events...",
        filterFn: (event, query) =>
          event.event_name.toLowerCase().includes(query.toLowerCase()),
      }}
      filters={[
        {
          id: "category",
          label: "Category",
          getValue: (event) => event.event_type,
        },
      ]}
    />
  );
}

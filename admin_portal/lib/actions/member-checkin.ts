"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface CheckInResult {
  status: "checked_in" | "already_checked_in" | "not_found" | "error"
  name?: string
  message?: string
}

export async function checkInByToken(eventId: string, token: string): Promise<CheckInResult> {
  if (!token) return { status: "not_found", message: "No QR code detected." }

  const supabase = await createClient()

  const { data: membership, error: membershipError } = await supabase
    .from("MEMBERSHIP")
    .select("people_id, PEOPLE(first_name, last_name)")
    .eq("qr_token", token)
    .maybeSingle()

  if (membershipError || !membership) {
    return { status: "not_found", message: "This QR code doesn't match any member on file." }
  }

  const person = Array.isArray(membership.PEOPLE) ? membership.PEOPLE[0] : membership.PEOPLE
  if (!person) {
    return { status: "not_found", message: "This QR code doesn't match any member on file." }
  }

  const name = `${person.first_name} ${person.last_name}`
  const peopleId = membership.people_id

  const { data: existing } = await supabase
    .from("REGISTRATIONS")
    .select("registration_id, status")
    .eq("event_id", eventId)
    .eq("people_id", peopleId)
    .maybeSingle()

  if (existing) {
    if (existing.status === "attended" || existing.status === "at-door") {
      return { status: "already_checked_in", name }
    }

    const { error } = await supabase
      .from("REGISTRATIONS")
      .update({ status: "attended" })
      .eq("registration_id", existing.registration_id)

    if (error) return { status: "error", message: error.message }
  } else {
    const { error } = await supabase.from("REGISTRATIONS").insert({
      event_id: eventId,
      people_id: peopleId,
      status: "at-door",
      course_name: null,
      coming_from: "Member",
      registered_at: new Date().toISOString(),
    })

    if (error) {
      if (error.code === "23505") return { status: "already_checked_in", name }
      return { status: "error", message: error.message }
    }
  }

  revalidatePath(`/dashboard/events/${eventId}`)
  revalidatePath("/dashboard/people")
  return { status: "checked_in", name }
}
import { createClient } from "@/lib/supabase/server"

export interface MemberRow {
  people_id: string
  first_name: string
  last_name: string
  email: string
  student_id: string | null
  major: string | null
  membership_id: string
  membership_type: string
  mailing: boolean
  expires_at: string | null
  created_at: string
  qr_token: string
}

export async function getMembers(): Promise<MemberRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("MEMBERSHIP")
    .select(
      "membership_id, membership_type, mailing, expires_at, created_at, qr_token, people_id, PEOPLE(people_id, first_name, last_name, email, student_id, major)"
    )
    .order("created_at", { ascending: false })

  if (error || !data) return []

  return data
    .map((row: any) => {
      const person = Array.isArray(row.PEOPLE) ? row.PEOPLE[0] : row.PEOPLE
      if (!person) return null
      return {
        people_id: person.people_id,
        first_name: person.first_name,
        last_name: person.last_name,
        email: person.email,
        student_id: person.student_id,
        major: person.major,
        membership_id: row.membership_id,
        membership_type: row.membership_type,
        mailing: row.mailing,
        expires_at: row.expires_at,
        created_at: row.created_at,
        qr_token: row.qr_token,
      } satisfies MemberRow
    })
    .filter((m): m is MemberRow => m !== null)
}
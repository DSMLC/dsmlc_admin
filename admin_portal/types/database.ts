export interface Admin {
  admin_id: string // references auth.users.id
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  deactivated_at: string | null
}

export interface Event {
  event_id: string
  event_name: string
  event_date: string
  event_type: string
  created_at: string
  admin_id: string
}

export interface Person {
  people_id: string
  first_name: string
  last_name: string
  student_id: string | null
  email: string
  major: string | null
}

export interface Feedback {
  feedback_id: string
  event_id: string
  rating: number
  comment: string | null
  created_at: string
}

export interface Registration {
  registration_id: string
  event_id: string
  people_id: string
  status: string
  course_name: string | null
  coming_from: string | null
  registered_at: string
}

export interface Membership {
  membership_id: string
  people_id: string
  membership_type: string
  created_at: string
  expires_at: string | null
  mailing: boolean
  qr_token: string 
}
export type Shift = {
  id: number
  name: string
  startTime: string // ISO 8601 format
  endTime: string // ISO 8601 format
}

export type ShiftWithUser = Shift & {
  userId: number
  user: {
    id: number
    name: string
    email: string
    role: string
  }
}

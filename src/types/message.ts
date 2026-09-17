export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface Message {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  read: boolean
  createdAt: string
}
// This is a mock database utility for demonstration purposes.
// In a real application, you would use a database like Supabase, Neon, or Vercel Postgres.

interface User {
  id: string
  role: "employer" | "job-seeker"
  companyName?: string
  fullName: string
  email: string
}

// We'll pre-populate with a couple of users for testing the login.
const users: User[] = [
  {
    id: "usr_employer_1",
    role: "employer",
    companyName: "Acme Inc.",
    fullName: "John Employer",
    email: "employer@unison.ai",
  },
  {
    id: "usr_employee_1",
    role: "job-seeker",
    fullName: "Jane Employee",
    email: "job-seeker@unison.ai",
  },
]

export async function createUser(data: Omit<User, "id" | "password">): Promise<User> {
  // Check if user already exists
  if (users.some((u) => u.email === data.email)) {
    throw new Error("User with this email already exists.")
  }

  const newUser: User = {
    id: `usr_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
  }
  users.push(newUser)
  console.log("Current users:", users)
  return newUser
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  console.log("Searching for user with email:", email)
  console.log("Current users in DB:", users)
  return users.find((user) => user.email === email)
}

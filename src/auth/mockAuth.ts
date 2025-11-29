export type Role = 'instructor' | 'student'

export interface UserRecord {
  id: string
  username: string
  password: string
  role: Role
  name?: string
}

export interface OneUseCode {
  code: string
  studentId?: string // assigned when used
  used: boolean
}

function uuid() {
  // simple UUID-like generator for testing
  return 'xxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Seeded test users: 1 instructor, 3 students
const instructor: UserRecord = { id: uuid(), username: 'instructor', password: 'instrpass', role: 'instructor', name: 'Instructor One' }
const students: UserRecord[] = [
  { id: uuid(), username: 'student1', password: 'student1pass', role: 'student', name: 'Alice' },
  { id: uuid(), username: 'student2', password: 'student2pass', role: 'student', name: 'Bob' },
  { id: uuid(), username: 'student3', password: 'student3pass', role: 'student', name: 'Charlie' }
]

// For student initial registration, instructors can create one-use codes.
// We'll pre-create three codes for testing.
const codes: OneUseCode[] = [
  { code: 'CODE-ALPHA-1', used: false },
  { code: 'CODE-BETA-1', used: false },
  { code: 'CODE-GAMMA-1', used: false }
]

// In-memory store for this mock backend
// Persisted storage keys
const USERS_LS = 'virtuoso_mock_users'
const CODES_LS = 'virtuoso_mock_codes'

function saveState() {
  try {
    localStorage.setItem(USERS_LS, JSON.stringify(users))
    localStorage.setItem(CODES_LS, JSON.stringify(codes))
  } catch {
    // ignore
  }
}

// hydrate from localStorage if available
let users: UserRecord[] = []
try {
  const raw = localStorage.getItem(USERS_LS)
  if (raw) {
    users = JSON.parse(raw) as UserRecord[]
  } else {
    users = [instructor, ...students]
    saveState()
  }
} catch {
  users = [instructor, ...students]
}

export const mockAuth = {
  findUserByUsername(username: string) {
    return users.find(u => u.username === username) || null
  },
  validateLogin(username: string, password: string) {
    const u = users.find(x => x.username === username && x.password === password)
    return u || null
  },
  // Register a new student account using a one-use code. Returns the created user or error string.
  registerStudentWithCode(username: string, password: string, name: string, code: string) {
    const existing = users.find(u => u.username === username)
    if (existing) return { error: 'username_exists' }
    const found = codes.find(c => c.code === code)
    if (!found) return { error: 'invalid_code' }
    if (found.used) return { error: 'code_used' }
    const newUser: UserRecord = { id: uuid(), username, password, role: 'student', name }
    users.push(newUser)
    found.used = true
    found.studentId = newUser.id
    saveState()
    return { user: newUser }
  },
  // Instructor creates one-use code
  createOneUseCode() {
    const newCode = { code: 'CODE-' + Math.random().toString(36).slice(2, 9).toUpperCase(), used: false }
    codes.push(newCode)
    saveState()
    return newCode
  },
  listCodes() {
    return codes.slice()
  },
  listStudents() {
    return users.filter(u => u.role === 'student')
  },
  listAllUsers() {
    return users.slice()
  }
}

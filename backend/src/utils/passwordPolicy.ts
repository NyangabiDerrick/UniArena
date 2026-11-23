// Length alone lets "password123" through. This also blocks the most common choices and obvious patterns.
export const MIN_PASSWORD_LENGTH = 10

const COMMON = new Set([
  'password', 'password1', 'password12', 'password123', 'password1234', 'passw0rd', 'p@ssw0rd', 'p@ssword',
  '1234567890', '123456789', '12345678', '0123456789', '1111111111', '0000000000', '1234512345', '123123123',
  'qwertyuiop', 'qwerty123', 'qwerty1234', 'qwertyuiop1', 'asdfghjkl', 'asdfghjkl1', 'zxcvbnm123', '1q2w3e4r5t',
  'iloveyou', 'iloveyou1', 'iloveyou123', 'letmein123', 'welcome123', 'welcome1234', 'admin12345', 'administrator',
  'changeme', 'changeme123', 'abc1234567', 'abcdefghij', 'abcd123456', 'monkey1234', 'dragon1234', 'football123',
  'football1', 'baseball123', 'superman123', 'princess123', 'sunshine123', 'master1234', 'shadow1234', 'trustno1',
  'student123', 'student1234', 'university', 'university1', 'university123', 'uniarena', 'uniarena123', 'uniarena1234',
  'mylife123', 'mku123456', 'mkuniversity', 'kenya12345', 'nairobi123', 'google12345', 'whatever123', 'freedom123'
])

// Returns a message when the password is not acceptable, or null when it is fine.
export const passwordProblem = (password: string, email?: string): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  if (password.length > 100) return 'Password must be 100 characters or fewer'
  const lower = password.toLowerCase()
  if (COMMON.has(lower)) return 'That password is too common. Choose something harder to guess'
  if (/^(.)\1+$/.test(password)) return 'Password cannot be one repeated character'
  if (/^(0123456789|1234567890|abcdefghij|qwertyuiop)/.test(lower)) return 'Password cannot be a simple sequence'
  const local = email?.split('@')[0]?.toLowerCase()
  if (local && local.length >= 5 && lower.includes(local)) return 'Password cannot contain your registration number'
  return null
}

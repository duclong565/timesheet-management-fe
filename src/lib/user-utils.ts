/**
 * Universal user data extraction utility
 * Handles API response wrappers and provides fallback strategies for user information
 */

interface ApiResponseWrapper {
  success: boolean;
  message: string;
  data: unknown;
  timestamp?: string;
}

interface ExtractedUserData {
  name: string;
  email: string;
}

/**
 * Extracts user data from various API response formats
 * @param userObject - The user object from auth state or API response
 * @returns Extracted user data with name and email
 */
export function extractUserData(userObject: unknown): ExtractedUserData | null {
  if (!userObject) return null;

  // Handle API response wrapper - extract actual user data
  let actualUser: unknown = userObject;

  // Check if this is an API response wrapper with nested data
  if (userObject && typeof userObject === 'object' && 'data' in userObject) {
    const apiResponse = userObject as unknown as ApiResponseWrapper;
    actualUser = apiResponse.data;
  }

  if (!actualUser || typeof actualUser !== 'object') {
    return null;
  }

  const user = actualUser as Record<string, unknown>;

  return {
    name: extractUserName(user),
    email: extractUserEmail(user),
  };
}

/**
 * Extracts user's display name using multiple fallback strategies
 */
function extractUserName(user: Record<string, unknown>): string {
  // Strategy 1: name + surname
  if (user.name && user.surname) {
    return `${user.name} ${user.surname}`.trim();
  }

  // Strategy 2: name only
  if (user.name) {
    return String(user.name);
  }

  // Strategy 3: username
  if (user.username) {
    return String(user.username);
  }

  // Strategy 4: email prefix
  if (user.email && typeof user.email === 'string') {
    return user.email.split('@')[0];
  }

  // Strategy 5: any string field that looks like a name
  const possibleNameFields = [
    'fullName',
    'displayName',
    'firstName',
    'lastName',
  ];
  for (const field of possibleNameFields) {
    if (user[field]) {
      return String(user[field]);
    }
  }

  return 'User';
}

/**
 * Extracts user's email with fallback
 */
function extractUserEmail(user: Record<string, unknown>): string {
  return user?.email && typeof user.email === 'string'
    ? user.email
    : 'user@example.com';
}

/**
 * Check if user object exists and contains valid data
 */
export function hasValidUserData(userObject: unknown): boolean {
  const extracted = extractUserData(userObject);
  return extracted !== null;
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if code is running on the client side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if code is running on the server side
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Safely access localStorage
 */
export function safeLocalStorage() {
  if (!isClient()) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return localStorage;
}

/**
 * Safely access sessionStorage
 */
export function safeSessionStorage() {
  if (!isClient()) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return sessionStorage;
}

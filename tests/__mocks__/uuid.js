/**
 * Mock for uuid package
 * Provides predictable UUIDs for testing
 */

let counter = 0;

export function v4() {
  counter++;
  return `00000000-0000-0000-0000-${String(counter).padStart(12, '0')}`;
}

export function reset() {
  counter = 0;
}

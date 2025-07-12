// Test setup and utilities
/// <reference types="jest" />

declare const global: any;

// Helper to create test context items
export const createTestContextItem = (overrides = {}) => ({
  id: 'test-id',
  name: 'Test Item',
  content: 'Test content',
  type: 'text' as const,
  tags: ['test'],
  timestamp: new Date('2025-01-01T00:00:00Z'),
  created: new Date('2025-01-01T00:00:00Z'),
  updated: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

// Helper to create valid tool arguments
export const createValidAddContextArgs = (overrides = {}) => ({
  name: 'Test Context',
  content: 'This is test content',
  type: 'text' as const,
  tags: ['test', 'example'],
  ...overrides,
});

// Mock date for consistent testing
export const mockDate = new Date('2025-01-01T00:00:00Z');

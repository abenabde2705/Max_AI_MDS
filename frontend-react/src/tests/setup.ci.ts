import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Configuration globale pour les tests React
beforeAll(() => {
  // Mock des APIs qui ne sont pas disponibles dans jsdom
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock
  });

  // Mock fetch
  globalThis.fetch = vi.fn();
});

// Nettoyer après chaque test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
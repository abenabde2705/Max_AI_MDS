import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock des modules problématiques
vi.mock('webidl-conversions', () => ({
  default: {},
  __esModule: true
}));

vi.mock('whatwg-url', () => ({
  URL: class URL {
    href: string;
    constructor(url: string) {
      this.href = url;
    }
  },
  __esModule: true
}));

// Configuration globale pour les tests React
beforeAll(() => {
  // Mock scrollIntoView (non implémenté dans jsdom)
  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  // Mock des APIs qui ne sont pas disponibles dans jsdom
  Object.defineProperty(window, 'matchMedia', {
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
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock fetch
  global.fetch = vi.fn();
});

// Nettoyer après chaque test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

import '@testing-library/jest-dom';

// Mock AuthContext so components using useAuth() don’t crash in tests
jest.mock('./context/AuthContext', () => ({
  // Mock the hook
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  // Mock the provider to just render children
  AuthProvider: ({ children }) => children,
}));

// Mock axios for all tests to avoid importing ESM build from node_modules
jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  };
  return {
    __esModule: true,
    default: { create: () => mockInstance },
    create: () => mockInstance,
  };
});

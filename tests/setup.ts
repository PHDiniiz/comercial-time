/**
 * Setup global para testes
 */

// Configurações globais para testes
beforeAll(() => {
  // Configurar timezone para testes consistentes
  process.env.TZ = 'UTC';
});

afterAll(() => {
  // Cleanup após todos os testes
});

// Mock de console para testes mais limpos
const originalConsole = console;
beforeEach(() => {
  // Limpar mocks antes de cada teste
});

afterEach(() => {
  // Restaurar console após cada teste
  console = originalConsole;
});

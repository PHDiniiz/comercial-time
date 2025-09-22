/**
 * Security Layer - Rate Limiter
 *
 * Implementação de rate limiting para prevenir ataques de DoS
 * e abuso da API.
 */

/**
 * Implementação de rate limiting para prevenir ataques de DoS e abuso da API.
 * Utiliza sliding window para controlar o número de requisições por período.
 */
export class RateLimiter {
  private readonly requests: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  /**
   * Constrói uma nova instância do rate limiter.
   * @param maxRequests - Número máximo de requisições permitidas (padrão: 100)
   * @param windowMs - Janela de tempo em milissegundos (padrão: 60000ms = 1 minuto)
   */
  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Verifica se uma requisição pode ser processada baseada no rate limit.
   * @param identifier - Identificador único da requisição (ex: IP, user ID)
   * @returns true se a requisição for permitida, false se exceder o limite
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove requisições antigas
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    // Verifica se excedeu o limite
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Adiciona a nova requisição
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  /**
   * Limpa requisições antigas para economizar memória.
   * Remove entradas de identificadores que não têm requisições válidas.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        (time) => now - time < this.windowMs
      );
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }

  /**
   * Obtém estatísticas de uso para um identificador específico.
   * @param identifier - Identificador para obter estatísticas
   * @returns Objeto com contagem de requisições e tempo de reset
   */
  getStats(identifier: string): { count: number; resetTime: number } {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    const oldestRequest =
      validRequests.length > 0 ? Math.min(...validRequests) : now;
    const resetTime = oldestRequest + this.windowMs;

    return {
      count: validRequests.length,
      resetTime,
    };
  }
}

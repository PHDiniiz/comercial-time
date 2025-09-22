/**
 * Security Layer - Advanced Rate Limiter com Debounce
 *
 * Implementação avançada de rate limiting que inclui:
 * - Rate Limiting tradicional (sliding window)
 * - Debounce para operações frequentes
 * - Circuit Breaker para proteção contra falhas
 * - Throttling para suavizar picos de tráfego
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  debounceMs?: number;
  throttleMs?: number;
  circuitBreakerThreshold?: number;
  circuitBreakerTimeout?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: "rate_limit" | "debounce" | "throttle" | "circuit_breaker";
  retryAfter?: number;
  stats: {
    count: number;
    resetTime: number;
    debounceTime?: number;
  };
}

export class AdvancedRateLimiter {
  private readonly requests: Map<string, number[]> = new Map();
  private readonly lastRequest: Map<string, number> = new Map();
  private readonly circuitBreaker: Map<
    string,
    {
      failures: number;
      lastFailure: number;
      state: "closed" | "open" | "half-open";
    }
  > = new Map();
  private readonly config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      maxRequests: config.maxRequests,
      windowMs: config.windowMs,
      debounceMs: config.debounceMs ?? 1000, // 1 segundo por padrão
      throttleMs: config.throttleMs ?? 100, // 100ms por padrão
      circuitBreakerThreshold: config.circuitBreakerThreshold ?? 5,
      circuitBreakerTimeout: config.circuitBreakerTimeout ?? 30000, // 30 segundos
    };
  }

  /**
   * Verifica se uma requisição pode ser processada com todas as proteções
   */
  isAllowed(identifier: string): RateLimitResult {
    const now = Date.now();

    // 1. Circuit Breaker Check
    const circuitResult = this.checkCircuitBreaker(identifier, now);
    if (!circuitResult.allowed) {
      return circuitResult;
    }

    // 2. Debounce Check
    const debounceResult = this.checkDebounce(identifier, now);
    if (!debounceResult.allowed) {
      return debounceResult;
    }

    // 3. Throttle Check
    const throttleResult = this.checkThrottle(identifier, now);
    if (!throttleResult.allowed) {
      return throttleResult;
    }

    // 4. Rate Limit Check (Sliding Window)
    const rateLimitResult = this.checkRateLimit(identifier, now);
    if (!rateLimitResult.allowed) {
      return rateLimitResult;
    }

    // Todas as verificações passaram
    this.recordRequest(identifier, now);
    return {
      allowed: true,
      stats: this.getStats(identifier, now),
    };
  }

  /**
   * Circuit Breaker - Protege contra falhas em cascata
   */
  private checkCircuitBreaker(
    identifier: string,
    now: number
  ): RateLimitResult {
    const breaker = this.circuitBreaker.get(identifier);

    if (!breaker) {
      this.circuitBreaker.set(identifier, {
        failures: 0,
        lastFailure: 0,
        state: "closed",
      });
      return { allowed: true, stats: this.getStats(identifier, now) };
    }

    // Se o circuit breaker está aberto, verifica se pode tentar novamente
    if (breaker.state === "open") {
      if (now - breaker.lastFailure > this.config.circuitBreakerTimeout) {
        breaker.state = "half-open";
        return { allowed: true, stats: this.getStats(identifier, now) };
      }

      return {
        allowed: false,
        reason: "circuit_breaker",
        retryAfter:
          this.config.circuitBreakerTimeout - (now - breaker.lastFailure),
        stats: this.getStats(identifier, now),
      };
    }

    return { allowed: true, stats: this.getStats(identifier, now) };
  }

  /**
   * Debounce - Previne operações muito frequentes
   */
  private checkDebounce(identifier: string, now: number): RateLimitResult {
    const lastRequestTime = this.lastRequest.get(identifier);

    if (lastRequestTime && now - lastRequestTime < this.config.debounceMs) {
      return {
        allowed: false,
        reason: "debounce",
        retryAfter: this.config.debounceMs - (now - lastRequestTime),
        stats: {
          ...this.getStats(identifier, now),
          debounceTime: this.config.debounceMs - (now - lastRequestTime),
        },
      };
    }

    return { allowed: true, stats: this.getStats(identifier, now) };
  }

  /**
   * Throttle - Suaviza picos de tráfego
   */
  private checkThrottle(identifier: string, now: number): RateLimitResult {
    const lastRequestTime = this.lastRequest.get(identifier);

    if (lastRequestTime && now - lastRequestTime < this.config.throttleMs) {
      return {
        allowed: false,
        reason: "throttle",
        retryAfter: this.config.throttleMs - (now - lastRequestTime),
        stats: this.getStats(identifier, now),
      };
    }

    return { allowed: true, stats: this.getStats(identifier, now) };
  }

  /**
   * Rate Limit - Sliding Window tradicional
   */
  private checkRateLimit(identifier: string, now: number): RateLimitResult {
    const requests = this.requests.get(identifier) || [];

    // Remove requisições antigas (sliding window)
    const validRequests = requests.filter(
      (time) => now - time < this.config.windowMs
    );

    // Verifica se excedeu o limite
    if (validRequests.length >= this.config.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = oldestRequest + this.config.windowMs;

      return {
        allowed: false,
        reason: "rate_limit",
        retryAfter: resetTime - now,
        stats: {
          count: validRequests.length,
          resetTime,
        },
      };
    }

    return { allowed: true, stats: this.getStats(identifier, now) };
  }

  /**
   * Registra uma requisição bem-sucedida
   */
  private recordRequest(identifier: string, now: number): void {
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(
      (time) => now - time < this.config.windowMs
    );
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    this.lastRequest.set(identifier, now);

    // Reset circuit breaker em caso de sucesso
    const breaker = this.circuitBreaker.get(identifier);
    if (breaker && breaker.state === "half-open") {
      breaker.failures = 0;
      breaker.state = "closed";
    }
  }

  /**
   * Registra uma falha (para circuit breaker)
   */
  recordFailure(identifier: string): void {
    const breaker = this.circuitBreaker.get(identifier);
    if (breaker) {
      breaker.failures++;
      breaker.lastFailure = Date.now();

      if (breaker.failures >= this.config.circuitBreakerThreshold) {
        breaker.state = "open";
      }
    } else {
      this.circuitBreaker.set(identifier, {
        failures: 1,
        lastFailure: Date.now(),
        state: "closed",
      });
    }
  }

  /**
   * Obtém estatísticas detalhadas
   */
  private getStats(
    identifier: string,
    now: number
  ): { count: number; resetTime: number } {
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(
      (time) => now - time < this.config.windowMs
    );

    const oldestRequest =
      validRequests.length > 0 ? Math.min(...validRequests) : now;
    const resetTime = oldestRequest + this.config.windowMs;

    return {
      count: validRequests.length,
      resetTime,
    };
  }

  /**
   * Limpeza de memória
   */
  cleanup(): void {
    const now = Date.now();

    // Limpa requisições antigas
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        (time) => now - time < this.config.windowMs
      );
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
        this.lastRequest.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }

    // Limpa circuit breakers antigos
    for (const [identifier, breaker] of this.circuitBreaker.entries()) {
      if (
        breaker.state === "open" &&
        now - breaker.lastFailure > this.config.circuitBreakerTimeout * 2
      ) {
        this.circuitBreaker.delete(identifier);
      }
    }
  }

  /**
   * Obtém estatísticas globais
   */
  getGlobalStats(): {
    activeIdentifiers: number;
    totalRequests: number;
    circuitBreakersOpen: number;
  } {
    const now = Date.now();
    let totalRequests = 0;
    let circuitBreakersOpen = 0;

    for (const requests of this.requests.values()) {
      totalRequests += requests.filter(
        (time) => now - time < this.config.windowMs
      ).length;
    }

    for (const breaker of this.circuitBreaker.values()) {
      if (breaker.state === "open") {
        circuitBreakersOpen++;
      }
    }

    return {
      activeIdentifiers: this.requests.size,
      totalRequests,
      circuitBreakersOpen,
    };
  }
}

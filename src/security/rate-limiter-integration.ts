/**
 * Security Layer - Integração do Rate Limiter
 *
 * Exemplos práticos de como integrar o rate limiter
 * com diferentes cenários de uso.
 */

import {
  AdvancedRateLimiter,
  type RateLimitConfig,
} from "./advanced-rate-limiter.js";
import { InputValidator } from "./validators/input.validator.js";

// Configurações para diferentes cenários
export const RATE_LIMIT_CONFIGS = {
  // Para operações de horário comercial (menos restritivo)
  HORARIO_COMERCIAL: {
    maxRequests: 1000, // 1000 requests por minuto
    windowMs: 60000, // 1 minuto
    debounceMs: 100, // 100ms de debounce
    throttleMs: 50, // 50ms de throttle
    circuitBreakerThreshold: 10,
    circuitBreakerTimeout: 30000,
  } as RateLimitConfig,

  // Para operações de validação (mais restritivo)
  VALIDACAO: {
    maxRequests: 100, // 100 requests por minuto
    windowMs: 60000, // 1 minuto
    debounceMs: 500, // 500ms de debounce
    throttleMs: 200, // 200ms de throttle
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 60000,
  } as RateLimitConfig,

  // Para operações administrativas (muito restritivo)
  ADMIN: {
    maxRequests: 10, // 10 requests por minuto
    windowMs: 60000, // 1 minuto
    debounceMs: 2000, // 2 segundos de debounce
    throttleMs: 1000, // 1 segundo de throttle
    circuitBreakerThreshold: 3,
    circuitBreakerTimeout: 300000, // 5 minutos
  } as RateLimitConfig,
};

export class RateLimiterManager {
  private readonly limiters: Map<string, AdvancedRateLimiter> = new Map();

  constructor() {
    // Inicializa rate limiters para diferentes cenários
    this.limiters.set(
      "horario",
      new AdvancedRateLimiter(RATE_LIMIT_CONFIGS.HORARIO_COMERCIAL)
    );
    this.limiters.set(
      "validacao",
      new AdvancedRateLimiter(RATE_LIMIT_CONFIGS.VALIDACAO)
    );
    this.limiters.set(
      "admin",
      new AdvancedRateLimiter(RATE_LIMIT_CONFIGS.ADMIN)
    );
  }

  /**
   * Verifica se uma operação de horário comercial é permitida
   */
  checkHorarioComercial(identifier: string) {
    return this.limiters.get("horario")!.isAllowed(identifier);
  }

  /**
   * Verifica se uma operação de validação é permitida
   */
  checkValidacao(identifier: string) {
    return this.limiters.get("validacao")!.isAllowed(identifier);
  }

  /**
   * Verifica se uma operação administrativa é permitida
   */
  checkAdmin(identifier: string) {
    return this.limiters.get("admin")!.isAllowed(identifier);
  }

  /**
   * Registra uma falha para circuit breaker
   */
  recordFailure(type: string, identifier: string) {
    const limiter = this.limiters.get(type);
    if (limiter) {
      limiter.recordFailure(identifier);
    }
  }

  /**
   * Limpeza de todos os rate limiters
   */
  cleanup() {
    for (const limiter of this.limiters.values()) {
      limiter.cleanup();
    }
  }

  /**
   * Obtém estatísticas globais
   */
  getGlobalStats(): Record<
    string,
    {
      activeIdentifiers: number;
      totalRequests: number;
      circuitBreakersOpen: number;
    }
  > {
    const stats: Record<
      string,
      {
        activeIdentifiers: number;
        totalRequests: number;
        circuitBreakersOpen: number;
      }
    > = {};
    for (const [type, limiter] of this.limiters.entries()) {
      stats[type] = limiter.getGlobalStats();
    }
    return stats;
  }
}

// Instância global do gerenciador
export const rateLimiterManager = new RateLimiterManager();

/**
 * Função para aplicar rate limiting manualmente
 */
export function applyRateLimit(
  type: "horario" | "validacao" | "admin",
  identifier: string
) {
  let result;

  switch (type) {
    case "horario":
      result = rateLimiterManager.checkHorarioComercial(identifier);
      break;
    case "validacao":
      result = rateLimiterManager.checkValidacao(identifier);
      break;
    case "admin":
      result = rateLimiterManager.checkAdmin(identifier);
      break;
    default:
      throw new Error("Tipo de rate limit inválido");
  }

  if (!result.allowed) {
    throw new Error(
      `Rate limit exceeded: ${result.reason}. Retry after ${result.retryAfter}ms`
    );
  }

  return result;
}

/**
 * Exemplo de uso com HorarioComercial
 */
export class SecureHorarioComercialService {
  private identifier: string;

  constructor(identifier: string) {
    this.identifier = identifier;
  }

  getIdentifier() {
    return this.identifier;
  }

  estaAberto(data: Date | string = new Date()): boolean {
    // Aplica rate limiting
    applyRateLimit("horario", this.identifier);

    // Validação de entrada
    const dateValidation = InputValidator.validateDateInput(data);
    if (!dateValidation) {
      throw new Error("Data inválida");
    }

    // Lógica de negócio aqui...
    return true;
  }

  validarHorario(horario: Record<string, any>): boolean {
    // Aplica rate limiting
    applyRateLimit("validacao", this.identifier);

    // Validação de entrada
    const horarioValidation =
      InputValidator.validateHorarioInputObject(horario);
    if (!horarioValidation.isValid) {
      throw new Error(
        "Horário inválido: " + horarioValidation.errors.join(", ")
      );
    }

    // Lógica de validação aqui...
    return true;
  }

  configurarHorario(horario: any): void {
    // Aplica rate limiting
    applyRateLimit("admin", this.identifier);

    // Operação administrativa
    // Lógica de configuração aqui...
  }
}

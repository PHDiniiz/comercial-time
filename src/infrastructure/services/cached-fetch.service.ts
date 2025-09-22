/**
 * Infrastructure Layer - Serviço de Fetch com Cacheamento
 *
 * Fornece um serviço de fetch nativo com cacheamento automático,
 * retry automático e gerenciamento de timeout.
 */

import { log } from "../utils/logger.util";

/**
 * Interface para configuração do cache
 */
export interface CacheConfig {
  /** Tempo de vida do cache em milissegundos (padrão: 5 minutos) */
  ttl?: number;
  /** Tamanho máximo do cache (padrão: 100 itens) */
  maxSize?: number;
  /** Habilitar cache (padrão: true) */
  enabled?: boolean;
}

/**
 * Interface para configuração de retry
 */
export interface RetryConfig {
  /** Número máximo de tentativas (padrão: 3) */
  maxAttempts?: number;
  /** Delay inicial entre tentativas em ms (padrão: 1000) */
  initialDelay?: number;
  /** Multiplicador de delay exponencial (padrão: 2) */
  backoffMultiplier?: number;
  /** Delay máximo entre tentativas em ms (padrão: 10000) */
  maxDelay?: number;
}

/**
 * Interface para configuração de timeout
 */
export interface TimeoutConfig {
  /** Timeout em milissegundos (padrão: 10000) */
  timeout?: number;
  /** Habilitar timeout (padrão: true) */
  enabled?: boolean;
}

/**
 * Interface para entrada do cache
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

/**
 * Interface para opções de fetch
 */
export interface FetchOptions {
  /** Método HTTP (padrão: GET) */
  method?: string;
  /** Headers da requisição */
  headers?: Record<string, string>;
  /** Corpo da requisição */
  body?: any;
  /** Configuração de cache */
  cache?: CacheConfig;
  /** Configuração de retry */
  retry?: RetryConfig;
  /** Configuração de timeout */
  timeout?: TimeoutConfig;
  /** Forçar bypass do cache */
  bypassCache?: boolean;
}

/**
 * Classe principal do serviço de fetch com cacheamento
 */
export class CachedFetchService {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultCacheConfig: Required<CacheConfig>;
  private defaultRetryConfig: Required<RetryConfig>;
  private defaultTimeoutConfig: Required<TimeoutConfig>;

  constructor(
    cacheConfig: CacheConfig = {},
    retryConfig: RetryConfig = {},
    timeoutConfig: TimeoutConfig = {}
  ) {
    this.defaultCacheConfig = {
      ttl: cacheConfig.ttl || 5 * 60 * 1000, // 5 minutos
      maxSize: cacheConfig.maxSize || 100,
      enabled: cacheConfig.enabled !== false,
    };

    this.defaultRetryConfig = {
      maxAttempts: retryConfig.maxAttempts || 3,
      initialDelay: retryConfig.initialDelay || 1000,
      backoffMultiplier: retryConfig.backoffMultiplier || 2,
      maxDelay: retryConfig.maxDelay || 10000,
    };

    this.defaultTimeoutConfig = {
      timeout: timeoutConfig.timeout || 10000, // 10 segundos
      enabled: timeoutConfig.enabled !== false,
    };
  }

  /**
   * Gera chave de cache baseada na URL e opções
   * @param {string} url - URL da requisição
   * @param {FetchOptions} options - Opções da requisição
   * @returns {string} Chave de cache
   */
  private generateCacheKey(url: string, options: FetchOptions = {}): string {
    const method = options.method || "GET";
    const headers = options.headers || {};
    const body = options.body ? JSON.stringify(options.body) : "";

    return `${method}:${url}:${JSON.stringify(headers)}:${body}`;
  }

  /**
   * Verifica se uma entrada do cache é válida
   * @param {CacheEntry} entry - Entrada do cache
   * @returns {boolean} true se válida
   */
  private isCacheEntryValid(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  /**
   * Limpa entradas expiradas do cache
   * @returns {void}
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Gerencia o tamanho do cache removendo entradas mais antigas
   * @returns {void}
   */
  private manageCacheSize(): void {
    if (this.cache.size <= this.defaultCacheConfig.maxSize) {
      return;
    }

    // Converter para array e ordenar por timestamp
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    // Remover as entradas mais antigas
    const toRemove = entries.slice(
      0,
      this.cache.size - this.defaultCacheConfig.maxSize
    );
    for (const [key] of toRemove) {
      this.cache.delete(key);
    }
  }

  /**
   * Calcula delay para retry com backoff exponencial
   * @param {number} attempt - Número da tentativa
   * @param {Required<RetryConfig>} config - Configuração de retry
   * @returns {number} Delay em milissegundos
   */
  private calculateRetryDelay(
    attempt: number,
    config: Required<RetryConfig>
  ): number {
    const delay =
      config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    return Math.min(delay, config.maxDelay);
  }

  /**
   * Executa uma requisição fetch com timeout
   * @param {string} url - URL da requisição
   * @param {FetchOptions} options - Opções da requisição
   * @returns {Promise<Response>} Resposta da requisição
   */
  private async fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
  ): Promise<Response> {
    const timeoutConfig = { ...this.defaultTimeoutConfig, ...options.timeout };

    if (!timeoutConfig.enabled) {
      const fetchOptions: RequestInit = {
        method: options.method || "GET",
        body: options.body,
      };

      if (options.headers) {
        fetchOptions.headers = options.headers;
      }

      return fetch(url, fetchOptions);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutConfig.timeout);

    try {
      const fetchOptions: RequestInit = {
        method: options.method || "GET",
        body: options.body,
        signal: controller.signal,
      };

      if (options.headers) {
        fetchOptions.headers = options.headers;
      }

      const response = await fetch(url, fetchOptions);

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Executa uma requisição com retry automático
   * @param {string} url - URL da requisição
   * @param {FetchOptions} options - Opções da requisição
   * @returns {Promise<any>} Dados da resposta
   */
  private async fetchWithRetry(
    url: string,
    options: FetchOptions = {}
  ): Promise<any> {
    const retryConfig = { ...this.defaultRetryConfig, ...options.retry };
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        log.debug(
          `Tentativa ${attempt}/${retryConfig.maxAttempts} para ${url}`
        );

        const response = await this.fetchWithTimeout(url, options);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        log.debug(
          `Requisição bem-sucedida para ${url} na tentativa ${attempt}`
        );
        return data;
      } catch (error) {
        lastError = error as Error;
        log.warn(`Tentativa ${attempt} falhou para ${url}`, lastError);

        if (attempt === retryConfig.maxAttempts) {
          break;
        }

        const delay = this.calculateRetryDelay(attempt, retryConfig);
        log.debug(`Aguardando ${delay}ms antes da próxima tentativa`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error("Todas as tentativas falharam");
  }

  /**
   * Executa uma requisição HTTP com cacheamento
   * @param {string} url - URL da requisição
   * @param {FetchOptions} [options] - Opções da requisição
   * @returns {Promise<any>} Dados da resposta
   */
  public async fetch(url: string, options: FetchOptions = {}): Promise<any> {
    const cacheConfig = { ...this.defaultCacheConfig, ...options.cache };
    const cacheKey = this.generateCacheKey(url, options);

    // Verificar cache se habilitado e não for bypass
    if (cacheConfig.enabled && !options.bypassCache) {
      const cachedEntry = this.cache.get(cacheKey);
      if (cachedEntry && this.isCacheEntryValid(cachedEntry)) {
        log.debug(`Cache hit para ${url}`);
        return cachedEntry.data;
      }
    }

    // Limpar cache expirado
    this.cleanExpiredCache();

    try {
      // Fazer requisição
      const data = await this.fetchWithRetry(url, options);

      // Armazenar no cache se habilitado
      if (cacheConfig.enabled) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheConfig.ttl,
        });

        // Gerenciar tamanho do cache
        this.manageCacheSize();

        log.debug(`Dados armazenados no cache para ${url}`);
      }

      return data;
    } catch (error) {
      log.error(`Erro ao fazer requisição para ${url}`, error as Error);
      throw error;
    }
  }

  /**
   * Limpa todo o cache
   * @returns {void}
   */
  public clearCache(): void {
    this.cache.clear();
    log.info("Cache limpo");
  }

  /**
   * Remove uma entrada específica do cache
   * @param {string} url - URL da entrada
   * @param {FetchOptions} [options] - Opções da requisição
   * @returns {boolean} true se removida
   */
  public removeFromCache(url: string, options: FetchOptions = {}): boolean {
    const cacheKey = this.generateCacheKey(url, options);
    const removed = this.cache.delete(cacheKey);

    if (removed) {
      log.debug(`Entrada removida do cache: ${url}`);
    }

    return removed;
  }

  /**
   * Obtém estatísticas do cache
   * @returns {object} Estatísticas do cache
   */
  public getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; age: number; ttl: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      ttl: entry.ttl,
    }));

    return {
      size: this.cache.size,
      maxSize: this.defaultCacheConfig.maxSize,
      hitRate: 0, // Tracking de hit rate não implementado
      entries,
    };
  }

  /**
   * Atualiza configuração de cache
   * @param {CacheConfig} config - Nova configuração
   * @returns {void}
   */
  public updateCacheConfig(config: CacheConfig): void {
    this.defaultCacheConfig = { ...this.defaultCacheConfig, ...config };
    log.info("Configuração de cache atualizada", config);
  }

  /**
   * Atualiza configuração de retry
   * @param {RetryConfig} config - Nova configuração
   * @returns {void}
   */
  public updateRetryConfig(config: RetryConfig): void {
    this.defaultRetryConfig = { ...this.defaultRetryConfig, ...config };
    log.info("Configuração de retry atualizada", config);
  }

  /**
   * Atualiza configuração de timeout
   * @param {TimeoutConfig} config - Nova configuração
   * @returns {void}
   */
  public updateTimeoutConfig(config: TimeoutConfig): void {
    this.defaultTimeoutConfig = { ...this.defaultTimeoutConfig, ...config };
    log.info("Configuração de timeout atualizada", config);
  }
}

/**
 * Instância global do serviço de fetch com cacheamento
 */
export const cachedFetch = new CachedFetchService(
  {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 100,
    enabled: true,
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 10000,
  },
  {
    timeout: 10000, // 10 segundos
    enabled: true,
  }
);

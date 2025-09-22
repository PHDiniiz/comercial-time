/**
 * Configuration Layer - Timezone Configuration
 *
 * Configuração global de timezone para o sistema de horário comercial.
 * Permite definir o timezone padrão e gerenciar conversões de data/hora.
 * Carrega configuração do arquivo .env com fallback para valores padrão.
 */

import { config } from "dotenv";
import { log } from "../infrastructure/utils/logger.util";

// Carrega variáveis de ambiente do arquivo .env
config();

/**
 * Interface que define a configuração de timezone do sistema.
 * Contém as configurações necessárias para gerenciar timezones
 * e conversões de data/hora.
 */
export interface TimezoneConfig {
  /** Timezone padrão do sistema */
  defaultTimezone: string;
  /** Timezone de fallback em caso de erro */
  fallbackTimezone: string;
  /** Se deve detectar automaticamente o timezone do sistema */
  autoDetect: boolean;
}

/**
 * Obtém o timezone configurado no arquivo .env com validação e fallback.
 * Valida se o timezone é válido e retorna um fallback seguro em caso de erro.
 * @returns String com o timezone válido ou fallback para America/Sao_Paulo (pt-BR)
 */
function getTimezoneFromEnv(): string {
  let envTimezone: string | undefined;

  try {
    envTimezone = process.env.TIMEZONE;
  } catch (error) {
    log.warn("Erro ao acessar variável de ambiente TIMEZONE", error as Error);
    return "America/Sao_Paulo";
  } finally {
    // Garantir que sempre temos um valor válido
    if (!envTimezone) {
      log.warn(
        "TIMEZONE não definido no .env. Usando padrão pt-BR: America/Sao_Paulo"
      );
      return "America/Sao_Paulo";
    }
  }

  // Valida se o timezone é válido
  try {
    Intl.DateTimeFormat(undefined, { timeZone: envTimezone });
    return envTimezone;
  } catch (error) {
    log.warn(
      `Timezone inválido no .env: ${envTimezone}. Usando padrão pt-BR: America/Sao_Paulo`,
      error as Error
    );
    return "America/Sao_Paulo";
  }
}

/**
 * Configuração padrão de timezone para o sistema.
 * Define valores padrão seguros para todas as propriedades de timezone.
 * Padrão: pt-BR (America/Sao_Paulo)
 */
export const DEFAULT_TIMEZONE_CONFIG: TimezoneConfig = {
  /** Timezone padrão pt-BR (será sobrescrito pelo getTimezoneFromEnv() quando necessário) */
  defaultTimezone: "America/Sao_Paulo",
  /** Timezone de fallback em caso de erro */
  fallbackTimezone: "UTC",
  /** Detecta automaticamente o timezone do sistema */
  autoDetect: true,
};

/**
 * Gerenciador de configuração de timezone do sistema.
 * Responsável por gerenciar timezones, conversões e configurações globais.
 */
class TimezoneManager {
  private config: TimezoneConfig;
  private currentTimezone: string;

  /**
   * Constrói uma nova instância do gerenciador de timezone.
   * @param config - Configuração de timezone (padrão: DEFAULT_TIMEZONE_CONFIG)
   */
  constructor(config: TimezoneConfig = DEFAULT_TIMEZONE_CONFIG) {
    this.config = config;
    // Sempre prioriza o timezone do .env primeiro
    this.currentTimezone = getTimezoneFromEnv();
  }

  /**
   * Detecta o timezone atual do sistema automaticamente.
   * @returns String com o timezone detectado ou fallback para o padrão
   */
  private detectTimezone(): string {
    if (!this.config.autoDetect) {
      return this.config.defaultTimezone;
    }

    let systemTimezone: string | undefined;

    try {
      // Tenta detectar o timezone do sistema
      systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      log.warn("Erro ao detectar timezone do sistema", error as Error);
      return this.config.defaultTimezone;
    } finally {
      // Verificar se o timezone detectado é válido
      if (systemTimezone && this.isValidTimezone(systemTimezone)) {
        return systemTimezone;
      }
    }

    // Fallback para o timezone padrão
    return this.config.defaultTimezone;
  }

  /**
   * Verifica se um timezone é válido usando a API Intl.
   * @param timezone - String do timezone a ser validado
   * @returns true se o timezone for válido, false caso contrário
   */
  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém o timezone atualmente configurado no sistema.
   * @returns String com o timezone atual
   */
  getCurrentTimezone(): string {
    return this.currentTimezone;
  }

  /**
   * Obtém uma cópia da configuração atual de timezone.
   * @returns Objeto com a configuração atual
   */
  getConfig(): TimezoneConfig {
    return { ...this.config };
  }

  /**
   * Atualiza a configuração de timezone.
   * @param newConfig - Nova configuração de timezone
   */
  updateConfig(newConfig: Partial<TimezoneConfig>): void {
    try {
      this.config = { ...this.config, ...newConfig };

      // Se autoDetect está desabilitado, usa o defaultTimezone
      if (newConfig.autoDetect === false && newConfig.defaultTimezone) {
        this.currentTimezone = newConfig.defaultTimezone;
      } else if (newConfig.autoDetect === true && newConfig.defaultTimezone) {
        // Se autoDetect está habilitado, usa o defaultTimezone especificado
        this.currentTimezone = newConfig.defaultTimezone;
      } else {
        this.currentTimezone = getTimezoneFromEnv();
      }
    } catch (error) {
      log.error("Erro ao atualizar configuração de timezone", error as Error);
      // Manter configuração anterior em caso de erro
      this.currentTimezone = this.config.defaultTimezone;
    } finally {
      // Garantir que sempre temos um timezone válido
      if (!this.isValidTimezone(this.currentTimezone)) {
        log.warn("Timezone inválido detectado, usando fallback");
        this.currentTimezone = this.config.fallbackTimezone;
      }
    }
  }

  /**
   * Define um timezone específico.
   * @param timezone - Timezone para definir
   */
  setTimezone(timezone: string): void {
    if (!this.isValidTimezone(timezone)) {
      throw new Error(`Timezone inválido: ${timezone}`);
    }
    this.currentTimezone = timezone;
  }

  /**
   * Converte uma data para o timezone atualmente configurado.
   * @param date - Data a ser convertida
   * @returns Nova data convertida para o timezone atual
   */
  toCurrentTimezone(date: Date): Date {
    let utc: number;
    let targetTime: Date;

    try {
      // Cria uma nova data no timezone atual
      utc = date.getTime() + date.getTimezoneOffset() * 60000;
      targetTime = new Date(utc + this.getTimezoneOffset() * 60000);
    } catch (error) {
      log.warn("Erro ao converter timezone", error as Error);
      return date;
    } finally {
      // Garantir que sempre retornamos uma data válida
      if (isNaN(targetTime!.getTime())) {
        log.warn("Data inválida gerada, retornando data original");
        return date;
      }
    }

    return targetTime!;
  }

  /**
   * Obtém o offset do timezone atual em minutos em relação ao UTC.
   * @returns Offset em minutos (positivo para leste, negativo para oeste)
   */
  private getTimezoneOffset(): number {
    try {
      const now = new Date();
      const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
      const target = new Date(
        utc.toLocaleString("en-US", { timeZone: this.currentTimezone })
      );
      return (target.getTime() - utc.getTime()) / 60000;
    } catch {
      return 0; // Fallback para UTC
    }
  }

  /**
   * Obtém a data atual no timezone configurado.
   * @returns Data atual convertida para o timezone configurado
   */
  getCurrentDate(): Date {
    return this.toCurrentTimezone(new Date());
  }

  /**
   * Formata uma data no timezone atual usando as opções especificadas.
   * @param date - Data a ser formatada
   * @param options - Opções de formatação do Intl.DateTimeFormat
   * @returns String formatada da data
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    let formattedDate: string;

    try {
      formattedDate = date.toLocaleString("pt-BR", {
        timeZone: this.currentTimezone,
        ...options,
      });
    } catch (error) {
      log.warn("Erro ao formatar data", error as Error);
      return date.toISOString();
    } finally {
      // Garantir que sempre retornamos uma string válida
      if (!formattedDate! || formattedDate!.trim() === "") {
        log.warn("Data formatada vazia, retornando ISO string");
        return date.toISOString();
      }
    }

    return formattedDate!;
  }
}

/** Instância global do gerenciador de timezone */
export const timezoneManager = new TimezoneManager();

/**
 * Função utilitária para obter o timezone atualmente configurado.
 * @returns String com o timezone atual
 */
export function getCurrentTimezone(): string {
  return timezoneManager.getCurrentTimezone();
}

/**
 * Função utilitária para obter a data atual no timezone configurado.
 * @returns Data atual convertida para o timezone configurado
 */
export function getCurrentDate(): Date {
  return timezoneManager.getCurrentDate();
}

/**
 * Função utilitária para formatar uma data no timezone atual.
 * @param date - Data a ser formatada
 * @param options - Opções de formatação do Intl.DateTimeFormat
 * @returns String formatada da data
 */
export function formatDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return timezoneManager.formatDate(date, options);
}

/**
 * Função utilitária para definir timezone.
 * @param timezone - Timezone para definir
 */
export function setTimezone(timezone?: string): void {
  if (timezone) {
    timezoneManager.setTimezone(timezone);
  } else {
    timezoneManager.updateConfig(DEFAULT_TIMEZONE_CONFIG);
  }
}

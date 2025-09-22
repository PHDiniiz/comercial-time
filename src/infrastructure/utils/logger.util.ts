/**
 * Infrastructure Layer - Sistema de Logging Centralizado
 *
 * Sistema de logging que mantém logs apenas no backend, organizando-os
 * em arquivos estruturados por data e nível de log.
 */

import { appendFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

// Usar diretório de trabalho atual para logs
const logsDir = process.cwd();

/**
 * Níveis de log disponíveis
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Interface para configuração do logger
 */
export interface LoggerConfig {
  /** Nível mínimo de log (padrão: INFO) */
  minLevel?: LogLevel;
  /** Habilitar logs de debug (padrão: false) */
  enableDebug?: boolean;
  /** Diretório base para logs (padrão: ./logs) */
  logDir?: string;
  /** Máximo de arquivos de log por dia (padrão: 10) */
  maxFilesPerDay?: number;
}

/**
 * Classe principal do sistema de logging
 */
export class Logger {
  private static instance: Logger;
  private config: Required<LoggerConfig>;
  private logsDir: string;

  private constructor(config: LoggerConfig = {}) {
    this.config = {
      minLevel: config.minLevel || LogLevel.INFO,
      enableDebug: config.enableDebug || false,
      logDir: config.logDir || join(logsDir, "logs"),
      maxFilesPerDay: config.maxFilesPerDay || 10,
    };

    this.logsDir = this.config.logDir;
    this.ensureLogsDirectory();
  }

  /**
   * Obtém instância singleton do logger
   * @param config - Configuração opcional do logger
   * @returns Instância do logger
   */
  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Garante que o diretório de logs existe
   */
  private ensureLogsDirectory(): void {
    try {
      if (!existsSync(this.logsDir)) {
        mkdirSync(this.logsDir, { recursive: true });
      }

      // Criar subdiretório 'all' para logs de debug
      const allLogsDir = join(this.logsDir, "all");
      if (!existsSync(allLogsDir)) {
        mkdirSync(allLogsDir, { recursive: true });
      }
    } catch (error) {
      // Fallback silencioso - não podemos logar se não conseguimos criar o diretório
      // Log removido para otimização
    }
  }

  /**
   * Gera nome do arquivo de log com sufixo se necessário
   * @param {string} baseName - Nome base do arquivo
   * @param {string} [extension=".txt"] - Extensão do arquivo
   * @returns {string} Nome completo do arquivo
   */
  private generateLogFileName(
    baseName: string,
    extension: string = ".txt"
  ): string {
    const logDir = baseName.includes("_all")
      ? join(this.logsDir, "all")
      : this.logsDir;

    try {
      const files = readdirSync(logDir);
      const pattern = new RegExp(
        `^${baseName}(_Started_\\(\\d+\\))?${extension}$`
      );
      const matchingFiles = files.filter((file) => pattern.test(file));

      if (matchingFiles.length === 0) {
        return `${baseName}${extension}`;
      }

      // Encontrar o maior número de sufixo
      let maxSuffix = 0;
      matchingFiles.forEach((file) => {
        const match = file.match(/_Started_\((\d+)\)/);
        if (match && match[1]) {
          const suffix = parseInt(match[1], 10);
          if (suffix > maxSuffix) {
            maxSuffix = suffix;
          }
        }
      });

      const nextSuffix = maxSuffix + 1;
      return `${baseName}_Started_(${nextSuffix})${extension}`;
    } catch (error) {
      // Fallback para nome simples
      return `${baseName}${extension}`;
    }
  }

  /**
   * Formata timestamp para log
   * @returns {string} String formatada de timestamp
   */
  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace("T", " ").replace("Z", "");
  }

  /**
   * Formata mensagem de log
   * @param {LogLevel} level - Nível do log
   * @param {string} message - Mensagem principal
   * @param {Error} [error] - Erro opcional
   * @returns {string} Mensagem formatada
   */
  private formatLogMessage(
    level: LogLevel,
    message: string,
    error?: Error
  ): string {
    const timestamp = this.formatTimestamp();

    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (error) {
      logMessage += `\nError: ${error.message}`;
      if (error.stack) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }

    return logMessage + "\n";
  }

  /**
   * Escreve log em arquivo
   * @param {LogLevel} level - Nível do log
   * @param {string} message - Mensagem do log
   * @param {Error} [error] - Erro opcional
   * @returns {void}
   */
  private writeToFile(level: LogLevel, message: string, error?: Error): void {
    try {
      const today =
        new Date().toISOString().split("T")[0]?.replace(/-/g, "") || "";
      const fileName = this.generateLogFileName(today);
      const filePath = join(this.logsDir, fileName);

      const logMessage = this.formatLogMessage(level, message, error);
      appendFileSync(filePath, logMessage, "utf8");

      // Sempre escrever no arquivo _all com o nível correto
      const allFileName = this.generateLogFileName(`${today}_all`);
      const allFilePath = join(this.logsDir, "all", allFileName);
      appendFileSync(allFilePath, logMessage, "utf8");
    } catch (writeError) {
      // Fallback para console se não conseguir escrever no arquivo
      // Log removido para otimização
    }
  }

  /**
   * Verifica se o nível de log deve ser processado
   * @param {LogLevel} level - Nível do log
   * @returns {boolean} true se deve processar
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
    ];
    const currentLevelIndex = levels.indexOf(this.config.minLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Log de debug (apenas se habilitado)
   * @param {string} message - Mensagem de debug
   * @param {any} [data] - Dados opcionais para debug
   * @returns {void}
   */
  public debug(message: string, data?: any): void {
    if (!this.config.enableDebug || !this.shouldLog(LogLevel.DEBUG)) {
      return;
    }

    let fullMessage = message;
    if (data !== undefined) {
      fullMessage += ` | Data: ${JSON.stringify(data)}`;
    }

    this.writeToFile(LogLevel.DEBUG, fullMessage);
  }

  /**
   * Log de informação
   * @param {string} message - Mensagem informativa
   * @param {any} [data] - Dados opcionais
   * @returns {void}
   */
  public info(message: string, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO)) {
      return;
    }

    let fullMessage = message;
    if (data !== undefined) {
      fullMessage += ` | Data: ${JSON.stringify(data)}`;
    }

    this.writeToFile(LogLevel.INFO, fullMessage);
  }

  /**
   * Log de aviso
   * @param {string} message - Mensagem de aviso
   * @param {Error} [error] - Erro opcional
   * @param {any} [data] - Dados opcionais
   * @returns {void}
   */
  public warn(message: string, error?: Error, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN)) {
      return;
    }

    let fullMessage = message;
    if (data !== undefined) {
      fullMessage += ` | Data: ${JSON.stringify(data)}`;
    }

    this.writeToFile(LogLevel.WARN, fullMessage, error);
  }

  /**
   * Log de erro
   * @param {string} message - Mensagem de erro
   * @param {Error} [error] - Erro
   * @param {any} [data] - Dados opcionais
   * @returns {void}
   */
  public error(message: string, error?: Error, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return;
    }

    let fullMessage = message;
    if (data !== undefined) {
      fullMessage += ` | Data: ${JSON.stringify(data)}`;
    }

    this.writeToFile(LogLevel.ERROR, fullMessage, error);
  }

  /**
   * Atualiza configuração do logger
   * @param {Partial<LoggerConfig>} newConfig - Nova configuração
   * @returns {void}
   */
  public updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logsDir = this.config.logDir;
    this.ensureLogsDirectory();
  }

  /**
   * Obtém configuração atual
   * @returns {Required<LoggerConfig>} Configuração atual
   */
  public getConfig(): Required<LoggerConfig> {
    return { ...this.config };
  }
}

/**
 * Instância global do logger
 */
export const logger = Logger.getInstance({
  minLevel: LogLevel.INFO,
  enableDebug: process.env.NODE_ENV === "development",
  logDir: "./logs",
  maxFilesPerDay: 10,
});

/**
 * Funções de conveniência para logging
 * @namespace log
 */
export const log = {
  /**
   * Log de debug
   * @param {string} message - Mensagem de debug
   * @param {any} [data] - Dados opcionais
   * @returns {void}
   */
  debug: (message: string, data?: any) => logger.debug(message, data),

  /**
   * Log de informação
   * @param {string} message - Mensagem informativa
   * @param {any} [data] - Dados opcionais
   * @returns {void}
   */
  info: (message: string, data?: any) => logger.info(message, data),

  /**
   * Log de aviso
   * @param {string} message - Mensagem de aviso
   * @param {Error} [error] - Erro opcional
   * @param {any} [data] - Dados opcionais
   * @returns {void}
   */
  warn: (message: string, error?: Error, data?: any) =>
    logger.warn(message, error, data),

  /**
   * Log de erro
   * @param {string} message - Mensagem de erro
   * @param {Error} [error] - Erro
   * @param {any} [data] - Dados opcionais
   * @returns {void}
   */
  error: (message: string, error?: Error, data?: any) =>
    logger.error(message, error, data),
};

/**
 * Security Layer - Input Validator
 *
 * Validador de entrada para garantir segurança e integridade dos dados.
 * Implementa validações para horários comerciais, datas e configurações.
 */

import {
  DiaChave,
  Intervalo,
} from "../../domain/entities/horario-comercial.entity";
import { log } from "../../infrastructure/utils/logger.util";

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Classe responsável por validar entradas do sistema de horário comercial.
 * Implementa validações de segurança para prevenir ataques e garantir integridade.
 */
export class InputValidator {
  /**
   * Valida entrada de horário comercial (objeto)
   * @param horarioInput - Objeto com horários por dia da semana
   * @returns Resultado da validação
   */
  static validateHorarioInputObject(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>
  ): ValidationResult {
    const errors: string[] = [];
    let isValidInput = true;

    try {
      if (!horarioInput || typeof horarioInput !== "object") {
        errors.push("Horário de entrada deve ser um objeto válido");
        isValidInput = false;
        return { isValid: false, errors };
      }

      const diasValidos: DiaChave[] = [
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
        "domingo",
      ];

      for (const [dia, intervalos] of Object.entries(horarioInput)) {
        try {
          if (!diasValidos.includes(dia as DiaChave)) {
            errors.push(`Dia inválido: ${dia}`);
            continue;
          }

          if (Array.isArray(intervalos)) {
            for (const intervalo of intervalos) {
              const intervaloErrors = this.validateIntervalo(intervalo, dia);
              errors.push(...intervaloErrors);
            }
          } else {
            const intervaloErrors = this.validateIntervalo(intervalos, dia);
            errors.push(...intervaloErrors);
          }
        } catch (error) {
          log.warn(`Erro ao validar dia ${dia}`, error as Error);
          errors.push(`Erro ao validar configuração do dia: ${dia}`);
        }
      }
    } catch (error) {
      log.error("Erro crítico na validação de horário", error as Error);
      errors.push("Erro interno na validação de horário");
      isValidInput = false;
    } finally {
      // Garantir que sempre retornamos um resultado válido
      if (!isValidInput) {
        return { isValid: false, errors };
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida um intervalo de horário
   * @param intervalo - Intervalo a ser validado
   * @param dia - Dia da semana para contexto
   * @returns Array de erros encontrados
   */
  private static validateIntervalo(
    intervalo: Intervalo,
    dia: string
  ): string[] {
    const errors: string[] = [];

    if (!intervalo || typeof intervalo !== "object") {
      errors.push(`Intervalo inválido para ${dia}`);
      return errors;
    }

    if (!intervalo.abertura || typeof intervalo.abertura !== "string") {
      errors.push(`Horário de abertura inválido para ${dia}`);
    } else if (!this.isValidTimeFormat(intervalo.abertura)) {
      errors.push(
        `Formato de horário de abertura inválido para ${dia}: ${intervalo.abertura}`
      );
    }

    if (!intervalo.fechamento || typeof intervalo.fechamento !== "string") {
      errors.push(`Horário de fechamento inválido para ${dia}`);
    } else if (!this.isValidTimeFormat(intervalo.fechamento)) {
      errors.push(
        `Formato de horário de fechamento inválido para ${dia}: ${intervalo.fechamento}`
      );
    }

    if (
      intervalo.abertura &&
      intervalo.fechamento &&
      this.isValidTimeFormat(intervalo.abertura) &&
      this.isValidTimeFormat(intervalo.fechamento)
    ) {
      if (
        this.timeToMinutes(intervalo.abertura) >=
        this.timeToMinutes(intervalo.fechamento)
      ) {
        errors.push(
          `Horário de abertura deve ser anterior ao fechamento para ${dia}`
        );
      }
    }

    return errors;
  }

  /**
   * Valida formato de horário (HH:MM)
   * @param time - String de horário a ser validada
   * @returns true se o formato for válido
   */
  private static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Converte horário para minutos
   * @param time - Horário no formato HH:MM
   * @returns Minutos desde meia-noite
   */
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  /**
   * Valida data
   * @param date - Data a ser validada
   * @returns Resultado da validação
   */
  static validateDate(date: Date | string): ValidationResult {
    const errors: string[] = [];
    let dateObj: Date;

    try {
      if (!date) {
        errors.push("Data é obrigatória");
        return { isValid: false, errors };
      }

      dateObj = typeof date === "string" ? new Date(date) : date;
    } catch (error) {
      log.warn("Erro ao processar data", error as Error);
      errors.push("Erro ao processar data fornecida");
      return { isValid: false, errors };
    } finally {
      // Verificar se a data é válida
      if (dateObj! && isNaN(dateObj!.getTime())) {
        errors.push("Data inválida");
        return { isValid: false, errors };
      }
    }

    try {
      // Verificar se a data não é muito antiga ou futura
      const now = new Date();
      const year = dateObj.getFullYear();
      const currentYear = now.getFullYear();

      if (year < 1900 || year > currentYear + 100) {
        errors.push(
          "Data fora do intervalo válido (1900 - " + (currentYear + 100) + ")"
        );
      }
    } catch (error) {
      log.warn("Erro ao validar intervalo de data", error as Error);
      errors.push("Erro ao validar intervalo de data");
    } finally {
      // Garantir que sempre retornamos um resultado
      return {
        isValid: errors.length === 0,
        errors,
      };
    }
  }

  /**
   * Valida configuração de feriados
   * @param config - Configuração a ser validada
   * @returns Resultado da validação
   */
  static validateFeriadosConfig(config: any): ValidationResult {
    const errors: string[] = [];

    if (!config || typeof config !== "object") {
      errors.push("Configuração de feriados deve ser um objeto válido");
      return { isValid: false, errors };
    }

    if (
      config.nacionais !== undefined &&
      typeof config.nacionais !== "boolean"
    ) {
      errors.push("Configuração de feriados nacionais deve ser boolean");
    }

    if (config.estaduais !== undefined) {
      if (typeof config.estaduais === "string") {
        if (!this.isValidEstado(config.estaduais)) {
          errors.push(`Estado inválido: ${config.estaduais}`);
        }
      } else if (Array.isArray(config.estaduais)) {
        for (const estado of config.estaduais) {
          if (typeof estado !== "string" || !this.isValidEstado(estado)) {
            errors.push(`Estado inválido: ${estado}`);
          }
        }
      } else {
        errors.push(
          "Configuração de feriados estaduais deve ser string ou array de strings"
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida código de estado brasileiro
   * @param estado - Código do estado
   * @returns true se o estado for válido
   */
  private static isValidEstado(estado: string): boolean {
    const estadosValidos = [
      "AC",
      "AL",
      "AP",
      "AM",
      "BA",
      "CE",
      "DF",
      "ES",
      "GO",
      "MA",
      "MT",
      "MS",
      "MG",
      "PA",
      "PB",
      "PR",
      "PE",
      "PI",
      "RJ",
      "RN",
      "RS",
      "RO",
      "RR",
      "SC",
      "SP",
      "SE",
      "TO",
    ];
    return estadosValidos.includes(estado.toUpperCase());
  }

  /**
   * Sanitiza string de entrada
   * @param input - String a ser sanitizada
   * @param maxLength - Tamanho máximo (padrão: 1000)
   * @returns String sanitizada
   */
  static sanitizeStringWithMaxLength(
    input: string,
    maxLength: number = 1000
  ): string {
    if (typeof input !== "string") {
      return "";
    }

    return input
      .trim()
      .replace(/<[^>]*>/g, "") // Remove tags HTML completas
      .replace(/[<>]/g, "") // Remove caracteres potencialmente perigosos restantes
      .replace(/[';]/g, "") // Remove aspas simples e ponto e vírgula (SQL injection)
      .substring(0, maxLength); // Limita tamanho
  }

  /**
   * Sanitiza string de entrada com tamanho padrão
   * @param input - String a ser sanitizada
   * @returns String sanitizada
   */
  static sanitizeString(input: string): string {
    return this.sanitizeStringWithMaxLength(input, 100);
  }

  /**
   * Valida URL
   * @param url - URL a ser validada
   * @returns Resultado da validação
   */
  static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];
    let urlObj: URL;

    try {
      if (!url || typeof url !== "string") {
        errors.push("URL é obrigatória");
        return { isValid: false, errors };
      }

      urlObj = new URL(url);
    } catch (error) {
      log.warn("Erro ao criar objeto URL", error as Error);
      errors.push("URL inválida");
      return { isValid: false, errors };
    } finally {
      // Verificar se o objeto URL foi criado com sucesso
      if (!urlObj!) {
        errors.push("Erro ao processar URL");
        return { isValid: false, errors };
      }
    }

    try {
      // Verificar protocolo
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        errors.push("URL deve usar protocolo HTTP ou HTTPS");
      }

      // Verificar tamanho
      if (url.length > 2048) {
        errors.push("URL muito longa");
      }
    } catch (error) {
      log.warn("Erro ao validar propriedades da URL", error as Error);
      errors.push("Erro ao validar propriedades da URL");
    } finally {
      // Garantir que sempre retornamos um resultado
      return {
        isValid: errors.length === 0,
        errors,
      };
    }
  }

  /**
   * Valida entrada de data (alias para validateDate)
   * @param date - Data a ser validada
   * @returns true se válido, false caso contrário
   */
  static validateDateInput(date: Date | string): boolean {
    const result = this.validateDate(date);
    return result.isValid;
  }

  /**
   * Valida entrada de horário simples (string)
   * @param horario - Horário a ser validado
   * @returns true se válido, false caso contrário
   */
  static validateHorarioInput(horario: string): boolean {
    return this.isValidTimeFormat(horario);
  }

  /**
   * Valida entrada de dia da semana
   * @param dia - Dia a ser validado
   * @returns true se válido, false caso contrário
   */
  static validateDiaInput(dia: string): boolean {
    if (typeof dia !== "string") return false;

    const diasValidos = [
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
      "domingo",
      "segunda-feira",
      "terca-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sabado-feira",
      "domingo-feira",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    return diasValidos.includes(dia.toLowerCase());
  }

  /**
   * Valida array de feriados
   * @param feriados - Array de feriados
   * @returns true se válido, false caso contrário
   */
  static validateFeriados(feriados: string[]): boolean {
    try {
      if (!Array.isArray(feriados)) return false;
      if (feriados.length > 1000) return false; // Limite de segurança

      for (const feriado of feriados) {
        try {
          const dateValidation = this.validateDate(feriado);
          if (!dateValidation.isValid) return false;
        } catch (error) {
          log.warn(`Erro ao validar feriado ${feriado}`, error as Error);
          return false;
        }
      }

      return true;
    } catch (error) {
      log.error("Erro crítico na validação de feriados", error as Error);
      return false;
    }
  }
}

/**
 * Infrastructure Layer - Timezone Utilities
 *
 * Utilitários para manipulação de timezone e conversões de data/hora.
 * Fornece funções para conversão entre timezones e validação.
 */

/**
 * Converte uma data para o timezone atual
 * @param date - Data a ser convertida
 * @param timezone - Timezone de destino (opcional, usa o padrão se não especificado)
 * @returns Data convertida para o timezone especificado
 */
export function toCurrentTimezone(date: Date, timezone?: string): Date {
  let utc: number;
  let targetTime: Date;

  try {
    if (!date || !(date instanceof Date)) {
      throw new Error("Data inválida fornecida");
    }

    if (isNaN(date.getTime())) {
      throw new Error("Data com valor inválido");
    }

    if (!timezone) {
      return date;
    }

    if (!isValidTimezone(timezone)) {
      throw new Error(`Timezone inválido: ${timezone}`);
    }
  } catch (error) {
    // Log removido para otimização
    return date;
  } finally {
    // Garantir que temos uma data válida
    if (!date || isNaN(date.getTime())) {
      // Log removido para otimização
      return date;
    }
  }

  try {
    // Cria uma nova data no timezone especificado
    utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const offset = getTimezoneOffset(timezone!);
    targetTime = new Date(utc + offset * 60000);
  } catch (error) {
    // Log removido para otimização
    return date;
  } finally {
    // Garantir que sempre retornamos uma data válida
    if (isNaN(targetTime!.getTime())) {
      // Log removido para otimização
      return date;
    }
  }

  return targetTime!;
}

/**
 * Obtém o offset do timezone em minutos em relação ao UTC
 * @param timezone - Timezone para calcular o offset
 * @returns Offset em minutos (positivo para leste, negativo para oeste)
 */
export function getTimezoneOffset(timezone: string): number {
  let now: Date;
  let utc: Date;
  let target: Date;
  let offset: number;

  try {
    if (!timezone || typeof timezone !== "string") {
      throw new Error("Timezone inválido fornecido");
    }

    if (!isValidTimezone(timezone)) {
      throw new Error(`Timezone inválido: ${timezone}`);
    }

    now = new Date();
  } catch (error) {
    // Log removido para otimização
    return 0; // Fallback para UTC
  } finally {
    // Garantir que temos uma data válida
    if (!now! || isNaN(now!.getTime())) {
      // Log removido para otimização
      return 0;
    }
  }

  try {
    utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    target = new Date(utc.toLocaleString("en-US", { timeZone: timezone }));
  } catch (error) {
    // Log removido para otimização
    return 0; // Fallback para UTC
  } finally {
    // Garantir que temos datas válidas
    if (isNaN(utc!.getTime()) || isNaN(target!.getTime())) {
      // Log removido para otimização
      return 0;
    }
  }

  try {
    offset = (target.getTime() - utc.getTime()) / 60000;
  } catch (error) {
    // Log removido para otimização
    return 0; // Fallback para UTC
  } finally {
    // Garantir que o offset é um número válido
    if (isNaN(offset!)) {
      // Log removido para otimização
      return 0;
    }
  }

  return offset!;
}

/**
 * Verifica se um timezone é válido
 * @param timezone - Timezone a ser validado
 * @returns true se o timezone for válido
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém a lista de timezones disponíveis
 * @returns Array com timezones disponíveis
 */
export function getAvailableTimezones(): string[] {
  try {
    // Lista de timezones comuns
    return [
      "America/Sao_Paulo",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Australia/Sydney",
      "UTC",
    ];
  } catch {
    return ["UTC"];
  }
}

/**
 * Formata data no timezone especificado
 * @param date - Data a ser formatada
 * @param timezone - Timezone para formatação
 * @param options - Opções de formatação
 * @returns String formatada
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  let formattedDate: string;

  try {
    if (!date || !(date instanceof Date)) {
      throw new Error("Data inválida fornecida");
    }

    if (isNaN(date.getTime())) {
      throw new Error("Data com valor inválido");
    }

    if (!timezone || typeof timezone !== "string") {
      throw new Error("Timezone inválido fornecido");
    }

    if (!isValidTimezone(timezone)) {
      throw new Error(`Timezone inválido: ${timezone}`);
    }
  } catch (error) {
    // Log removido para otimização
    return date.toISOString();
  } finally {
    // Garantir que temos uma data válida
    if (!date || isNaN(date.getTime())) {
      // Log removido para otimização
      return date.toISOString();
    }
  }

  try {
    formattedDate = date.toLocaleString("pt-BR", {
      timeZone: timezone,
      ...options,
    });
  } catch (error) {
    // Log removido para otimização
    return date.toISOString();
  } finally {
    // Garantir que sempre retornamos uma string válida
    if (!formattedDate! || formattedDate!.trim() === "") {
      // Log removido para otimização
      return date.toISOString();
    }
  }

  return formattedDate!;
}

/**
 * Converte string de data para Date no timezone especificado
 * @param dateString - String de data
 * @param timezone - Timezone de destino
 * @returns Date convertida
 */
export function parseDateInTimezone(
  dateString: string,
  timezone: string
): Date {
  try {
    const date = new Date(dateString);
    return toCurrentTimezone(date, timezone);
  } catch (error) {
    // Log removido para otimização
    return new Date();
  }
}

/**
 * Obtém informações sobre um timezone
 * @param timezone - Timezone para obter informações
 * @returns Objeto com informações do timezone
 */
export function getTimezoneInfo(timezone: string): {
  offset: number;
  isValid: boolean;
  name: string;
} {
  let offset: number = 0;
  let isValid: boolean = false;
  let name: string = timezone;

  try {
    offset = getTimezoneOffset(timezone);
    isValid = isValidTimezone(timezone);
    name = timezone;
  } catch (error) {
    // Log removido para otimização
    offset = 0;
    isValid = false;
    name = "UTC";
  } finally {
    if (!name || name.trim() === "") {
      name = "UTC";
    }
  }

  return {
    offset,
    isValid,
    name,
  };
}

/**
 * Obtém a data/hora atual no timezone especificado
 * @param timezone - Timezone para obter a data atual
 * @returns Data atual no timezone especificado
 */
export function getNowInTimezone(timezone: string): Date {
  let result: Date = new Date();

  try {
    result = toCurrentTimezone(new Date(), timezone);
  } catch (error) {
    // Log removido para otimização
    result = new Date();
  } finally {
    if (!result || isNaN(result.getTime())) {
      result = new Date();
    }
  }

  return result;
}

/**
 * Obtém apenas o horário atual no timezone especificado
 * @param timezone - Timezone para obter o horário
 * @returns String com horário no formato HH:MM
 */
export function getTimeInTimezone(timezone: string): string {
  let result: string = "00:00";

  try {
    const now = getNowInTimezone(timezone);
    result = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    // Log removido para otimização
    result = "00:00";
  } finally {
    if (!result || result.trim() === "") {
      result = "00:00";
    }
  }

  return result;
}

/**
 * Obtém a data no timezone especificado (alias para parseDateInTimezone)
 * @param dateString - String de data
 * @param timezone - Timezone de destino
 * @returns Date convertida
 */
export function getDateInTimezone(dateString: string, timezone: string): Date {
  let result: Date = new Date();

  try {
    result = parseDateInTimezone(dateString, timezone);
  } catch (error) {
    // Log removido para otimização
    result = new Date();
  } finally {
    if (!result || isNaN(result.getTime())) {
      result = new Date();
    }
  }

  return result;
}

/**
 * Obtém o dia da semana no timezone especificado
 * @param date - Data para obter o dia da semana
 * @param timezone - Timezone para conversão
 * @returns Índice do dia da semana (0 = domingo)
 */
export function getDayOfWeekInTimezone(date: Date, timezone: string): number {
  let result: number = 0;

  try {
    const dateInTimezone = toCurrentTimezone(date, timezone);
    result = dateInTimezone.getDay();
  } catch (error) {
    // Log removido para otimização
    result = 0;
  } finally {
    if (isNaN(result) || result < 0 || result > 6) {
      result = 0;
    }
  }

  return result;
}

/**
 * Obtém o nome do dia da semana no timezone especificado
 * @param date - Data para obter o dia da semana
 * @param timezone - Timezone para conversão
 * @returns Nome do dia da semana
 */
export function getDayNameInTimezone(date: Date, timezone: string): string {
  let result: string = "desconhecido";

  try {
    const dias = [
      "domingo",
      "segunda",
      "terca",
      "quarta",
      "quinta",
      "sexta",
      "sabado",
    ];
    const dayIndex = getDayOfWeekInTimezone(date, timezone);
    result = dias[dayIndex] || "desconhecido";
  } catch (error) {
    // Log removido para otimização
    result = "desconhecido";
  } finally {
    if (!result || result.trim() === "") {
      result = "desconhecido";
    }
  }

  return result;
}

/**
 * Cria uma data no timezone especificado (alias para toCurrentTimezone)
 * @param date - Data base
 * @param timezone - Timezone de destino
 * @returns Data convertida
 */
export function createDateInTimezone(date: Date, timezone: string): Date {
  let result: Date = new Date();

  try {
    result = toCurrentTimezone(date, timezone);
  } catch (error) {
    // Log removido para otimização
    result = new Date();
  } finally {
    if (!result || isNaN(result.getTime())) {
      result = new Date();
    }
  }

  return result;
}

/**
 * Compara duas datas no timezone especificado
 * @param date1 - Primeira data
 * @param date2 - Segunda data
 * @param timezone - Timezone para comparação
 * @returns -1 se date1 < date2, 0 se iguais, 1 se date1 > date2
 */
export function compareDatesInTimezone(
  date1: Date,
  date2: Date,
  timezone: string
): number {
  let result: number = 0;

  try {
    const d1 = toCurrentTimezone(date1, timezone);
    const d2 = toCurrentTimezone(date2, timezone);

    if (d1 < d2) result = -1;
    else if (d1 > d2) result = 1;
    else result = 0;
  } catch (error) {
    // Log removido para otimização
    result = 0;
  } finally {
    if (isNaN(result)) {
      result = 0;
    }
  }

  return result;
}

/**
 * Verifica se uma data é hoje no timezone especificado
 * @param date - Data para verificar
 * @param timezone - Timezone para verificação
 * @returns true se a data for hoje
 */
export function isTodayInTimezone(date: Date, timezone: string): boolean {
  let result: boolean = false;

  try {
    const today = getNowInTimezone(timezone);
    const dateInTimezone = toCurrentTimezone(date, timezone);

    result = today.toDateString() === dateInTimezone.toDateString();
  } catch (error) {
    // Log removido para otimização
    result = false;
  } finally {
    // Garantir que sempre retornamos um boolean válido
    if (typeof result !== "boolean") {
      result = false;
    }
  }

  return result;
}

/**
 * Verifica se uma data é futura no timezone especificado
 * @param date - Data para verificar
 * @param timezone - Timezone para verificação
 * @returns true se a data for futura
 */
export function isFutureInTimezone(date: Date, timezone: string): boolean {
  let result: boolean = false;

  try {
    const now = getNowInTimezone(timezone);
    const dateInTimezone = toCurrentTimezone(date, timezone);

    result = dateInTimezone > now;
  } catch (error) {
    // Log removido para otimização
    result = false;
  } finally {
    // Garantir que sempre retornamos um boolean válido
    if (typeof result !== "boolean") {
      result = false;
    }
  }

  return result;
}

/**
 * Verifica se uma data é passada no timezone especificado
 * @param date - Data para verificar
 * @param timezone - Timezone para verificação
 * @returns true se a data for passada
 */
export function isPastInTimezone(date: Date, timezone: string): boolean {
  let result: boolean = false;

  try {
    const now = getNowInTimezone(timezone);
    const dateInTimezone = toCurrentTimezone(date, timezone);

    result = dateInTimezone < now;
  } catch (error) {
    // Log removido para otimização
    result = false;
  } finally {
    // Garantir que sempre retornamos um boolean válido
    if (typeof result !== "boolean") {
      result = false;
    }
  }

  return result;
}

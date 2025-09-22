/**
 * Infrastructure Layer - Time Utilities
 *
 * Utilitários para manipulação de tempo e horários.
 * Fornece funções para conversão entre formatos de tempo e cálculos.
 */

import { log } from "./logger.util";

/**
 * Converte horário (HH:MM) para minutos desde meia-noite
 * @param hora - Horário no formato HH:MM
 * @returns Minutos desde meia-noite
 */
export function horaParaMinutos(hora: string): number {
  let horas: number = 0;
  let minutos: number = 0;
  let result: number = 0;

  try {
    if (!isValidTimeFormat(hora)) {
      throw new Error(`Formato de hora inválido: ${hora}`);
    }

    const timeParts = hora.split(":");
    horas = parseInt(timeParts[0] || "0", 10);
    minutos = parseInt(timeParts[1] || "0", 10);
  } catch (error) {
    // Se é um erro de formato inválido, relançar o erro original
    if (
      error instanceof Error &&
      error.message.includes("Formato de hora inválido")
    ) {
      throw error;
    }
    log.error("Erro ao processar horário", error as Error);
    throw new Error(`Erro ao processar horário: ${hora}`);
  } finally {
    // Garantir que sempre temos valores válidos
    if (isNaN(horas) || isNaN(minutos)) {
      throw new Error(`Valores de horário inválidos: ${hora}`);
    }
  }

  try {
    result = (horas || 0) * 60 + (minutos || 0);
  } catch (error) {
    log.error("Erro ao calcular minutos", error as Error);
    throw new Error(`Erro ao calcular minutos para: ${hora}`);
  } finally {
    // Garantir que o resultado é válido
    if (result < 0 || result > 1440) {
      throw new Error(`Resultado de minutos inválido: ${result}`);
    }
  }

  return result;
}

/**
 * Converte minutos desde meia-noite para horário (HH:MM)
 * @param minutos - Minutos desde meia-noite
 * @returns Horário no formato HH:MM
 */
export function minutosParaHora(minutos: number): string {
  let normalizedMinutes: number = 0;
  let horas: number = 0;
  let mins: number = 0;
  let result: string = "";

  try {
    // Normalizar minutos para o range 0-1439 (24h)
    normalizedMinutes = minutos;
    while (normalizedMinutes < 0) {
      normalizedMinutes += 24 * 60;
    }
    normalizedMinutes = normalizedMinutes % (24 * 60);
  } catch (error) {
    log.error("Erro ao normalizar minutos", error as Error);
    throw new Error(`Erro ao normalizar minutos: ${minutos}`);
  } finally {
    // Garantir que temos um valor válido
    if (isNaN(normalizedMinutes) || normalizedMinutes < 0) {
      throw new Error(`Minutos normalizados inválidos: ${normalizedMinutes}`);
    }
  }

  try {
    horas = Math.floor(normalizedMinutes / 60);
    mins = normalizedMinutes % 60;
  } catch (error) {
    log.error("Erro ao calcular horas e minutos", error as Error);
    throw new Error(
      `Erro ao calcular horas e minutos para: ${normalizedMinutes}`
    );
  } finally {
    // Garantir que os valores são válidos
    if (
      isNaN(horas) ||
      isNaN(mins) ||
      horas < 0 ||
      horas > 23 ||
      mins < 0 ||
      mins > 59
    ) {
      throw new Error(`Valores de hora/minuto inválidos: ${horas}:${mins}`);
    }
  }

  try {
    result = `${horas.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    log.error("Erro ao formatar horário", error as Error);
    throw new Error(`Erro ao formatar horário: ${horas}:${mins}`);
  } finally {
    // Garantir que o resultado é válido
    if (!result || !isValidTimeFormat(result)) {
      throw new Error(`Horário formatado inválido: ${result}`);
    }
  }

  return result;
}

/**
 * Obtém o índice do dia da semana (0 = domingo, 1 = segunda, etc.)
 * @param data - Data para obter o dia da semana
 * @returns Índice do dia da semana
 */
export function diaIndex(data: Date): number {
  return data.getDay();
}

/**
 * Obtém o nome do dia da semana em português
 * @param data - Data para obter o dia da semana
 * @returns Nome do dia da semana
 */
export function nomeDiaSemana(data: Date): string {
  const dias = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];
  return dias[data.getDay()] || "desconhecido";
}

/**
 * Obtém o nome do dia da semana em português por índice
 * @param indice - Índice do dia (0 = domingo, 1 = segunda, etc.)
 * @returns Nome do dia da semana
 */
export function nomeDiaSemanaPorIndice(indice: number): string {
  const dias = [
    "domingo",
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
  ];
  return dias[indice] || "desconhecido";
}

/**
 * Verifica se um horário está no formato válido (HH:MM)
 * @param hora - Horário a ser validado
 * @returns true se o formato for válido
 */
export function isValidTimeFormat(hora: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(hora);
}

/**
 * Normaliza horário para formato HH:MM
 * @param hora - Horário a ser normalizado
 * @returns Horário normalizado
 */
export function normalizarHorario(hora: string): string {
  let horas: number = 0;
  let minutos: number = 0;
  let result: string = "";

  try {
    if (!isValidTimeFormat(hora)) {
      throw new Error(`Formato de horário inválido: ${hora}`);
    }

    const timeParts = hora.split(":");
    horas = parseInt(timeParts[0] || "0", 10);
    minutos = parseInt(timeParts[1] || "0", 10);
  } catch (error) {
    log.error("Erro ao processar horário para normalização", error as Error);
    throw new Error(`Erro ao processar horário: ${hora}`);
  } finally {
    // Garantir que temos valores válidos
    if (isNaN(horas!) || isNaN(minutos!)) {
      throw new Error(
        `Valores de horário inválidos para normalização: ${hora}`
      );
    }
  }

  try {
    result = `${(horas || 0).toString().padStart(2, "0")}:${(minutos || 0)
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    log.error("Erro ao normalizar horário", error as Error);
    throw new Error(`Erro ao normalizar horário: ${horas}:${minutos}`);
  } finally {
    // Garantir que o resultado é válido
    if (!result || !isValidTimeFormat(result)) {
      throw new Error(`Horário normalizado inválido: ${result}`);
    }
  }

  return result;
}

/**
 * Calcula a diferença em minutos entre dois horários
 * @param hora1 - Primeiro horário
 * @param hora2 - Segundo horário
 * @returns Diferença em minutos
 */
export function diferencaMinutos(hora1: string, hora2: string): number {
  const minutos1 = horaParaMinutos(hora1);
  const minutos2 = horaParaMinutos(hora2);
  return Math.abs(minutos2 - minutos1);
}

/**
 * Adiciona minutos a um horário
 * @param hora - Horário base
 * @param minutos - Minutos a adicionar
 * @returns Novo horário
 */
export function adicionarMinutos(hora: string, minutos: number): string {
  const minutosAtuais = horaParaMinutos(hora);
  const novosMinutos = (minutosAtuais + minutos) % (24 * 60);
  return minutosParaHora(novosMinutos);
}

/**
 * Subtrai minutos de um horário
 * @param hora - Horário base
 * @param minutos - Minutos a subtrair
 * @returns Novo horário
 */
export function subtrairMinutos(hora: string, minutos: number): string {
  const minutosAtuais = horaParaMinutos(hora);
  let novosMinutos = minutosAtuais - minutos;

  // Garantir que não seja negativo
  while (novosMinutos < 0) {
    novosMinutos += 24 * 60;
  }

  return minutosParaHora(novosMinutos);
}

/**
 * Verifica se um horário está entre dois outros horários
 * @param hora - Horário a verificar
 * @param inicio - Horário de início
 * @param fim - Horário de fim
 * @returns true se o horário estiver no intervalo
 */
export function horarioEntre(
  hora: string,
  inicio: string,
  fim: string
): boolean {
  const minutosHora = horaParaMinutos(hora);
  const minutosInicio = horaParaMinutos(inicio);
  const minutosFim = horaParaMinutos(fim);

  if (minutosInicio <= minutosFim) {
    // Intervalo normal (ex: 08:00 - 18:00)
    return minutosHora >= minutosInicio && minutosHora <= minutosFim;
  } else {
    // Intervalo que cruza meia-noite (ex: 22:00 - 06:00)
    return minutosHora >= minutosInicio || minutosHora <= minutosFim;
  }
}

/**
 * Obtém os minutos do dia atual
 * @param data - Data para obter os minutos
 * @returns Minutos desde meia-noite
 */
export function minutosDoDia(data: Date): number {
  return data.getHours() * 60 + data.getMinutes();
}

/**
 * Formata data para string ISO
 * @param data - Data para formatar
 * @returns String ISO da data
 */
export function formatarDataParaISO(data: Date): string {
  let isoString: string = "";
  let result: string = "";

  try {
    if (!data || !(data instanceof Date)) {
      throw new Error("Data inválida fornecida");
    }

    if (isNaN(data.getTime())) {
      throw new Error("Data com valor inválido");
    }

    isoString = data.toISOString();
  } catch (error) {
    log.error("Erro ao converter data para ISO", error as Error);
    throw new Error(`Erro ao converter data para ISO: ${data}`);
  } finally {
    // Garantir que temos uma string ISO válida
    if (!isoString || !isoString.includes("T")) {
      throw new Error(`String ISO inválida: ${isoString}`);
    }
  }

  try {
    result = isoString.split("T")[0] || "";
  } catch (error) {
    log.error("Erro ao extrair data da string ISO", error as Error);
    throw new Error(`Erro ao extrair data da string ISO: ${isoString}`);
  } finally {
    // Garantir que temos um resultado válido
    if (!result || result.length !== 10) {
      throw new Error(`Data ISO formatada inválida: ${result}`);
    }
  }

  return result;
}

/**
 * Verifica se uma data é hoje
 * @param data - Data para verificar
 * @returns true se a data for hoje
 */
export function ehHoje(data: Date): boolean {
  const hoje = new Date();
  return formatarDataParaISO(data) === formatarDataParaISO(hoje);
}

/**
 * Verifica se uma data é fim de semana
 * @param data - Data para verificar
 * @returns true se for fim de semana
 */
export function ehFimDeSemana(data: Date): boolean {
  const dia = data.getDay();
  return dia === 0 || dia === 6; // Domingo ou sábado
}

/**
 * Obtém o próximo dia útil
 * @param data - Data base
 * @returns Próximo dia útil
 */
export function proximoDiaUtil(data: Date): Date {
  const proximaData = new Date(data);
  proximaData.setDate(proximaData.getDate() + 1);

  while (ehFimDeSemana(proximaData)) {
    proximaData.setDate(proximaData.getDate() + 1);
  }

  return proximaData;
}

/**
 * Obtém o dia útil anterior
 * @param data - Data base
 * @returns Dia útil anterior
 */
export function diaUtilAnterior(data: Date): Date {
  const dataAnterior = new Date(data);
  dataAnterior.setDate(dataAnterior.getDate() - 1);

  while (ehFimDeSemana(dataAnterior)) {
    dataAnterior.setDate(dataAnterior.getDate() - 1);
  }

  return dataAnterior;
}

/**
 * Valida formato de horário (alias para isValidTimeFormat)
 * @param hora - Horário a ser validado
 * @returns true se o formato for válido
 */
export function validarFormatoHora(hora: string): boolean {
  return isValidTimeFormat(hora);
}

/**
 * Infrastructure Layer - Utilitários para Feriados
 *
 * Esta camada contém utilitários para carregar e processar feriados
 * a partir do arquivo feriados.json.
 */

import { Feriado } from "../../domain/entities/horario-comercial.entity.js";
import { readFileSync } from "fs";
import { join } from "path";

// Usar diretório de trabalho atual
const currentDir = process.cwd();

// Carregar feriados do arquivo JSON
const feriadosData = JSON.parse(
  readFileSync(join(currentDir, "feriados.json"), "utf-8")
);

/**
 * Carrega os feriados do arquivo feriados.json.
 * @returns Array de feriados com informações completas
 */
export function carregarFeriados(): readonly Feriado[] {
  return feriadosData as readonly Feriado[];
}

/**
 * Filtra feriados que ainda não passaram baseado na data atual.
 * @param feriados - Array de feriados para filtrar
 * @param dataAtual - Data atual para comparação (padrão: new Date())
 * @returns Array de feriados futuros
 */
export function obterFeriadosFuturos(
  feriados: readonly Feriado[],
  dataAtual: Date = new Date()
): readonly Feriado[] {
  const hoje = dataAtual.toISOString().split("T")[0]; // YYYY-MM-DD
  return feriados.filter((feriado) => feriado.data >= (hoje || ""));
}

/**
 * Filtra feriados que já passaram baseado na data atual.
 * @param feriados - Array de feriados para filtrar
 * @param dataAtual - Data atual para comparação (padrão: new Date())
 * @returns Array de feriados passados
 */
export function obterFeriadosPassados(
  feriados: readonly Feriado[],
  dataAtual: Date = new Date()
): readonly Feriado[] {
  const hoje = dataAtual.toISOString().split("T")[0]; // YYYY-MM-DD
  return feriados.filter((feriado) => feriado.data < (hoje || ""));
}

/**
 * Verifica se uma data específica é um feriado.
 * @param data - Data para verificar (Date ou string)
 * @param feriados - Array de feriados para consultar
 * @returns true se for feriado, false caso contrário
 */
export function ehFeriado(
  data: Date | string,
  feriados: readonly Feriado[]
): boolean {
  const dataStr =
    typeof data === "string" ? data : data.toISOString().split("T")[0];
  return feriados.some((feriado) => feriado.data === dataStr);
}

/**
 * Obtém o feriado de uma data específica.
 * @param data - Data para consultar (Date ou string)
 * @param feriados - Array de feriados para consultar
 * @returns Feriado encontrado ou undefined
 */
export function obterFeriadoPorData(
  data: Date | string,
  feriados: readonly Feriado[]
): Feriado | undefined {
  const dataStr =
    typeof data === "string" ? data : data.toISOString().split("T")[0];
  return feriados.find((feriado) => feriado.data === dataStr);
}

/**
 * Obtém apenas as datas dos feriados (formato antigo para compatibilidade).
 * @param feriados - Array de feriados para extrair datas
 * @returns Array de strings com as datas dos feriados
 */
export function obterDatasFeriados(
  feriados: readonly Feriado[]
): readonly string[] {
  return feriados.map((feriado) => feriado.data);
}

/**
 * Obtém feriados de um mês específico.
 * @param mes - Mês para filtrar (1-12)
 * @param feriados - Array de feriados para filtrar
 * @returns Array de feriados do mês especificado
 */
export function obterFeriadosPorMes(
  mes: number,
  feriados: readonly Feriado[]
): readonly Feriado[] {
  return feriados.filter((feriado) => {
    const mesFeriado = parseInt(feriado.data.split("-")[1] || "0");
    return mesFeriado === mes;
  });
}

/**
 * Obtém feriados de um ano específico.
 * @param ano - Ano para filtrar (ex: 2025)
 * @param feriados - Array de feriados para filtrar
 * @returns Array de feriados do ano especificado
 */
export function obterFeriadosPorAno(
  ano: number,
  feriados: readonly Feriado[]
): readonly Feriado[] {
  return feriados.filter((feriado) => {
    const anoFeriado = parseInt(feriado.data.split("-")[0] || "0");
    return anoFeriado === ano;
  });
}

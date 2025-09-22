/**
 * Infrastructure Layer - Utilitários de Normalização
 *
 * Funções para normalização de dias e horários.
 * Implementações concretas das regras de normalização.
 */

import type {
  DiaChave,
  Intervalo,
  Horario,
} from "../../domain/entities/horario-comercial.entity.js";

const nomesPadrao = new Map([
  ["domingo", 0],
  ["dom", 0],
  ["sunday", 0],
  ["segunda", 1],
  ["segunda-feira", 1],
  ["seg", 1],
  ["monday", 1],
  ["terca", 2],
  ["terca-feira", 2],
  ["ter", 2],
  ["tuesday", 2],
  ["terça", 2],
  ["quarta", 3],
  ["quarta-feira", 3],
  ["wed", 3],
  ["wednesday", 3],
  ["quinta", 4],
  ["quinta-feira", 4],
  ["thu", 4],
  ["thursday", 4],
  ["sexta", 5],
  ["sexta-feira", 5],
  ["fri", 5],
  ["friday", 5],
  ["sabado", 6],
  ["sábado", 6],
  ["sat", 6],
  ["saturday", 6],
] as const);

/**
 * Normaliza uma chave de dia da semana para um número (0-6).
 * Aceita números, nomes em português ou inglês, com ou sem acentos.
 * @param k - Chave do dia (número ou string)
 * @returns Número do dia da semana (0=domingo, 6=sábado)
 * @throws Error se a chave for inválida
 */
export const normalizarDia = (k: DiaChave): number => {
  if (typeof k === "number") {
    if (k >= 0 && k <= 6) return k;
    throw new Error("Número de dia inválido. Use 0 (domingo) até 6 (sábado).");
  }
  const key = String(k)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
  const found = nomesPadrao.get(key as any);
  if (found === undefined) {
    throw new Error(`Nome de dia desconhecido: ${k}`);
  }
  return found;
};

/**
 * Normaliza um objeto de horário comercial para o formato padrão.
 * Converte chaves de dias para números e garante que intervalos sejam arrays.
 * @param input - Objeto com horários por dia da semana
 * @returns Objeto normalizado com horários por dia
 * @throws Error se houver intervalos inválidos
 */
export const normalizarHorario = (
  input: Record<DiaChave, Intervalo[] | Intervalo> | null | undefined
): Horario => {
  const out: Record<string, Intervalo[]> = {};

  // Verificar se input é válido
  if (!input || typeof input !== "object") {
    throw new Error("Input deve ser um objeto válido");
  }

  for (const [k, value] of Object.entries(input)) {
    const keyRaw = isNaN(Number(k)) ? k : Number(k);
    const nk = normalizarDia(keyRaw);
    const dayStr = String(nk);
    const arr = Array.isArray(value) ? value : [value];

    out[dayStr] = arr.map((iv: Intervalo) => {
      if (!iv.abertura || !iv.fechamento) {
        throw new Error("Intervalo precisa ter abertura e fechamento");
      }
      return { abertura: iv.abertura, fechamento: iv.fechamento } as const;
    });
  }

  return out as Horario;
};

/**
 * Obtém o nome do dia da semana a partir do número.
 * @param numero - Número do dia da semana (0-6)
 * @returns Nome do dia da semana em português
 * @throws Error se o número for inválido
 */
export const obterNomeDia = (numero: number): string => {
  const nomes = [
    "domingo",
    "segunda",
    "terça",
    "quarta",
    "quinta",
    "sexta",
    "sábado",
  ];
  if (numero < 0 || numero > 6) {
    throw new Error("Número de dia inválido");
  }
  const nome = nomes[numero];
  if (nome === undefined) {
    throw new Error("Número de dia inválido");
  }
  return nome;
};

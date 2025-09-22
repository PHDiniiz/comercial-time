/**
 * Domain Layer - Entidades e Regras de Negócio
 *
 * Esta camada contém as entidades de domínio e regras de negócio fundamentais.
 * Define o que é um horário comercial, suas propriedades e comportamentos essenciais.
 */

/** Tipo que representa uma chave de dia da semana (número ou nome) */
export type DiaChave = number | string; // 0 (domingo) - 6 (sábado) ou nomes 'segunda', 'monday', etc

/** Tipo que representa uma string de hora no formato HH:mm */
export type HoraString = string; // "HH:mm"

/**
 * Interface que representa um feriado com informações completas.
 * Contém nome, data e observações.
 */
export interface Feriado {
  /** Nome do feriado */
  readonly nome: string;
  /** Data do feriado no formato YYYY-MM-DD */
  readonly data: string;
  /** Observações sobre o feriado */
  readonly observacoes: string;
}

/**
 * Interface que representa um intervalo de horário comercial.
 * Define os horários de abertura e fechamento de um período.
 */
export interface Intervalo {
  /** Horário de abertura no formato HH:mm */
  readonly abertura: HoraString;
  /** Horário de fechamento no formato HH:mm */
  readonly fechamento: HoraString;
}

/**
 * Interface que representa o horário comercial completo.
 * Mapeia cada dia da semana para seus intervalos de funcionamento.
 */
export interface Horario {
  /** Mapeamento de dia (string) para array de intervalos */
  readonly [dia: string]: readonly Intervalo[];
}

/**
 * Interface que representa a entidade completa de horário comercial.
 * Contém o horário, feriados e status atual do estabelecimento.
 */
export interface HorarioComercialEntity {
  /** Configuração de horários por dia da semana */
  readonly horario: Horario;
  /** Array de feriados com informações completas */
  readonly feriados: readonly Feriado[];
  /** Status atual do estabelecimento (aberto/fechado) */
  readonly openedNow: boolean;
}

/**
 * Constantes que definem os dias da semana como números.
 * Segue o padrão JavaScript onde domingo = 0, segunda = 1, etc.
 */
export const DIAS_SEMANA = {
  /** Domingo (0) */
  DOMINGO: 0,
  /** Segunda-feira (1) */
  SEGUNDA: 1,
  /** Terça-feira (2) */
  TERCA: 2,
  /** Quarta-feira (3) */
  QUARTA: 3,
  /** Quinta-feira (4) */
  QUINTA: 4,
  /** Sexta-feira (5) */
  SEXTA: 5,
  /** Sábado (6) */
  SABADO: 6,
} as const;

/**
 * Constantes que definem horários padrão para estabelecimentos comerciais.
 * Usado como fallback quando não há configuração específica.
 */
export const HORARIO_PADRAO = {
  /** Horário padrão de abertura */
  ABERTURA: "08:00",
  /** Horário padrão de fechamento */
  FECHAMENTO: "18:00",
} as const;

/** Máximo de dias para buscar próxima abertura (limite de performance) */
export const LIMITE_BUSCA_DIAS = 14;

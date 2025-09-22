/**
 * @phdiniiz/comercialTime
 * API em Português (pt-BR) para horários comerciais.
 *
 * Implementação seguindo Clean Architecture com camadas bem definidas:
 * - Domain: Entidades e regras de negócio
 * - Application: Casos de uso
 * - Infrastructure: Serviços e utilitários
 * - Presentation: Controllers e interfaces
 * - Core: Sistema de importação modular
 *
 * Exportações principais:
 * - comercialTime (instância principal com sistema modular)
 * - incluir() (função para importação seletiva)
 * - HorarioComercial (classe principal para compatibilidade)
 * - helpers: horaParaMinutos, minutosParaHora, normalizarDia, normalizarHorario
 */

// Exportar sistema modular principal
export {
  default as comercialTime,
  criarComercialTime as incluir,
} from "./core/comercial-time";

// Re-exportar tipos do domínio
export type {
  DiaChave,
  HoraString,
  Intervalo,
  Horario,
  Feriado,
} from "./domain/entities/horario-comercial.entity";

// Re-exportar utilitários essenciais
export {
  horaParaMinutos,
  minutosParaHora,
  diaIndex,
  minutosDoDia,
  validarFormatoHora,
  formatarDataParaISO,
} from "./infrastructure/utils/time.util";

export {
  normalizarDia,
  normalizarHorario,
  obterNomeDia,
} from "./infrastructure/utils/normalize.util";

// Re-exportar utilitários de feriados
export {
  carregarFeriados,
  obterFeriadosFuturos,
  obterFeriadosPassados,
  ehFeriado,
  obterFeriadoPorData,
  obterDatasFeriados,
  obterFeriadosPorMes,
  obterFeriadosPorAno,
} from "./infrastructure/utils/feriados.util";

// Re-exportar utilitários de localização
export {
  carregarFeriadosNacionais,
  carregarFeriadosEstaduais,
  carregarDadosLocalizacao,
  listarLocalizacoesDisponiveis,
  localizacaoValida,
  carregarFeriadosPersonalizados,
  feriadosPersonalizadosDisponiveis,
  obterInfoFeriadosPersonalizados,
} from "./infrastructure/utils/locale.util";

// Re-exportar sistema de atualização de feriados
export {
  inicializarCronJobFeriados,
  inicializarCronJobFeriadosPorPais,
  executarAtualizacaoManual,
} from "./cronjob/feriado-update.cronjob";

export { FeriadoUpdateFactory } from "./presentation/factories/feriado-update.factory";
export type {
  FeriadoUpdateConfig,
  FeriadoUpdateResult,
} from "./domain/entities/feriado-update.entity";

// Sistema de inicialização simplificado
import { inicializarCronJobFeriados } from "./cronjob/feriado-update.cronjob";
import { getCurrentTimezone } from "./config/timezone.config";

/**
 * Interface para configuração de inicialização
 */
export interface InicializacaoConfig {
  /** Timezone para configuração (ex: "America/Sao_Paulo") - OBRIGATÓRIO */
  timezone: string;
  /** Inicializar CRONJOB automaticamente */
  inicializarCronJob?: boolean;
  /** Intervalo do CRONJOB em minutos */
  intervaloCronJob?: number;
  /** Timeout das requisições em milissegundos */
  timeoutRequisicoes?: number;
}

/**
 * Detecta país, locale e capital baseado no timezone
 */
function detectarPaisPorTimezone(timezone: string): {
  pais: string;
  locale: string;
  capital: string;
} {
  if (
    timezone === "America/Sao_Paulo" ||
    timezone.includes("America/Sao_Paulo")
  ) {
    return { pais: "BR", locale: "pt-br", capital: "BRASILIA" };
  } else if (
    timezone === "America/New_York" ||
    timezone.includes("America/New_York")
  ) {
    return { pais: "US", locale: "en-US", capital: "WASHINGTON" };
  } else if (
    timezone === "Europe/Lisbon" ||
    timezone.includes("Europe/Lisbon")
  ) {
    return { pais: "PT", locale: "pt-PT", capital: "LISBOA" };
  }
  return { pais: "BR", locale: "pt-br", capital: "BRASILIA" };
}

/**
 * Inicializa o módulo de horários comerciais
 */
export async function inicializarComercialTime(
  config: InicializacaoConfig
): Promise<{
  sucesso: boolean;
  timezone: string;
  pais: string;
  locale: string;
  capital: string;
  cronJobIniciado: boolean;
  mensagem: string;
}> {
  try {
    if (!config.timezone) {
      throw new Error(
        "Timezone é obrigatório. Use: { timezone: 'America/Sao_Paulo' }"
      );
    }

    process.env.TIMEZONE = config.timezone;

    if (config.intervaloCronJob) {
      process.env.FERIADO_UPDATE_INTERVAL_MINUTES =
        config.intervaloCronJob.toString();
    }
    if (config.timeoutRequisicoes) {
      process.env.FERIADO_UPDATE_TIMEOUT_MS =
        config.timeoutRequisicoes.toString();
    }

    const { pais, locale, capital } = detectarPaisPorTimezone(config.timezone);
    let cronJobIniciado = false;

    if (config.inicializarCronJob !== false) {
      setTimeout(() => inicializarCronJobFeriados(), 50);
      cronJobIniciado = true;
    }

    return {
      sucesso: true,
      timezone: config.timezone,
      pais,
      locale,
      capital,
      cronJobIniciado,
      mensagem: `Módulo inicializado com sucesso para ${pais} (${locale})`,
    };
  } catch (error) {
    const erro = error instanceof Error ? error.message : String(error);
    return {
      sucesso: false,
      timezone: config.timezone || "America/Sao_Paulo",
      pais: "BR",
      locale: "pt-br",
      capital: "BRASILIA",
      cronJobIniciado: false,
      mensagem: `Erro na inicialização: ${erro}`,
    };
  }
}

/**
 * Função principal para inicializar o módulo
 */
export async function inicializar(
  timezone: string,
  opcoes: Omit<InicializacaoConfig, "timezone"> = {}
) {
  return inicializarComercialTime({ timezone, ...opcoes });
}

/**
 * Inicialização rápida sem CRONJOB
 */
export async function inicializarRapido(timezone: string) {
  return inicializarComercialTime({
    timezone,
    inicializarCronJob: false,
  });
}

/**
 * Inicializa o módulo para Brasil (pt-BR)
 */
export async function inicializarParaBrasil(
  opcoes: Omit<InicializacaoConfig, "timezone"> = {}
) {
  return inicializarComercialTime({
    timezone: "America/Sao_Paulo",
    ...opcoes,
  });
}

/**
 * Obtém informações sobre o timezone atual
 */
export function obterInfoTimezone() {
  const timezone = getCurrentTimezone();
  return { timezone, ...detectarPaisPorTimezone(timezone) };
}

/**
 * Verifica se o módulo está inicializado
 */
export function estaInicializado(): boolean {
  return process.env.TIMEZONE !== undefined;
}

// Re-exportar utilitários de timezone essenciais
export {
  toCurrentTimezone,
  getNowInTimezone,
  formatDateInTimezone,
  getTimeInTimezone,
  getDateInTimezone,
  getDayOfWeekInTimezone,
  getDayNameInTimezone,
  createDateInTimezone,
  compareDatesInTimezone,
  isTodayInTimezone,
  isFutureInTimezone,
  isPastInTimezone,
} from "./infrastructure/utils/timezone.util";

// Re-exportar configuração de timezone
export {
  timezoneManager,
  getCurrentTimezone,
  getCurrentDate,
  formatDate,
  setTimezone,
  DEFAULT_TIMEZONE_CONFIG,
} from "./config/timezone.config";

// Classe principal para compatibilidade
export { HorarioComercial } from "./legacy/horario-comercial.legacy";

// Exportar factories essenciais
export {
  HorarioComercialFactory,
  type HorarioComercialFactoryConfig,
} from "./presentation/factories/horario-comercial.factory";

export {
  OptimizedHorarioComercialFactory,
  type OptimizedHorarioComercialFactoryConfig,
} from "./presentation/factories/optimized-horario-comercial.factory";

// Exportar casos de uso essenciais
export {
  HorarioComercialUseCaseImpl,
  type HorarioComercialUseCase,
  type HorarioComercialUseCaseConfig,
} from "./application/use-cases/horario-comercial.use-case";

// Exportar serviços essenciais
export { OptimizedHorarioComercialService } from "./application/services/optimized-horario-comercial.service";
export { Logger, LogLevel, log } from "./infrastructure/utils/logger.util";

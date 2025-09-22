/**
 * Presentation Layer - Factory Otimizada
 *
 * Factory para criar instâncias otimizadas da aplicação com
 * cache inteligente e otimizações de performance.
 */

import type {
  DiaChave,
  Intervalo,
} from "../../domain/entities/horario-comercial.entity.js";
import type { IncluirConfig } from "../../core/comercial-time";
import type { FeriadoUpdateConfig } from "../../domain/entities/feriado-update.entity";
import { ComercialTime } from "../../core/comercial-time";
import { HorarioComercialUseCaseImpl } from "../../application/use-cases/horario-comercial.use-case";
import { OptimizedHorarioComercialService } from "../../application/services/optimized-horario-comercial.service";
import { OptimizedHorarioComercialControllerImpl } from "../../presentation/controllers/optimized-horario-comercial.controller";
import { FeriadoUpdateServiceImpl } from "../../application/services/feriado-update.service";

/**
 * Interface para configuração da factory otimizada
 */
export interface OptimizedHorarioComercialFactoryConfig {
  /** Configuração de horários por dia da semana */
  horarioInput: Record<DiaChave, Intervalo[] | Intervalo>;
  /** Configuração de feriados a incluir */
  feriadosConfig?: IncluirConfig;
  /** Configuração do serviço de atualização de feriados */
  feriadoUpdateConfig?: FeriadoUpdateConfig;
  /** Configurações de performance */
  performanceConfig?: {
    /** Tamanho máximo do cache */
    maxCacheSize?: number;
    /** Habilitar cache inteligente */
    enableSmartCache?: boolean;
  };
}

/**
 * Factory otimizada para criar instâncias da aplicação com otimizações de performance.
 * Utiliza cache inteligente e memoização para operações frequentes.
 */
export class OptimizedHorarioComercialFactory {
  /**
   * Cria uma instância completa otimizada da aplicação com todas as dependências.
   * @param config - Configuração completa da factory
   * @returns Promise com objeto contendo todas as instâncias otimizadas
   */
  static async create(config: OptimizedHorarioComercialFactoryConfig) {
    // Cria instância do sistema modular
    const comercialTime = await ComercialTime.create(config.feriadosConfig);

    // Cria instância do HorarioComercial com feriados carregados
    const horarioComercial = comercialTime.criarHorarioComercial(
      config.horarioInput
    );

    // Cria caso de uso moderno
    const useCase = await HorarioComercialUseCaseImpl.create({
      horarioInput: config.horarioInput,
      ...(config.feriadosConfig && { feriadosConfig: config.feriadosConfig }),
    });

    // Cria serviço otimizado
    const feriadosStrings = comercialTime.obterFeriados().map((f) => f.data);
    const optimizedService = new OptimizedHorarioComercialService(
      config.horarioInput,
      feriadosStrings
    );

    // Cria controller otimizado
    const optimizedController = new OptimizedHorarioComercialControllerImpl(
      useCase,
      optimizedService
    );

    // Cria serviço de atualização de feriados se configurado
    let feriadoUpdateService: FeriadoUpdateServiceImpl | undefined;
    if (config.feriadoUpdateConfig) {
      feriadoUpdateService = new FeriadoUpdateServiceImpl(
        config.feriadoUpdateConfig
      );
    }

    return {
      // Instâncias principais
      horarioComercial,
      comercialTime,
      useCase,

      // Instâncias otimizadas
      optimizedService,
      optimizedController,

      // Serviços
      feriadoUpdateService,

      // Aliases para compatibilidade
      service: horarioComercial,
      controller: horarioComercial,

      // Métodos utilitários
      obterInfoFeriados: () => comercialTime.obterInfoFeriados(),
      obterEstadosDisponiveis: () => comercialTime.obterEstadosDisponiveis(),
      estadoDisponivel: (sigla: string) =>
        comercialTime.estadoDisponivel(sigla),

      // Métodos de performance
      obterEstatisticasPerformance: () =>
        optimizedService.obterEstatisticasCache(),
      limparCache: () => optimizedService.limparCache(),
    };
  }

  /**
   * Cria uma instância simplificada otimizada apenas com horário comercial.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param feriadosConfig - Configuração opcional de feriados
   * @returns Promise com instância otimizada do HorarioComercial
   */
  static async createSimple(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    feriadosConfig?: IncluirConfig
  ) {
    const comercialTime = await ComercialTime.create(feriadosConfig);
    const feriadosStrings = comercialTime.obterFeriados().map((f) => f.data);

    return new OptimizedHorarioComercialService(horarioInput, feriadosStrings);
  }

  /**
   * Cria uma instância otimizada para Brasil (pt-BR).
   * @param horarioInput - Configuração de horários por dia da semana
   * @param estados - Estados para incluir feriados estaduais
   * @returns Promise com instância otimizada configurada para Brasil
   */
  static async createParaBrasil(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    estados?: string | string[]
  ) {
    const feriadosConfig: IncluirConfig = {
      nacionais: true,
      ...(estados && { estaduais: estados }),
    };

    return this.createSimple(horarioInput, feriadosConfig);
  }

  /**
   * Cria uma instância otimizada para EUA (en-US).
   * @param horarioInput - Configuração de horários por dia da semana
   * @param estados - Estados para incluir feriados estaduais
   * @returns Promise com instância otimizada configurada para EUA
   */
  static async createParaEUA(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    estados?: string | string[]
  ) {
    const feriadosConfig: IncluirConfig = {
      nacionais: true,
      ...(estados && { estaduais: estados }),
    };

    return this.createSimple(horarioInput, feriadosConfig);
  }

  /**
   * Cria uma instância otimizada para Portugal (pt-PT).
   * @param horarioInput - Configuração de horários por dia da semana
   * @param estados - Estados para incluir feriados estaduais
   * @returns Promise com instância otimizada configurada para Portugal
   */
  static async createParaPortugal(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    estados?: string | string[]
  ) {
    const feriadosConfig: IncluirConfig = {
      nacionais: true,
      ...(estados && { estaduais: estados }),
    };

    return this.createSimple(horarioInput, feriadosConfig);
  }
}

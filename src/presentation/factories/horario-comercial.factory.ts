/**
 * Presentation Layer - Factory
 *
 * Factory para criar instâncias da aplicação com todas as dependências
 * injetadas corretamente seguindo o padrão de injeção de dependência.
 *
 * Migrado para usar a nova arquitetura modular do ComercialTime.
 */

import type {
  DiaChave,
  Intervalo,
} from "../../domain/entities/horario-comercial.entity";
import { ComercialTime, type IncluirConfig } from "../../core/comercial-time";
import { HorarioComercialUseCaseImpl } from "../../application/use-cases/horario-comercial.use-case";
import { FeriadoUpdateServiceImpl } from "../../application/services/feriado-update.service";
import type { FeriadoUpdateConfig } from "../../domain/entities/feriado-update.entity";

/**
 * Interface para configuração da factory
 */
export interface HorarioComercialFactoryConfig {
  /** Configuração de horários por dia da semana */
  horarioInput: Record<DiaChave, Intervalo[] | Intervalo>;
  /** Configuração de feriados a incluir */
  feriadosConfig?: IncluirConfig;
  /** Configuração do serviço de atualização de feriados */
  feriadoUpdateConfig?: FeriadoUpdateConfig;
}

/**
 * Factory moderna para criar instâncias da aplicação com todas as dependências
 * injetadas corretamente seguindo o padrão de injeção de dependência.
 *
 * Utiliza a nova arquitetura modular do ComercialTime.
 */
export class HorarioComercialFactory {
  /**
   * Cria uma instância completa da aplicação com todas as dependências.
   * @param config - Configuração completa da factory
   * @returns Objeto com todas as instâncias da aplicação
   */
  static async create(config: HorarioComercialFactoryConfig) {
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
    };
  }

  /**
   * Cria uma instância simplificada apenas com horário comercial.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param feriadosConfig - Configuração opcional de feriados
   * @returns Instância do HorarioComercial
   */
  static createSimple(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    feriadosConfig?: IncluirConfig
  ) {
    const comercialTime = new ComercialTime(feriadosConfig);
    return comercialTime.criarHorarioComercial(horarioInput);
  }

  /**
   * Cria uma instância com feriados nacionais do Brasil.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param estados - Estados específicos para incluir feriados estaduais
   * @returns Instância completa da aplicação
   */
  static async createParaBrasil(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    estados?: string | string[]
  ) {
    return await this.create({
      horarioInput,
      feriadosConfig: {
        location: "pt-br",
        nacionais: true,
        ...(estados && { estaduais: estados }),
        fallbackToPtBr: true,
      },
    });
  }

  /**
   * Cria uma instância com feriados nacionais dos EUA.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param estados - Estados específicos para incluir feriados estaduais
   * @returns Instância completa da aplicação
   */
  static async createParaEUA(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    estados?: string | string[]
  ) {
    return await this.create({
      horarioInput,
      feriadosConfig: {
        location: "en-US",
        nacionais: true,
        ...(estados && { estaduais: estados }),
        fallbackToPtBr: false,
      },
    });
  }

  /**
   * Cria uma instância com feriados nacionais de Portugal.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param estados - Estados específicos para incluir feriados estaduais
   * @returns Instância completa da aplicação
   */
  static async createParaPortugal(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    estados?: string | string[]
  ) {
    return await this.create({
      horarioInput,
      feriadosConfig: {
        location: "pt-PT",
        nacionais: true,
        ...(estados && { estaduais: estados }),
        fallbackToPtBr: false,
      },
    });
  }
}

/**
 * Presentation Layer - Controller Otimizado
 *
 * Controller otimizado que utiliza o serviço de performance
 * e implementa cache inteligente para operações frequentes.
 */

import type { HorarioComercialUseCase } from "../../application/use-cases/horario-comercial.use-case.js";
import type { Intervalo } from "../../domain/entities/horario-comercial.entity.js";
import { OptimizedHorarioComercialService } from "../../application/services/optimized-horario-comercial.service.js";

/**
 * Interface para o controller otimizado
 */
export interface OptimizedHorarioComercialController {
  /**
   * Verifica o status completo do estabelecimento em uma data específica.
   * @param data - Data para verificação (padrão: data atual)
   * @returns Objeto com status completo incluindo próximas aberturas/fechamentos
   */
  verificarStatus(data?: Date | string): {
    estaAberto: boolean;
    proximaAbertura: string | undefined;
    proximoFechamento: string | undefined;
    minutosRestantes: number | undefined;
  };

  /**
   * Obtém a configuração de horário comercial atual.
   * @returns Objeto com horários por dia da semana
   */
  obterHorario(): Record<string, readonly Intervalo[]>;

  /**
   * Adiciona minutos úteis a uma data e retorna o resultado formatado.
   * @param data - Data base para o cálculo
   * @param minutos - Número de minutos úteis a adicionar
   * @returns String ISO da nova data com minutos úteis adicionados
   */
  adicionarMinutosUteis(data: Date | string, minutos: number): string;

  /**
   * Obtém o status atual do estabelecimento.
   * @returns true se estiver aberto agora, false caso contrário
   */
  obterStatusAtual(): boolean;

  /**
   * Obtém estatísticas de performance do cache.
   * @returns Estatísticas de uso do cache
   */
  obterEstatisticasPerformance(): {
    tamanhoCache: number;
    tamanhoEstaAberto: number;
    tamanhoProximaAbertura: number;
    tamanhoProximoFechamento: number;
  };

  /**
   * Limpa todos os caches de performance.
   */
  limparCache(): void;
}

/**
 * Implementação otimizada do controller de horário comercial.
 * Utiliza cache inteligente e otimizações de performance.
 */
export class OptimizedHorarioComercialControllerImpl
  implements OptimizedHorarioComercialController
{
  private readonly optimizedService: OptimizedHorarioComercialService;

  /**
   * Constrói uma nova instância do controller otimizado.
   * @param useCase - Caso de uso para operações básicas
   * @param optimizedService - Serviço otimizado para operações de performance
   */
  constructor(
    private readonly useCase: HorarioComercialUseCase,
    optimizedService: OptimizedHorarioComercialService
  ) {
    this.optimizedService = optimizedService;
  }

  /**
   * Verifica o status completo do estabelecimento em uma data específica.
   * @param data - Data para verificação (padrão: data atual)
   * @returns Objeto com status completo incluindo próximas aberturas/fechamentos
   */
  verificarStatus(data?: Date | string) {
    const dataToUse = data || new Date();
    const estaAberto = this.optimizedService.estaAberto(dataToUse);
    const proximaAbertura = this.optimizedService.proximaAbertura(dataToUse);
    const proximoFechamento =
      this.optimizedService.proximoFechamento(dataToUse);
    const minutosRestantes =
      this.optimizedService.minutosRestantesHoje(dataToUse);

    return {
      estaAberto,
      proximaAbertura: proximaAbertura?.toISOString(),
      proximoFechamento: proximoFechamento?.toISOString(),
      minutosRestantes: estaAberto ? minutosRestantes : undefined,
    };
  }

  /**
   * Obtém a configuração de horário comercial atual.
   * @returns Objeto com horários por dia da semana
   */
  obterHorario() {
    return this.optimizedService.obterHorario();
  }

  /**
   * Adiciona minutos úteis a uma data e retorna o resultado formatado.
   * @param data - Data base para o cálculo
   * @param minutos - Número de minutos úteis a adicionar
   * @returns String ISO da nova data com minutos úteis adicionados
   */
  adicionarMinutosUteis(data: Date | string, minutos: number): string {
    const novaData = this.optimizedService.adicionarMinutosUteis(data, minutos);
    return novaData.toISOString();
  }

  /**
   * Obtém o status atual do estabelecimento.
   * @returns true se estiver aberto agora, false caso contrário
   */
  obterStatusAtual(): boolean {
    return this.optimizedService.openedNow;
  }

  /**
   * Obtém estatísticas de performance do cache.
   * @returns Estatísticas de uso do cache
   */
  obterEstatisticasPerformance() {
    return this.optimizedService.obterEstatisticasCache();
  }

  /**
   * Limpa todos os caches de performance.
   */
  limparCache(): void {
    this.optimizedService.limparCache();
  }
}

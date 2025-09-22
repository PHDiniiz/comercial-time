/**
 * Presentation Layer - Controller
 *
 * Esta camada contém os controllers que expõem a funcionalidade
 * para diferentes interfaces (API, CLI, etc.).
 */

import type { HorarioComercialUseCase } from "../../application/use-cases/horario-comercial.use-case.js";
import type { Intervalo } from "../../domain/entities/horario-comercial.entity.js";

/**
 * Interface que define o controller para operações de horário comercial.
 * Esta interface abstrai as operações de apresentação para diferentes
 * interfaces (API, CLI, etc.).
 */
export interface HorarioComercialController {
  /**
   * Verifica o status completo do estabelecimento em uma data específica.
   * @param data - Data para verificação (padrão: data atual)
   * @returns Objeto com status completo incluindo próximas aberturas/fechamentos
   */
  verificarStatus(data?: Date | string): {
    estaAberto: boolean;
    proximaAbertura?: string;
    proximoFechamento?: string;
    minutosRestantes?: number;
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
}

/**
 * Implementação concreta do controller de horário comercial.
 * Esta classe atua como um adaptador entre a camada de apresentação
 * e a camada de casos de uso.
 */
export class HorarioComercialControllerImpl
  implements HorarioComercialController
{
  /**
   * Constrói uma nova instância do controller.
   * @param useCase - Instância do caso de uso de horário comercial
   */
  constructor(private readonly useCase: HorarioComercialUseCase) {}

  /**
   * Verifica o status completo do estabelecimento em uma data específica.
   * @param data - Data para verificação (padrão: data atual)
   * @returns Objeto com status completo incluindo próximas aberturas/fechamentos
   */
  verificarStatus(data: Date | string = new Date()) {
    const estaAberto = this.useCase.verificarSeEstaAberto(data);
    const proximaAbertura = this.useCase.obterProximaAbertura(data);
    const proximoFechamento = this.useCase.obterProximoFechamento(data);
    const minutosRestantes = estaAberto
      ? this.useCase.obterMinutosRestantesHoje(data)
      : 0;

    const result: {
      estaAberto: boolean;
      proximaAbertura?: string;
      proximoFechamento?: string;
      minutosRestantes?: number;
    } = {
      estaAberto,
    };

    if (proximaAbertura) {
      result.proximaAbertura = proximaAbertura.toISOString();
    }

    if (proximoFechamento) {
      result.proximoFechamento = proximoFechamento.toISOString();
    }

    if (estaAberto) {
      result.minutosRestantes = minutosRestantes;
    }

    return result;
  }

  /**
   * Obtém a configuração de horário comercial atual.
   * @returns Objeto com horários por dia da semana
   */
  obterHorario() {
    return this.useCase.obterHorarioConfigurado();
  }

  /**
   * Adiciona minutos úteis a uma data e retorna o resultado formatado.
   * @param data - Data base para o cálculo
   * @param minutos - Número de minutos úteis a adicionar
   * @returns String ISO da nova data com minutos úteis adicionados
   */
  adicionarMinutosUteis(data: Date | string, minutos: number): string {
    const resultado = this.useCase.adicionarMinutosUteis(data, minutos);
    return resultado.toISOString();
  }

  /**
   * Obtém o status atual do estabelecimento.
   * @returns true se estiver aberto agora, false caso contrário
   */
  obterStatusAtual(): boolean {
    return this.useCase.obterStatusAtual();
  }
}

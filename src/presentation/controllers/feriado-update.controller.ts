/**
 * Controlador para gerenciar atualizações de feriados
 *
 * Este controlador expõe as funcionalidades de atualização
 * de feriados nacionais e estaduais via CRONJOB.
 */

import {
  FeriadoUpdateConfig,
  FeriadoUpdateResult,
  FeriadoUpdateService,
} from "../../domain/entities/feriado-update.entity";
import { FeriadoUpdateServiceImpl } from "../../application/services/feriado-update.service";

/**
 * Interface do controlador de atualização de feriados
 */
export interface FeriadoUpdateController {
  /** Atualiza feriados nacionais */
  atualizarNacionais(): Promise<FeriadoUpdateResult>;
  /** Atualiza feriados estaduais */
  atualizarEstaduais(): Promise<FeriadoUpdateResult>;
  /** Atualiza ambos (nacionais e estaduais) */
  atualizarTodos(): Promise<FeriadoUpdateResult>;
  /** Inicia o CRONJOB de atualização */
  iniciarCronJob(): void;
  /** Para o CRONJOB de atualização */
  pararCronJob(): void;
  /** Obtém status do CRONJOB */
  obterStatusCronJob(): { ativo: boolean; intervaloMinutos: number };
}

/**
 * Implementação do controlador de atualização de feriados
 */
export class FeriadoUpdateControllerImpl implements FeriadoUpdateController {
  private readonly service: FeriadoUpdateService;

  constructor(config: FeriadoUpdateConfig) {
    this.service = new FeriadoUpdateServiceImpl(config);
  }

  /**
   * Atualiza feriados nacionais
   * @returns Promise com o resultado da atualização
   */
  async atualizarNacionais(): Promise<FeriadoUpdateResult> {
    return await this.service.atualizarNacionais();
  }

  /**
   * Atualiza feriados estaduais
   * @returns Promise com o resultado da atualização
   */
  async atualizarEstaduais(): Promise<FeriadoUpdateResult> {
    return await this.service.atualizarEstaduais();
  }

  /**
   * Atualiza ambos (nacionais e estaduais)
   * @returns Promise com o resultado da atualização
   */
  async atualizarTodos(): Promise<FeriadoUpdateResult> {
    return await this.service.atualizarTodos();
  }

  /**
   * Inicia o CRONJOB de atualização
   */
  iniciarCronJob(): void {
    this.service.iniciarCronJob();
  }

  /**
   * Para o CRONJOB de atualização
   */
  pararCronJob(): void {
    this.service.pararCronJob();
  }

  /**
   * Obtém status do CRONJOB
   * @returns Status do CRONJOB
   */
  obterStatusCronJob(): { ativo: boolean; intervaloMinutos: number } {
    // Esta implementação seria melhorada com um serviço de status
    // Por enquanto, retorna informações básicas
    return {
      ativo: true, // Seria verificado se o CRONJOB está ativo
      intervaloMinutos: 60, // Seria obtido da configuração
    };
  }
}

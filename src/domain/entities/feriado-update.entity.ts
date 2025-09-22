/**
 * Entidade de domínio para gerenciar atualizações de feriados
 *
 * Esta entidade representa a lógica de negócio para atualização
 * de feriados nacionais e estaduais de fontes externas.
 */

export interface FeriadoUpdateConfig {
  /** País para atualização (BR, US, PT) */
  readonly pais: string;
  /** Fonte de dados para feriados nacionais */
  readonly fonteNacionais: string;
  /** Fonte de dados para feriados estaduais */
  readonly fonteEstaduais: string;
  /** Intervalo de atualização em minutos */
  readonly intervaloMinutos: number;
  /** Timeout para requisições HTTP em ms */
  readonly timeoutMs: number;
}

export interface FeriadoUpdateResult {
  /** Sucesso da operação */
  readonly sucesso: boolean;
  /** Quantidade de feriados nacionais atualizados */
  readonly nacionaisAtualizados: number;
  /** Quantidade de feriados estaduais atualizados */
  readonly estaduaisAtualizados: number;
  /** Mensagem de status */
  readonly mensagem: string;
  /** Timestamp da atualização */
  readonly timestamp: Date;
  /** Erro se houver */
  readonly erro?: string;
}

export interface FeriadoUpdateService {
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
}

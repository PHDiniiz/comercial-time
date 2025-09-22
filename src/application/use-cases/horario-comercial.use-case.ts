/**
 * Application Layer - Casos de Uso
 *
 * Esta camada contém os casos de uso da aplicação, orquestrando as operações
 * de domínio e coordenando entre diferentes camadas.
 *
 * Migrado para usar a nova arquitetura modular do ComercialTime.
 */

import type { HorarioComercialEntity } from "../../domain/entities/horario-comercial.entity";
import { ComercialTime, type IncluirConfig } from "../../core/comercial-time";
import type {
  DiaChave,
  Intervalo,
} from "../../domain/entities/horario-comercial.entity";

/**
 * Interface que define os casos de uso para operações de horário comercial.
 * Esta interface abstrai as operações principais que podem ser realizadas
 * com horários comerciais, seguindo o padrão de Clean Architecture.
 */
export interface HorarioComercialUseCase {
  /**
   * Verifica se o estabelecimento está aberto em uma data específica.
   * @param data - Data para verificação (padrão: data atual)
   * @returns true se estiver aberto, false caso contrário
   */
  verificarSeEstaAberto(data?: Date | string): boolean;

  /**
   * Obtém a próxima data/hora de abertura do estabelecimento.
   * @param data - Data de referência para busca (padrão: data atual)
   * @returns Data da próxima abertura ou null se não encontrada
   */
  obterProximaAbertura(data?: Date | string): Date | null;

  /**
   * Obtém a próxima data/hora de fechamento do estabelecimento.
   * @param data - Data de referência para busca (padrão: data atual)
   * @returns Data do próximo fechamento ou null se não encontrada
   */
  obterProximoFechamento(data?: Date | string): Date | null;

  /**
   * Adiciona minutos úteis (dentro do horário comercial) a uma data.
   * @param data - Data base para o cálculo
   * @param minutos - Número de minutos úteis a adicionar
   * @returns Nova data com os minutos úteis adicionados
   */
  adicionarMinutosUteis(data: Date | string, minutos: number): Date;

  /**
   * Calcula quantos minutos restam de horário comercial no dia atual.
   * @param data - Data de referência (padrão: data atual)
   * @returns Número de minutos restantes no dia atual
   */
  obterMinutosRestantesHoje(data?: Date | string): number;

  /**
   * Obtém a configuração de horário comercial atual.
   * @returns Objeto com a configuração de horários por dia da semana
   */
  obterHorarioConfigurado(): HorarioComercialEntity["horario"];

  /**
   * Obtém o status atual do estabelecimento (aberto/fechado).
   * @returns true se estiver aberto agora, false caso contrário
   */
  obterStatusAtual(): boolean;
}

/**
 * Interface para configuração do caso de uso
 */
export interface HorarioComercialUseCaseConfig {
  /** Configuração de horários por dia da semana */
  horarioInput: Record<DiaChave, Intervalo[] | Intervalo>;
  /** Configuração de feriados a incluir */
  feriadosConfig?: IncluirConfig;
}

/**
 * Implementação moderna dos casos de uso de horário comercial.
 * Esta classe utiliza a nova arquitetura modular do ComercialTime
 * para fornecer funcionalidades avançadas de horários comerciais.
 */
export class HorarioComercialUseCaseImpl implements HorarioComercialUseCase {
  private comercialTime: ComercialTime;
  private horarioComercial: any; // Instância do HorarioComercial criada pelo ComercialTime

  /**
   * Constrói uma nova instância do caso de uso.
   * @param config - Configuração do caso de uso
   */
  constructor(config: HorarioComercialUseCaseConfig) {
    // Inicialização básica - as instâncias serão definidas no método create
    this.comercialTime = null as any;
    this.horarioComercial = null as any;
  }

  /**
   * Cria uma instância assíncrona do caso de uso.
   * @param config - Configuração do caso de uso
   * @returns Promise com instância configurada
   */
  static async create(
    config: HorarioComercialUseCaseConfig
  ): Promise<HorarioComercialUseCaseImpl> {
    const comercialTime = await ComercialTime.create(config.feriadosConfig);
    const horarioComercial = comercialTime.criarHorarioComercial(
      config.horarioInput
    );

    const instance = new HorarioComercialUseCaseImpl(config);
    instance.comercialTime = comercialTime;
    instance.horarioComercial = horarioComercial;

    return instance;
  }

  /**
   * Cria uma instância assíncrona do caso de uso com configuração simplificada.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param feriadosConfig - Configuração opcional de feriados
   * @returns Promise com instância configurada
   */
  static async createSimple(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    feriadosConfig?: IncluirConfig
  ): Promise<HorarioComercialUseCaseImpl> {
    return await this.create({
      horarioInput,
      ...(feriadosConfig && { feriadosConfig }),
    });
  }

  /**
   * Constrói uma nova instância do caso de uso com configuração simplificada.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param feriadosConfig - Configuração opcional de feriados
   */
  static createSync(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    feriadosConfig?: IncluirConfig
  ): HorarioComercialUseCaseImpl {
    return new HorarioComercialUseCaseImpl({
      horarioInput,
      ...(feriadosConfig && { feriadosConfig }),
    });
  }

  /**
   * Verifica se o estabelecimento está aberto em uma data específica.
   * @param data - Data para verificação (padrão: data atual)
   * @returns true se estiver aberto, false caso contrário
   */
  verificarSeEstaAberto(data: Date | string = new Date()): boolean {
    return this.horarioComercial.estaAberto(data);
  }

  /**
   * Obtém a próxima data/hora de abertura do estabelecimento.
   * @param data - Data de referência para busca (padrão: data atual)
   * @returns Data da próxima abertura ou null se não encontrada
   */
  obterProximaAbertura(data: Date | string = new Date()): Date | null {
    return this.horarioComercial.proximaAbertura(data);
  }

  /**
   * Obtém a próxima data/hora de fechamento do estabelecimento.
   * @param data - Data de referência para busca (padrão: data atual)
   * @returns Data do próximo fechamento ou null se não encontrada
   */
  obterProximoFechamento(data: Date | string = new Date()): Date | null {
    return this.horarioComercial.proximoFechamento(data);
  }

  /**
   * Adiciona minutos úteis (dentro do horário comercial) a uma data.
   * @param data - Data base para o cálculo
   * @param minutos - Número de minutos úteis a adicionar
   * @returns Nova data com os minutos úteis adicionados
   */
  adicionarMinutosUteis(data: Date | string, minutos: number): Date {
    return this.horarioComercial.adicionarMinutosUteis(data, minutos);
  }

  /**
   * Calcula quantos minutos restam de horário comercial no dia atual.
   * @param data - Data de referência (padrão: data atual)
   * @returns Número de minutos restantes no dia atual
   */
  obterMinutosRestantesHoje(data: Date | string = new Date()): number {
    return this.horarioComercial.minutosRestantesHoje(data);
  }

  /**
   * Obtém a configuração de horário comercial atual.
   * @returns Objeto com a configuração de horários por dia da semana
   */
  obterHorarioConfigurado() {
    return this.horarioComercial.obterHorario();
  }

  /**
   * Obtém o status atual do estabelecimento (aberto/fechado).
   * @returns true se estiver aberto agora, false caso contrário
   */
  obterStatusAtual(): boolean {
    return this.horarioComercial.openedNow;
  }

  /**
   * Obtém informações sobre os feriados carregados.
   * @returns Informações detalhadas sobre os feriados
   */
  obterInfoFeriados() {
    return this.comercialTime.obterInfoFeriados();
  }

  /**
   * Obtém lista de estados disponíveis para feriados estaduais.
   * @returns Array com siglas dos estados disponíveis
   */
  obterEstadosDisponiveis(): readonly string[] {
    return this.comercialTime.obterEstadosDisponiveis();
  }

  /**
   * Verifica se um estado está disponível para feriados estaduais.
   * @param sigla - Sigla do estado
   * @returns true se o estado estiver disponível
   */
  estadoDisponivel(sigla: string): boolean {
    return this.comercialTime.estadoDisponivel(sigla);
  }

  /**
   * Obtém feriados nacionais carregados.
   * @returns Array de feriados nacionais
   */
  obterFeriadosNacionais() {
    return this.comercialTime.nacionais();
  }

  /**
   * Obtém feriados estaduais de um estado específico.
   * @param sigla - Sigla do estado (ex: "SP", "RJ")
   * @returns Array de feriados estaduais
   */
  obterFeriadosEstaduais(sigla: string) {
    return this.comercialTime.estaduais(sigla);
  }

  /**
   * Obtém a localização atualmente em uso.
   * @returns Nome da localização (ex: "pt-br", "my-location", "personalizado")
   */
  obterLocalizacaoUsada(): string {
    return this.comercialTime.obterLocalizacaoUsada();
  }

  /**
   * Verifica se está usando feriados personalizados.
   * @returns true se estiver usando feriados personalizados
   */
  estaUsandoFeriadosPersonalizados(): boolean {
    return this.comercialTime.estaUsandoFeriadosPersonalizados();
  }

  /**
   * Obtém a instância do ComercialTime para acesso direto.
   * @returns Instância do ComercialTime
   */
  obterComercialTime(): ComercialTime {
    return this.comercialTime;
  }
}

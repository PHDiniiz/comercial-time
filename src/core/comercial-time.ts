/**
 * Core Layer - Sistema de Importação Modular
 *
 * Esta camada implementa o sistema de importação modular que permite
 * ao usuário escolher quais tipos de feriados importar.
 */

import { Feriado } from "../domain/entities/horario-comercial.entity";
import { HorarioComercial } from "../legacy/horario-comercial.legacy";
import {
  carregarDadosLocalizacao,
  LocaleConfig,
} from "../infrastructure/utils/locale.util";

/**
 * Interface para configuração de importação modular
 */
export interface IncluirConfig extends LocaleConfig {
  /** Incluir feriados nacionais */
  nacionais?: boolean;
  /** Incluir feriados estaduais (sigla do estado) */
  estaduais?: string | string[];
}

/**
 * Classe principal do sistema de importação modular
 */
export class ComercialTime {
  private feriados: readonly Feriado[] = [];
  private feriadosNacionais: readonly Feriado[] = [];
  private feriadosEstaduais: Record<string, Feriado[]> = {};
  private localizacaoUsada: string = "pt-br";
  private usandoFeriadosPersonalizados: boolean = false;

  /**
   * Constrói uma nova instância do ComercialTime.
   * @param config - Configuração de quais feriados incluir
   */
  constructor(config: IncluirConfig = {}) {
    // Inicialização síncrona com dados padrão
    this.feriadosNacionais = [];
    this.feriadosEstaduais = {};
    this.localizacaoUsada = "pt-br";
    this.usandoFeriadosPersonalizados = false;
    this.feriados = [];
  }

  /**
   * Cria uma instância assíncrona do ComercialTime.
   * @param config - Configuração de quais feriados incluir
   * @returns Promise com instância configurada
   */
  static async create(config: IncluirConfig = {}): Promise<ComercialTime> {
    const instance = new ComercialTime();
    await instance.carregarFeriados(config);
    return instance;
  }

  /**
   * Carrega feriados baseado na configuração fornecida.
   * @param config - Configuração de importação
   */
  private async carregarFeriados(config: IncluirConfig): Promise<void> {
    let dadosLocalizacao: any;
    let feriados: Feriado[] = [];

    try {
      // Carregar dados de localização
      dadosLocalizacao = await carregarDadosLocalizacao({
        ...(config.location && { location: config.location }),
        ...(config.fallbackToPtBr !== undefined && {
          fallbackToPtBr: config.fallbackToPtBr,
        }),
        ...(config.usarFeriadosPersonalizados !== undefined && {
          usarFeriadosPersonalizados: config.usarFeriadosPersonalizados,
        }),
      });

      this.feriadosNacionais = dadosLocalizacao.feriadosNacionais || [];
      this.feriadosEstaduais = dadosLocalizacao.feriadosEstaduais || {};
      this.localizacaoUsada = dadosLocalizacao.localizacaoUsada || "pt-br";
      this.usandoFeriadosPersonalizados =
        dadosLocalizacao.usandoFeriadosPersonalizados || false;

      // Adicionar feriados nacionais se solicitado
      if (config.nacionais) {
        feriados.push(...this.feriadosNacionais);
      }

      // Adicionar feriados estaduais se solicitado
      if (config.estaduais) {
        const estados = Array.isArray(config.estaduais)
          ? config.estaduais
          : [config.estaduais];

        for (const estado of estados) {
          const sigla = estado.toUpperCase();
          const feriadosEstado = this.feriadosEstaduais[sigla];

          if (feriadosEstado) {
            feriados.push(...feriadosEstado);
          } else {
            console.warn(
              `Estado "${sigla}" não encontrado nos feriados estaduais de ${this.localizacaoUsada}.`
            );
          }
        }
      }
    } catch (error) {
      // Log removido para otimização
      // Inicializar com valores padrão em caso de erro
      this.feriadosNacionais = [];
      this.feriadosEstaduais = {};
      this.localizacaoUsada = "pt-br";
      this.usandoFeriadosPersonalizados = false;
      feriados = [];
    } finally {
      // Garantir que sempre temos um array válido
      this.feriados = Array.isArray(feriados) ? feriados : [];
    }
  }

  /**
   * Cria uma instância do HorarioComercial com os feriados carregados.
   * @param horarioInput - Configuração de horários por dia da semana
   * @returns Instância do HorarioComercial
   */
  criarHorarioComercial(horarioInput: Record<string, any>): HorarioComercial {
    // Verificar se horarioInput é válido
    if (!horarioInput || typeof horarioInput !== "object") {
      throw new Error("horarioInput deve ser um objeto válido");
    }

    let feriadosStrings: string[] = [];
    let horarioComercial: HorarioComercial;

    try {
      // Converte feriados para o formato esperado pela classe legacy
      feriadosStrings = this.feriados.map((feriado) => feriado.data);
      horarioComercial = new HorarioComercial(horarioInput, feriadosStrings);
    } catch (error) {
      // Log removido para otimização
      // Criar instância com feriados vazios em caso de erro
      feriadosStrings = [];
      horarioComercial = new HorarioComercial(horarioInput, feriadosStrings);
    } finally {
      // Garantir que sempre retornamos uma instância válida
      if (!horarioComercial!) {
        horarioComercial = new HorarioComercial(horarioInput, []);
      }
    }

    return horarioComercial;
  }

  /**
   * Obtém todos os feriados carregados.
   * @returns Array de feriados
   */
  obterFeriados(): readonly Feriado[] {
    return this.feriados;
  }

  /**
   * Obtém feriados nacionais.
   * @returns Array de feriados nacionais
   */
  nacionais(): readonly Feriado[] {
    return this.feriadosNacionais;
  }

  /**
   * Obtém feriados estaduais de um estado específico.
   * @param sigla - Sigla do estado (ex: "SP", "RJ")
   * @returns Array de feriados estaduais
   */
  estaduais(sigla: string): readonly Feriado[] {
    let result: Feriado[] = [];

    try {
      const estado = sigla.toUpperCase();
      const feriadosEstado = this.feriadosEstaduais[estado];

      if (!feriadosEstado) {
        console.warn(
          `Estado "${estado}" não encontrado nos feriados estaduais de ${this.localizacaoUsada}.`
        );
        result = [];
      } else {
        result = [...feriadosEstado];
      }
    } catch (error) {
      // Log removido para otimização
      result = [];
    } finally {
      // Garantir que sempre retornamos um array válido
      if (!Array.isArray(result)) {
        result = [];
      }
    }

    return result;
  }

  /**
   * Obtém lista de estados disponíveis.
   * @returns Array com siglas dos estados disponíveis
   */
  obterEstadosDisponiveis(): readonly string[] {
    return Object.keys(this.feriadosEstaduais);
  }

  /**
   * Verifica se um estado está disponível.
   * @param sigla - Sigla do estado
   * @returns true se o estado estiver disponível
   */
  estadoDisponivel(sigla: string): boolean {
    return sigla.toUpperCase() in this.feriadosEstaduais;
  }

  /**
   * Obtém a localização atualmente em uso.
   * @returns Nome da localização (ex: "pt-br", "my-location", "personalizado")
   */
  obterLocalizacaoUsada(): string {
    return this.localizacaoUsada;
  }

  /**
   * Verifica se está usando feriados personalizados da variável de ambiente.
   * @returns true se estiver usando feriados personalizados
   */
  estaUsandoFeriadosPersonalizados(): boolean {
    return this.usandoFeriadosPersonalizados;
  }

  /**
   * Obtém informações sobre os feriados carregados.
   * @returns Objeto com informações detalhadas
   */
  obterInfoFeriados(): {
    total: number;
    nacionais: number;
    estaduais: number;
    localizacao: string;
    usandoPersonalizados: boolean;
    estadosDisponiveis: string[];
  } {
    let totalEstaduais = 0;
    let result: any = {
      total: 0,
      nacionais: 0,
      estaduais: 0,
      localizacao: "pt-br",
      usandoPersonalizados: false,
      estadosDisponiveis: [],
    };

    try {
      totalEstaduais = Object.values(this.feriadosEstaduais).reduce(
        (total, feriados) => total + feriados.length,
        0
      );

      result = {
        total: this.feriados.length,
        nacionais: this.feriadosNacionais.length,
        estaduais: totalEstaduais,
        localizacao: this.localizacaoUsada,
        usandoPersonalizados: this.usandoFeriadosPersonalizados,
        estadosDisponiveis: Object.keys(this.feriadosEstaduais),
      };
    } catch (error) {
      // Log removido para otimização
      result = {
        total: 0,
        nacionais: 0,
        estaduais: 0,
        localizacao: "pt-br",
        usandoPersonalizados: false,
        estadosDisponiveis: [],
      };
    } finally {
      // Garantir que sempre retornamos um objeto válido
      if (!result || typeof result !== "object") {
        result = {
          total: 0,
          nacionais: 0,
          estaduais: 0,
          localizacao: "pt-br",
          usandoPersonalizados: false,
          estadosDisponiveis: [],
        };
      }
    }

    return result;
  }
}

/**
 * Função principal para importação modular
 * @param config - Configuração de importação
 * @returns Instância do ComercialTime
 */
export function criarComercialTime(config: IncluirConfig = {}): ComercialTime {
  return new ComercialTime(config);
}

/**
 * Exportação padrão para importação direta
 */
export default ComercialTime;

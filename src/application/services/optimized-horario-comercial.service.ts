/**
 * Application Layer - Serviço Otimizado de Horário Comercial
 *
 * Este serviço implementa otimizações de performance usando memoização
 * e callbacks otimizados para operações frequentes de horário comercial.
 */

import type {
  DiaChave,
  Intervalo,
  Horario,
} from "../../domain/entities/horario-comercial.entity";
import { normalizarHorario } from "../../infrastructure/utils/normalize.util";
import {
  horaParaMinutos,
  diaIndex,
  minutosDoDia,
  formatarDataParaISO,
} from "../../infrastructure/utils/time.util";
import { LIMITE_BUSCA_DIAS } from "../../domain/entities/horario-comercial.entity";

/**
 * Cache interno para operações frequentes
 */
class PerformanceCache {
  private readonly cache = new Map<string, any>();
  private readonly maxSize: number;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    return this.cache.get(key) || null;
  }

  set<T>(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      // Remove o primeiro item (FIFO)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * Serviço otimizado de horário comercial com cache e memoização.
 * Implementa as mesmas funcionalidades do HorarioComercial mas com
 * otimizações de performance para operações frequentes.
 */
export class OptimizedHorarioComercialService {
  private readonly horario: Horario;
  private readonly feriados: ReadonlySet<string>;
  private readonly feriadosArray: readonly string[];
  private readonly cache: PerformanceCache;

  // Memoização de operações frequentes
  private readonly memoizedEstaAberto = new Map<string, boolean>();
  private readonly memoizedProximaAbertura = new Map<string, Date | null>();
  private readonly memoizedProximoFechamento = new Map<string, Date | null>();

  /**
   * Constrói uma nova instância do serviço otimizado.
   * @param horarioInput - Configuração de horários por dia da semana
   * @param feriados - Array de feriados no formato YYYY-MM-DD
   */
  constructor(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    feriados: readonly string[] = []
  ) {
    this.horario = normalizarHorario(horarioInput);
    this.feriados = new Set(
      feriados.map((f) => f.trim())
    ) as ReadonlySet<string>;
    this.feriadosArray = feriados.map((f) => f.trim());
    this.cache = new PerformanceCache();
  }

  /**
   * Verifica se uma data é feriado (memoizado).
   * @param data - Data a ser verificada
   * @returns true se for feriado, false caso contrário
   */
  private readonly ehFeriado = (data: Date): boolean => {
    const dataStr = formatarDataParaISO(data);
    return this.feriados.has(dataStr);
  };

  /**
   * Verifica se o estabelecimento está aberto em uma data específica (otimizado).
   * @param dt - Data para verificação (padrão: data atual)
   * @returns true se estiver aberto, false caso contrário
   */
  estaAberto = (dt: Date | string = new Date()): boolean => {
    let data: Date;
    let cacheKey: string = "";
    let result: boolean = false;

    try {
      data = typeof dt === "string" ? new Date(dt) : dt;
      cacheKey = `estaAberto_${formatarDataParaISO(data)}_${minutosDoDia(
        data
      )}`;

      // Verificar cache primeiro
      const cached = this.memoizedEstaAberto.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      // Verificar se é feriado
      if (this.ehFeriado(data)) {
        result = false;
        this.memoizedEstaAberto.set(cacheKey, result);
        return result;
      }

      const dia = String(diaIndex(data));
      const intervalos = this.horario[dia];

      if (!intervalos || intervalos.length === 0) {
        result = false;
        this.memoizedEstaAberto.set(cacheKey, result);
        return result;
      }

      const minutosAtual = minutosDoDia(data);
      result = intervalos.some(
        (intervalo) =>
          minutosAtual >= horaParaMinutos(intervalo.abertura) &&
          minutosAtual < horaParaMinutos(intervalo.fechamento)
      );

      // Cachear resultado
      this.memoizedEstaAberto.set(cacheKey, result);
    } catch (error) {
      // Log removido para otimização
      result = false;
      if (cacheKey) {
        this.memoizedEstaAberto.set(cacheKey, result);
      }
    } finally {
      // Garantir que sempre retornamos um boolean válido
      if (typeof result !== "boolean") {
        result = false;
      }
    }

    return result;
  };

  /**
   * Obtém a próxima data/hora de abertura (otimizado com cache).
   * @param dt - Data de referência para busca (padrão: data atual)
   * @returns Data da próxima abertura ou null se não encontrada
   */
  proximaAbertura = (dt: Date | string = new Date()): Date | null => {
    let data: Date;
    let cacheKey: string = "";
    let result: Date | null = null;

    try {
      data = typeof dt === "string" ? new Date(dt) : dt;
      cacheKey = `proximaAbertura_${formatarDataParaISO(data)}`;

      // Verificar cache primeiro
      const cached = this.memoizedProximaAbertura.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      let dataAtual = new Date(data);
      let tentativas = 0;

      while (tentativas < LIMITE_BUSCA_DIAS) {
        const dia = String(diaIndex(dataAtual));
        const intervalos = this.horario[dia];

        if (intervalos && intervalos.length > 0 && !this.ehFeriado(dataAtual)) {
          const primeiroIntervalo = intervalos[0];
          if (primeiroIntervalo) {
            const horaAbertura = horaParaMinutos(primeiroIntervalo.abertura);

            if (dataAtual.getTime() === data.getTime()) {
              // Mesmo dia - verificar se ainda não passou da hora de abertura
              const minutosAtual = minutosDoDia(dataAtual);
              if (minutosAtual < horaAbertura) {
                const proximaAbertura = new Date(dataAtual);
                proximaAbertura.setHours(
                  Math.floor(horaAbertura / 60),
                  horaAbertura % 60,
                  0,
                  0
                );
                result = proximaAbertura;
                this.memoizedProximaAbertura.set(cacheKey, result);
                return result;
              }
            } else {
              // Próximo dia - usar primeira hora de abertura
              const proximaAbertura = new Date(dataAtual);
              proximaAbertura.setHours(
                Math.floor(horaAbertura / 60),
                horaAbertura % 60,
                0,
                0
              );
              result = proximaAbertura;
              this.memoizedProximaAbertura.set(cacheKey, result);
              return result;
            }
          }
        }

        // Próximo dia
        dataAtual.setDate(dataAtual.getDate() + 1);
        dataAtual.setHours(0, 0, 0, 0);
        tentativas++;
      }

      result = null;
    } catch (error) {
      // Log removido para otimização
      result = null;
    } finally {
      // Garantir que sempre cacheamos o resultado
      if (cacheKey) {
        this.memoizedProximaAbertura.set(cacheKey, result);
      }
    }

    return result;
  };

  /**
   * Obtém a próxima data/hora de fechamento (otimizado com cache).
   * @param dt - Data de referência para busca (padrão: data atual)
   * @returns Data do próximo fechamento ou null se não encontrada
   */
  proximoFechamento = (dt: Date | string = new Date()): Date | null => {
    const data = typeof dt === "string" ? new Date(dt) : dt;
    const cacheKey = `proximoFechamento_${formatarDataParaISO(data)}`;

    // Verificar cache primeiro
    const cached = this.memoizedProximoFechamento.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    if (this.ehFeriado(data)) {
      this.memoizedProximoFechamento.set(cacheKey, null);
      return null;
    }

    const dia = String(diaIndex(data));
    const intervalos = this.horario[dia];

    if (!intervalos || intervalos.length === 0) {
      this.memoizedProximoFechamento.set(cacheKey, null);
      return null;
    }

    const minutosAtual = minutosDoDia(data);

    // Encontrar o próximo fechamento no mesmo dia
    for (const intervalo of intervalos) {
      const horaFechamento = horaParaMinutos(intervalo.fechamento);
      if (minutosAtual < horaFechamento) {
        const proximoFechamento = new Date(data);
        proximoFechamento.setHours(
          Math.floor(horaFechamento / 60),
          horaFechamento % 60,
          0,
          0
        );
        this.memoizedProximoFechamento.set(cacheKey, proximoFechamento);
        return proximoFechamento;
      }
    }

    this.memoizedProximoFechamento.set(cacheKey, null);
    return null;
  };

  /**
   * Adiciona minutos úteis a uma data (otimizado).
   * @param dt - Data base para o cálculo
   * @param minutosAdicionar - Número de minutos úteis a adicionar
   * @returns Nova data com os minutos úteis adicionados
   */
  adicionarMinutosUteis = (
    dt: Date | string = new Date(),
    minutosAdicionar: number = 0
  ): Date => {
    let data: Date;
    let cacheKey: string = "";
    let dataResultado: Date = new Date();

    try {
      data = typeof dt === "string" ? new Date(dt) : dt;
      cacheKey = `adicionarMinutosUteis_${formatarDataParaISO(
        data
      )}_${minutosAdicionar}`;

      // Verificar cache primeiro
      const cached = this.cache.get<Date>(cacheKey);
      if (cached) {
        return new Date(cached);
      }

      dataResultado = new Date(data);
      let minutosRestantes = minutosAdicionar;

      while (minutosRestantes > 0) {
        if (this.ehFeriado(dataResultado)) {
          // Pular para o próximo dia útil
          dataResultado.setDate(dataResultado.getDate() + 1);
          dataResultado.setHours(0, 0, 0, 0);
          continue;
        }

        const dia = String(diaIndex(dataResultado));
        const intervalos = this.horario[dia];

        if (!intervalos || intervalos.length === 0) {
          // Pular para o próximo dia
          dataResultado.setDate(dataResultado.getDate() + 1);
          dataResultado.setHours(0, 0, 0, 0);
          continue;
        }

        const minutosAtual = minutosDoDia(dataResultado);

        // Encontrar o próximo intervalo disponível
        for (const intervalo of intervalos) {
          const inicioIntervalo = horaParaMinutos(intervalo.abertura);
          const fimIntervalo = horaParaMinutos(intervalo.fechamento);

          if (minutosAtual < inicioIntervalo) {
            // Ainda não abriu - pular para a abertura
            dataResultado.setHours(
              Math.floor(inicioIntervalo / 60),
              inicioIntervalo % 60,
              0,
              0
            );
            break;
          }

          if (minutosAtual >= inicioIntervalo && minutosAtual < fimIntervalo) {
            // Dentro do horário comercial
            const minutosDisponiveis = fimIntervalo - minutosAtual;

            if (minutosRestantes <= minutosDisponiveis) {
              // Pode adicionar todos os minutos restantes
              dataResultado.setMinutes(
                dataResultado.getMinutes() + minutosRestantes
              );
              this.cache.set(cacheKey, new Date(dataResultado));
              return dataResultado;
            } else {
              // Adicionar minutos disponíveis e continuar
              minutosRestantes -= minutosDisponiveis;
              dataResultado.setHours(
                Math.floor(fimIntervalo / 60),
                fimIntervalo % 60,
                0,
                0
              );
            }
          }
        }

        // Próximo dia
        dataResultado.setDate(dataResultado.getDate() + 1);
        dataResultado.setHours(0, 0, 0, 0);
      }

      this.cache.set(cacheKey, new Date(dataResultado));
    } catch (error) {
      // Log removido para otimização
      dataResultado = new Date();
    } finally {
      // Garantir que sempre temos uma data válida
      if (!dataResultado || isNaN(dataResultado.getTime())) {
        dataResultado = new Date();
      }
      // Garantir que sempre cacheamos o resultado se possível
      if (cacheKey && dataResultado) {
        this.cache.set(cacheKey, new Date(dataResultado));
      }
    }

    return dataResultado;
  };

  /**
   * Calcula quantos minutos restam de horário comercial no dia atual (otimizado).
   * @param dt - Data de referência (padrão: data atual)
   * @returns Número de minutos restantes no dia atual
   */
  minutosRestantesHoje = (dt: Date | string = new Date()): number => {
    const data = typeof dt === "string" ? new Date(dt) : dt;
    const cacheKey = `minutosRestantesHoje_${formatarDataParaISO(data)}`;

    // Verificar cache primeiro
    const cached = this.cache.get<number>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    if (this.ehFeriado(data)) {
      this.cache.set(cacheKey, 0);
      return 0;
    }

    const dia = String(diaIndex(data));
    const intervalos = this.horario[dia];

    if (!intervalos || intervalos.length === 0) {
      this.cache.set(cacheKey, 0);
      return 0;
    }

    const minutosAtual = minutosDoDia(data);
    let minutosRestantes = 0;

    for (const intervalo of intervalos) {
      const inicioIntervalo = horaParaMinutos(intervalo.abertura);
      const fimIntervalo = horaParaMinutos(intervalo.fechamento);

      if (minutosAtual >= inicioIntervalo && minutosAtual < fimIntervalo) {
        minutosRestantes += fimIntervalo - minutosAtual;
      } else if (minutosAtual < inicioIntervalo) {
        minutosRestantes += fimIntervalo - inicioIntervalo;
      }
    }

    this.cache.set(cacheKey, minutosRestantes);
    return minutosRestantes;
  };

  /**
   * Obtém a configuração de horário comercial atual.
   * @returns Objeto com a configuração de horários por dia da semana
   */
  obterHorario = (): Horario => {
    return { ...this.horario };
  };

  /**
   * Obtém o status atual do estabelecimento (aberto/fechado).
   * @returns true se estiver aberto agora, false caso contrário
   */
  get openedNow(): boolean {
    return this.estaAberto();
  }

  /**
   * Limpa todos os caches internos.
   */
  limparCache = (): void => {
    this.memoizedEstaAberto.clear();
    this.memoizedProximaAbertura.clear();
    this.memoizedProximoFechamento.clear();
    this.cache.clear();
  };

  /**
   * Obtém estatísticas do cache.
   * @returns Estatísticas de uso do cache
   */
  obterEstatisticasCache = (): {
    tamanhoCache: number;
    tamanhoEstaAberto: number;
    tamanhoProximaAbertura: number;
    tamanhoProximoFechamento: number;
  } => {
    return {
      tamanhoCache: this.cache.size(),
      tamanhoEstaAberto: this.memoizedEstaAberto.size,
      tamanhoProximaAbertura: this.memoizedProximaAbertura.size,
      tamanhoProximoFechamento: this.memoizedProximoFechamento.size,
    };
  };
}

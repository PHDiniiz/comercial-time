/**
 * Legacy Layer - Compatibilidade
 *
 * Esta camada mantém a compatibilidade com a API anterior,
 * incluindo toda a lógica de negócio em uma única classe.
 */

import type {
  DiaChave,
  Intervalo,
  Horario,
} from "../domain/entities/horario-comercial.entity";
import { normalizarHorario } from "../infrastructure/utils/normalize.util";
import {
  horaParaMinutos,
  diaIndex,
  minutosDoDia,
} from "../infrastructure/utils/time.util";
import { LIMITE_BUSCA_DIAS } from "../domain/entities/horario-comercial.entity";
import { getNowInTimezone } from "../infrastructure/utils/timezone.util";
import { getCurrentTimezone } from "../config/timezone.config";

/**
 * HorarioComercial - Classe principal unificada
 *
 * Classe unificada que contém toda a lógica de negócio
 * para horários comerciais com suporte a timezone.
 */
export class HorarioComercial {
  private readonly horario: Horario;
  private readonly feriados: ReadonlySet<string>;
  private instanceTimezone: string;

  constructor(
    horarioInput: Record<DiaChave, Intervalo[] | Intervalo>,
    feriados: readonly string[] = []
  ) {
    // Verificar se horarioInput é válido
    if (!horarioInput || typeof horarioInput !== "object") {
      throw new Error("horarioInput deve ser um objeto válido");
    }

    this.horario = normalizarHorario(horarioInput);
    this.feriados = new Set(
      feriados.map((f) => f.trim())
    ) as ReadonlySet<string>;
    this.instanceTimezone = getCurrentTimezone(); // Armazena o timezone atual
  }

  private ehFeriado = (data: Date): boolean => {
    const iso = data.toISOString().slice(0, 10);
    return this.feriados.has(iso);
  };

  estaAberto = (dt: Date | string = new Date()): boolean => {
    const date = typeof dt === "string" ? new Date(dt) : dt;
    if (Number.isNaN(date.getTime())) {
      throw new Error("Data inválida");
    }
    if (this.ehFeriado(date)) return false;

    const dia = diaIndex(date);
    const mins = minutosDoDia(date);
    const intervalos = this.horario[String(dia)] ?? [];

    for (const iv of intervalos) {
      const o = horaParaMinutos(iv.abertura);
      const c = horaParaMinutos(iv.fechamento);

      if (c > o) {
        if (mins >= o && mins < c) return true;
      } else {
        // overnight
        if (mins >= o || mins < c) return true;
      }
    }

    // checar intervalo overnight do dia anterior
    const prev = (dia + 6) % 7;
    const prevIntervalos = this.horario[String(prev)] ?? [];

    for (const iv of prevIntervalos) {
      const o = horaParaMinutos(iv.abertura);
      const c = horaParaMinutos(iv.fechamento);
      if (c <= o && mins < c) return true;
    }

    return false;
  };

  proximaAbertura = (dt: Date | string = new Date()): Date | null => {
    const date = typeof dt === "string" ? new Date(dt) : new Date(dt.getTime());
    if (Number.isNaN(date.getTime())) {
      throw new Error("Data inválida");
    }
    if (this.estaAberto(date)) return date;

    // busca até LIMITE_BUSCA_DIAS (permite feriados)
    for (let offset = 0; offset <= LIMITE_BUSCA_DIAS; offset++) {
      const cand = new Date(date.getTime());
      cand.setDate(date.getDate() + offset);
      if (this.ehFeriado(cand)) continue;

      const dIdx = diaIndex(cand);
      const intervalos = this.horario[String(dIdx)] ?? [];
      const currentMins = offset === 0 ? minutosDoDia(date) : -1;
      let best: number | null = null;

      for (const iv of intervalos) {
        const o = horaParaMinutos(iv.abertura);
        if (offset === 0) {
          if (o >= currentMins && (best === null || o < best)) {
            best = o;
          }
        } else if (best === null || o < best) {
          best = o;
        }
      }

      if (best !== null) {
        const res = new Date(cand.getTime());
        res.setHours(Math.floor(best / 60), best % 60, 0, 0);
        return res;
      }
    }
    return null;
  };

  proximoFechamento = (dt: Date | string = new Date()): Date | null => {
    const date = typeof dt === "string" ? new Date(dt) : new Date(dt.getTime());
    if (Number.isNaN(date.getTime())) {
      throw new Error("Data inválida");
    }
    if (this.ehFeriado(date)) return null;

    const dia = diaIndex(date);
    const mins = minutosDoDia(date);
    const intervalos = this.horario[String(dia)] ?? [];

    for (const iv of intervalos) {
      const o = horaParaMinutos(iv.abertura);
      const c = horaParaMinutos(iv.fechamento);

      if (c > o) {
        if (mins >= o && mins < c) {
          const res = new Date(date.getTime());
          res.setHours(Math.floor(c / 60), c % 60, 0, 0);
          return res;
        }
      } else {
        // overnight
        if (mins >= o) {
          const res = new Date(date.getTime());
          res.setDate(date.getDate() + 1);
          res.setHours(Math.floor(c / 60), c % 60, 0, 0);
          return res;
        } else if (mins < c) {
          const res = new Date(date.getTime());
          res.setHours(Math.floor(c / 60), c % 60, 0, 0);
          return res;
        }
      }
    }

    // se não estiver aberto, pega a próxima abertura e calcula fechamento
    const na = this.proximaAbertura(date);
    if (!na) return null;

    const dIdx = diaIndex(na);
    const intervalosNext = this.horario[String(dIdx)] ?? [];

    for (const iv of intervalosNext) {
      const o = horaParaMinutos(iv.abertura);
      if (o === na.getHours() * 60 + na.getMinutes()) {
        const c = horaParaMinutos(iv.fechamento);
        const res = new Date(na.getTime());
        if (c > o) {
          res.setHours(Math.floor(c / 60), c % 60, 0, 0);
        } else {
          res.setDate(res.getDate() + 1);
          res.setHours(Math.floor(c / 60), c % 60, 0, 0);
        }
        return res;
      }
    }
    return na;
  };

  adicionarMinutosUteis = (
    dt: Date | string = new Date(),
    minutosAdicionar: number = 0
  ): Date => {
    if (minutosAdicionar === 0) {
      return typeof dt === "string" ? new Date(dt) : new Date(dt.getTime());
    }

    let cursor = typeof dt === "string" ? new Date(dt) : new Date(dt.getTime());
    if (Number.isNaN(cursor.getTime())) {
      throw new Error("Data inválida");
    }

    if (!this.estaAberto(cursor)) {
      const no = this.proximaAbertura(cursor);
      if (!no) throw new Error("Não foi encontrada próxima abertura");
      cursor = no;
    }

    let restante = minutosAdicionar;
    while (restante > 0) {
      const fechamento = this.proximoFechamento(cursor);
      if (!fechamento)
        throw new Error("Não foi encontrado fechamento durante cálculo");

      const disponivel = Math.floor(
        (fechamento.getTime() - cursor.getTime()) / 60000
      );
      if (disponivel >= restante) {
        cursor = new Date(cursor.getTime() + restante * 60000);
        restante = 0;
        break;
      } else {
        restante -= disponivel;
        cursor = new Date(fechamento.getTime() + 1000);
        const no = this.proximaAbertura(cursor);
        if (!no)
          throw new Error(
            "Não foi encontrada próxima abertura durante cálculo"
          );
        cursor = no;
      }
    }
    return cursor;
  };

  minutosRestantesHoje = (dt: Date | string = new Date()): number => {
    const date = typeof dt === "string" ? new Date(dt) : new Date(dt.getTime());
    if (!this.estaAberto(date)) return 0;

    const fechamento = this.proximoFechamento(date);
    if (!fechamento) return 0;

    return Math.max(
      0,
      Math.floor((fechamento.getTime() - date.getTime()) / 60000)
    );
  };

  obterHorario = (): Horario => {
    return structuredClone(this.horario);
  };

  /**
   * Obtém o status atual (aberto/fechado) baseado no timezone configurado
   */
  get openedNow(): boolean {
    // Salva o timezone global atual
    const globalTimezone = getCurrentTimezone();

    // Define o timezone da instância temporariamente
    // setTimezone(this.instanceTimezone); // Removido - timezone é lido do .env

    // Obtém o status usando a lógica interna
    const now = getNowInTimezone(this.instanceTimezone);
    const status = this.estaAberto(now);

    // Restaura o timezone global
    // setTimezone(globalTimezone); // Removido - timezone é lido do .env

    return status;
  }

  /**
   * Define o timezone para esta instância
   * @param timezone - Timezone a ser configurado (ex: 'America/Sao_Paulo')
   * Se não especificado, usa o timezone do .env ou fallback padrão
   */
  setTimezone(timezone?: string): this {
    if (timezone) {
      this.instanceTimezone = timezone;
    } else {
      // Usa o timezone do .env ou fallback padrão
      const envTimezone = process.env.TIMEZONE;
      if (envTimezone) {
        // Valida se o timezone é válido
        try {
          Intl.DateTimeFormat(undefined, { timeZone: envTimezone });
          this.instanceTimezone = envTimezone;
        } catch {
          console.warn(
            `Timezone inválido no .env: ${envTimezone}. Usando fallback: America/Sao_Paulo`
          );
          this.instanceTimezone = "America/Sao_Paulo";
        }
      } else {
        this.instanceTimezone = "America/Sao_Paulo";
      }
    }
    return this; // Retorna this para permitir method chaining
  }

  /**
   * Obtém o timezone atual configurado para esta instância
   */
  getTimezone(): string {
    return this.instanceTimezone;
  }
}

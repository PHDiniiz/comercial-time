/**
 * Factory para criar instâncias do sistema de atualização de feriados
 *
 * Esta factory centraliza a criação de instâncias com todas as
 * dependências injetadas corretamente.
 */

import { FeriadoUpdateConfig } from "../../domain/entities/feriado-update.entity";
import {
  FeriadoUpdateController,
  FeriadoUpdateControllerImpl,
} from "../controllers/feriado-update.controller";

/**
 * Factory para criar instâncias do sistema de atualização de feriados
 */
export class FeriadoUpdateFactory {
  /**
   * Cria uma instância do controlador de atualização de feriados
   * @param config - Configuração para atualização de feriados
   * @returns Instância do controlador
   */
  static create(config: FeriadoUpdateConfig): FeriadoUpdateController {
    return new FeriadoUpdateControllerImpl(config);
  }

  /**
   * Cria uma instância com configuração padrão baseada no timezone
   * @returns Instância do controlador com configuração padrão
   */
  static createDefault(): FeriadoUpdateController {
    const timezone = process.env.TIMEZONE || "America/Sao_Paulo";
    const pais = FeriadoUpdateFactory.obterPaisPorTimezone(timezone);

    const config: FeriadoUpdateConfig = {
      pais,
      fonteNacionais: `API ${pais}`,
      fonteEstaduais: `API ${pais}`,
      intervaloMinutos: parseInt(
        process.env.FERIADO_UPDATE_INTERVAL_MINUTES || "60"
      ),
      timeoutMs: parseInt(process.env.FERIADO_UPDATE_TIMEOUT_MS || "10000"),
    };

    return FeriadoUpdateFactory.create(config);
  }

  /**
   * Cria uma instância para um país específico
   * @param pais - Código do país (BR, US, PT)
   * @returns Instância do controlador para o país
   */
  static createForCountry(pais: string): FeriadoUpdateController {
    const config: FeriadoUpdateConfig = {
      pais: pais.toUpperCase(),
      fonteNacionais: `API ${pais.toUpperCase()}`,
      fonteEstaduais: `API ${pais.toUpperCase()}`,
      intervaloMinutos: parseInt(
        process.env.FERIADO_UPDATE_INTERVAL_MINUTES || "60"
      ),
      timeoutMs: parseInt(process.env.FERIADO_UPDATE_TIMEOUT_MS || "10000"),
    };

    return FeriadoUpdateFactory.create(config);
  }

  /**
   * Obtém o país baseado no timezone
   * @param timezone - Timezone
   * @returns Código do país
   */
  private static obterPaisPorTimezone(timezone: string): string {
    // Mapeamento direto dos timezones principais
    if (timezone === "America/Sao_Paulo") {
      return "BR"; // pt-BR
    } else if (timezone === "America/New_York") {
      return "US"; // en-US
    } else if (timezone === "Europe/Lisbon") {
      return "PT"; // pt-PT
    }

    // Fallback para timezones similares
    if (
      timezone.includes("America/Sao_Paulo") ||
      timezone.includes("America/Recife") ||
      timezone.includes("America/Manaus") ||
      timezone.includes("America/Bahia") ||
      timezone.includes("America/Fortaleza")
    ) {
      return "BR";
    } else if (
      timezone.includes("America/New_York") ||
      timezone.includes("America/Los_Angeles") ||
      timezone.includes("America/Chicago") ||
      timezone.includes("America/Denver")
    ) {
      return "US";
    } else if (
      timezone.includes("Europe/Lisbon") ||
      timezone.includes("Europe/Azores") ||
      timezone.includes("Europe/Madeira")
    ) {
      return "PT";
    }

    return "BR"; // Fallback para Brasil
  }
}

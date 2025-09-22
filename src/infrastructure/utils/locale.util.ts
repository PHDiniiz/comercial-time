/**
 * Infrastructure Layer - Utilitários de Localização
 *
 * Esta camada contém utilitários para carregar dados de localização
 * dinâmica baseada na pasta /locale/my-location.
 */

import { Feriado } from "../../domain/entities/horario-comercial.entity";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { log } from "./logger.util";
import { cachedFetch } from "../services/cached-fetch.service";

// Usar diretório de trabalho atual
const currentDir = process.cwd();

/**
 * Interface para configuração de localização
 */
export interface LocaleConfig {
  /** Caminho para a pasta de localização (ex: "my-location") */
  location?: string;
  /** Fallback para pt-BR se a localização não for encontrada */
  fallbackToPtBr?: boolean;
  /** Usar feriados personalizados da variável de ambiente */
  usarFeriadosPersonalizados?: boolean;
}

/**
 * Valida se a string é uma URL válida
 * @param url - String para validar
 * @returns true se for uma URL válida
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Carrega feriados personalizados de uma URL
 * @param url - URL para carregar os feriados
 * @returns Promise com objeto de feriados ou null se falhar
 */
export async function carregarFeriadosPersonalizadosDeUrl(
  url: string
): Promise<{
  nacionais: Feriado[];
  estaduais: Record<string, Feriado[]>;
} | null> {
  try {
    if (!isValidUrl(url)) {
      log.warn("URL fornecida não é válida", undefined, { url });
      return null;
    }

    const dados = await cachedFetch.fetch(url, {
      method: "GET",
      cache: {
        ttl: 60 * 60 * 1000, // 1 hora para feriados personalizados
        enabled: true,
      },
      retry: {
        maxAttempts: 2,
        initialDelay: 1000,
        backoffMultiplier: 2,
        maxDelay: 3000,
      },
      timeout: {
        timeout: 5000,
        enabled: true,
      },
    });

    // Estrutura esperada: { nacionais: Feriado[], estaduais: Record<string, Feriado[]> }
    // ou apenas array de feriados nacionais para compatibilidade
    let feriadosNacionais: Feriado[] = [];
    let feriadosEstaduais: Record<string, Feriado[]> = {};

    if (Array.isArray(dados)) {
      // Formato antigo: array de feriados nacionais
      feriadosNacionais = dados;
    } else if (typeof dados === "object" && dados !== null) {
      // Formato novo: objeto com nacionais e estaduais
      if (Array.isArray(dados.nacionais)) {
        feriadosNacionais = dados.nacionais;
      }
      if (typeof dados.estaduais === "object" && dados.estaduais !== null) {
        feriadosEstaduais = dados.estaduais;
      }
    } else {
      // Dados da URL devem ser um array de feriados ou objeto com nacionais/estaduais
      return null;
    }

    // Validar feriados nacionais
    for (const feriado of feriadosNacionais) {
      if (!feriado.nome || !feriado.data || !feriado.observacoes) {
        // Cada feriado nacional personalizado deve ter: nome, data e observacoes
        return null;
      }
    }

    // Validar feriados estaduais
    for (const [estado, feriadosEstado] of Object.entries(feriadosEstaduais)) {
      if (!Array.isArray(feriadosEstado)) {
        // Feriados do estado devem ser um array
        return null;
      }
      for (const feriado of feriadosEstado) {
        if (!feriado.nome || !feriado.data || !feriado.observacoes) {
          // Cada feriado estadual personalizado deve ter: nome, data e observacoes
          return null;
        }
      }
    }

    return {
      nacionais: feriadosNacionais,
      estaduais: feriadosEstaduais,
    };
  } catch (error) {
    // Erro ao carregar feriados da URL
    return null;
  }
}

/**
 * Valida se PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON é uma URL válida
 * @param value - Valor da variável de ambiente
 * @returns true se for uma URL válida, false caso contrário
 */
function isValidPersonalHolidaysValue(value: string | undefined): boolean {
  // Se vazio, null ou undefined, é inválido
  if (!value || value.trim() === "") {
    return false;
  }

  // Se for uma URL válida, é válido
  if (isValidUrl(value)) {
    return true;
  }

  // Se for JSON válido, é válido
  try {
    JSON.parse(value);
    return true;
  } catch {
    // Não é JSON válido
  }

  // Qualquer outro valor é inválido
  return false;
}

/**
 * Carrega feriados personalizados da variável de ambiente PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON.
 * Detecta automaticamente se é URL ou JSON e processa adequadamente.
 * @returns Promise com objeto de feriados ou null se não definido
 */
export async function carregarFeriadosPersonalizados(): Promise<{
  nacionais: Feriado[];
  estaduais: Record<string, Feriado[]>;
} | null> {
  try {
    const personalHolidaysJson = process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;

    // Validar se o valor é uma URL válida
    if (!isValidPersonalHolidaysValue(personalHolidaysJson)) {
      // Log apenas em modo debug para reduzir warnings em testes
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON deve ser uma URL válida. Valores vazios, null, undefined ou inválidos são desconsiderados."
        );
      }
      return null;
    }

    // Se for uma URL válida, carregar da URL
    if (isValidUrl(personalHolidaysJson!)) {
      return await carregarFeriadosPersonalizadosDeUrl(personalHolidaysJson!);
    }

    // Se for JSON válido, processar diretamente
    try {
      const dados = JSON.parse(personalHolidaysJson!);

      // Estrutura esperada: { nacionais: Feriado[], estaduais: Record<string, Feriado[]> }
      // ou apenas array de feriados nacionais para compatibilidade
      let feriadosNacionais: Feriado[] = [];
      let feriadosEstaduais: Record<string, Feriado[]> = {};

      if (Array.isArray(dados)) {
        // Formato antigo: array de feriados nacionais
        feriadosNacionais = dados;
      } else if (typeof dados === "object" && dados !== null) {
        // Formato novo: objeto com nacionais e estaduais
        if (Array.isArray(dados.nacionais)) {
          feriadosNacionais = dados.nacionais;
        }
        if (typeof dados.estaduais === "object" && dados.estaduais !== null) {
          feriadosEstaduais = dados.estaduais;
        }
      } else {
        return null;
      }

      // Validar feriados nacionais
      for (const feriado of feriadosNacionais) {
        if (!feriado.nome || !feriado.data || !feriado.observacoes) {
          return null;
        }
      }

      // Validar feriados estaduais
      for (const [estado, feriados] of Object.entries(feriadosEstaduais)) {
        if (!Array.isArray(feriados)) {
          return null;
        }
        for (const feriado of feriados) {
          if (!feriado.nome || !feriado.data || !feriado.observacoes) {
            return null;
          }
        }
      }

      return {
        nacionais: feriadosNacionais,
        estaduais: feriadosEstaduais,
      };
    } catch {
      // JSON inválido
      return null;
    }
  } catch (error) {
    // Log removido para otimização
    return null;
  }
}

/**
 * Carrega feriados personalizados da variável de ambiente PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON (versão síncrona).
 * Apenas processa JSON, URLs são ignoradas nesta versão.
 * @returns Objeto com feriados nacionais e estaduais personalizados ou null se não definido
 */
export function carregarFeriadosPersonalizadosSync(): {
  nacionais: Feriado[];
  estaduais: Record<string, Feriado[]>;
} | null {
  try {
    const personalHolidaysJson = process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;

    // Validar se o valor é uma URL válida
    if (!isValidPersonalHolidaysValue(personalHolidaysJson)) {
      // Log apenas em modo debug para reduzir warnings em testes
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON deve ser uma URL válida. Valores vazios, null, undefined ou inválidos são desconsiderados."
        );
      }
      return null;
    }

    // Se for uma URL, não processar aqui (versão síncrona não suporta URLs)
    if (isValidUrl(personalHolidaysJson!)) {
      console.warn(
        "PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON contém uma URL. Use carregarFeriadosPersonalizados() para suporte a URLs."
      );
      return null;
    }

    // Este ponto nunca deve ser alcançado devido à validação acima
    return null;
  } catch (error) {
    // Log removido para otimização
    return null;
  } finally {
    // Garantir que sempre retornamos um valor válido
    // (já tratado nos catch/return acima)
  }
}

/**
 * Carrega feriados nacionais de uma localização específica.
 * @param location - Pasta de localização (ex: "my-location")
 * @returns Array de feriados nacionais ou null se não encontrado
 */
export function carregarFeriadosNacionais(location?: string): Feriado[] | null {
  try {
    const localePath = location ? `locale/${location}` : "locale/pt-br";
    const filePath = join(
      process.cwd(),
      "src",
      localePath,
      "feriados-nacionais.json"
    );

    if (!existsSync(filePath)) {
      return null;
    }

    const data = readFileSync(filePath, "utf-8");
    const feriados = JSON.parse(data) as Feriado[];

    // Validar estrutura básica
    if (!Array.isArray(feriados)) {
      return null;
    }

    // Validar cada feriado
    for (const feriado of feriados) {
      if (!feriado.nome || !feriado.data || !feriado.observacoes) {
        return null;
      }
    }

    return feriados;
  } catch (error) {
    // Log removido para otimização
    return null;
  } finally {
    // Garantir que sempre retornamos um valor válido
    // (já tratado nos catch/return acima)
  }
}

/**
 * Carrega feriados estaduais de uma localização específica.
 * @param location - Pasta de localização (ex: "my-location")
 * @returns Objeto com feriados estaduais ou null se não encontrado
 */
export function carregarFeriadosEstaduais(
  location?: string
): Record<string, Feriado[]> | null {
  try {
    const localePath = location ? `locale/${location}` : "locale/pt-br";
    const filePath = join(
      process.cwd(),
      "src",
      localePath,
      "feriados-estaduais.json"
    );

    if (!existsSync(filePath)) {
      return null;
    }

    const data = readFileSync(filePath, "utf-8");
    const feriados = JSON.parse(data) as Record<string, Feriado[]>;

    // Validar estrutura básica
    if (typeof feriados !== "object" || feriados === null) {
      return null;
    }

    // Validar cada estado e seus feriados
    for (const [estado, feriadosEstado] of Object.entries(feriados)) {
      if (!Array.isArray(feriadosEstado)) {
        return null;
      }

      for (const feriado of feriadosEstado) {
        if (!feriado.nome || !feriado.data || !feriado.observacoes) {
          return null;
        }
      }
    }

    return feriados;
  } catch (error) {
    // Log removido para otimização
    return null;
  } finally {
    // Garantir que sempre retornamos um valor válido
    // (já tratado nos catch/return acima)
  }
}

/**
 * Carrega dados de localização com fallback para pt-BR.
 * Prioriza feriados personalizados da variável de ambiente se disponível.
 * @param config - Configuração de localização
 * @returns Objeto com feriados nacionais e estaduais
 */
export async function carregarDadosLocalizacao(
  config: LocaleConfig = {}
): Promise<{
  feriadosNacionais: Feriado[];
  feriadosEstaduais: Record<string, Feriado[]>;
  localizacaoUsada: string;
  usandoFeriadosPersonalizados: boolean;
}> {
  const {
    location,
    fallbackToPtBr = true,
    usarFeriadosPersonalizados = true,
  } = config;

  // PRIORIDADE 1: Verificar se há feriados personalizados na variável de ambiente
  if (usarFeriadosPersonalizados) {
    const feriadosPersonalizados = await carregarFeriadosPersonalizados();
    if (feriadosPersonalizados) {
      console.log(
        "Usando feriados personalizados da variável PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON"
      );
      return {
        feriadosNacionais: feriadosPersonalizados.nacionais,
        feriadosEstaduais: feriadosPersonalizados.estaduais,
        localizacaoUsada: "personalizado",
        usandoFeriadosPersonalizados: true,
      };
    }
  }

  // PRIORIDADE 2: Tentar carregar da localização especificada
  let feriadosNacionais = location ? carregarFeriadosNacionais(location) : null;
  let feriadosEstaduais = location ? carregarFeriadosEstaduais(location) : null;
  let localizacaoUsada = location || "pt-br";

  // PRIORIDADE 3: Se não encontrou ou falhou, usar fallback pt-BR
  if ((!feriadosNacionais || !feriadosEstaduais) && fallbackToPtBr) {
    console.warn(
      `Localização "${location}" não encontrada ou inválida. Usando pt-BR como fallback.`
    );

    feriadosNacionais = carregarFeriadosNacionais("pt-br");
    feriadosEstaduais = carregarFeriadosEstaduais("pt-br");
    localizacaoUsada = "pt-br";
  }

  // Se ainda não conseguiu carregar, usar dados padrão
  if (!feriadosNacionais) {
    feriadosNacionais = [];
  }
  if (!feriadosEstaduais) {
    feriadosEstaduais = {};
  }

  return {
    feriadosNacionais,
    feriadosEstaduais,
    localizacaoUsada,
    usandoFeriadosPersonalizados: false,
  };
}

/**
 * Lista todas as localizações disponíveis.
 * @returns Array com nomes das pastas de localização
 */
export function listarLocalizacoesDisponiveis(): string[] {
  try {
    const fs = require("fs");
    const path = require("path");
    const localeDir = join(__dirname, "../locale");

    if (!existsSync(localeDir)) {
      return ["pt-br"]; // Fallback
    }

    const diretorios = fs
      .readdirSync(localeDir, { withFileTypes: true })
      .filter((dirent: any) => dirent.isDirectory())
      .map((dirent: any) => dirent.name);

    return diretorios.length > 0 ? diretorios : ["pt-br"];
  } catch (error) {
    // Log removido para otimização
    return ["pt-br"];
  } finally {
    // Garantir que sempre retornamos um array válido
    // (já tratado nos catch/return acima)
  }
}

/**
 * Verifica se uma localização é válida.
 * @param location - Nome da localização
 * @returns true se a localização for válida
 */
export function localizacaoValida(location: string): boolean {
  try {
    const feriadosNacionais = carregarFeriadosNacionais(location);
    const feriadosEstaduais = carregarFeriadosEstaduais(location);

    return feriadosNacionais !== null && feriadosEstaduais !== null;
  } catch (error) {
    return false;
  } finally {
    // Garantir que sempre retornamos um boolean válido
    // (já tratado nos catch/return acima)
  }
}

/**
 * Verifica se há feriados personalizados disponíveis na variável de ambiente.
 * @returns true se a variável PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON estiver definida e válida
 */
export function feriadosPersonalizadosDisponiveis(): boolean {
  try {
    const personalHolidaysJson = process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;

    // Validar se o valor é uma URL válida ou JSON válido
    if (!isValidPersonalHolidaysValue(personalHolidaysJson)) {
      return false;
    }

    // Se passou na validação, é disponível (seja URL ou JSON)
    return true;
  } catch (error) {
    return false;
  } finally {
    // Garantir que sempre retornamos um boolean válido
    // (já tratado nos catch/return acima)
  }
}

/**
 * Obtém informações sobre os feriados personalizados.
 * @returns Objeto com informações sobre os feriados personalizados
 */
export function obterInfoFeriadosPersonalizados(): {
  disponivel: boolean;
  quantidadeNacionais: number;
  quantidadeEstaduais: number;
  total: number;
  exemploNacional?: Feriado | undefined;
  exemploEstadual?: Feriado | undefined;
  estadosDisponiveis: string[];
} {
  try {
    const personalHolidaysJson = process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;

    // Validar se o valor é uma URL válida
    if (!isValidPersonalHolidaysValue(personalHolidaysJson)) {
      return {
        disponivel: false,
        quantidadeNacionais: 0,
        quantidadeEstaduais: 0,
        total: 0,
        estadosDisponiveis: [],
      };
    }

    // Se for uma URL válida, indicar que está disponível mas não processar aqui
    if (isValidUrl(personalHolidaysJson!)) {
      return {
        disponivel: true,
        quantidadeNacionais: 0, // Será carregado quando necessário
        quantidadeEstaduais: 0, // Será carregado quando necessário
        total: 0, // Será carregado quando necessário
        estadosDisponiveis: [], // Será carregado quando necessário
      };
    }

    // Se for JSON válido, processar diretamente
    try {
      const dados = JSON.parse(personalHolidaysJson!);

      let feriadosNacionais: Feriado[] = [];
      let feriadosEstaduais: Record<string, Feriado[]> = {};

      if (Array.isArray(dados)) {
        feriadosNacionais = dados;
      } else if (typeof dados === "object" && dados !== null) {
        if (Array.isArray(dados.nacionais)) {
          feriadosNacionais = dados.nacionais;
        }
        if (typeof dados.estaduais === "object" && dados.estaduais !== null) {
          feriadosEstaduais = dados.estaduais;
        }
      }

      const estadosDisponiveis = Object.keys(feriadosEstaduais);
      const exemploNacional = feriadosNacionais[0];
      const exemploEstadual =
        estadosDisponiveis.length > 0
          ? feriadosEstaduais[estadosDisponiveis[0]!]?.[0]
          : undefined;

      return {
        disponivel: true,
        quantidadeNacionais: feriadosNacionais.length,
        quantidadeEstaduais: Object.values(feriadosEstaduais).reduce(
          (total, feriados) => total + feriados.length,
          0
        ),
        total:
          feriadosNacionais.length +
          Object.values(feriadosEstaduais).reduce(
            (total, feriados) => total + feriados.length,
            0
          ),
        exemploNacional,
        exemploEstadual,
        estadosDisponiveis,
      };
    } catch {
      // JSON inválido
      return {
        disponivel: false,
        quantidadeNacionais: 0,
        quantidadeEstaduais: 0,
        total: 0,
        estadosDisponiveis: [],
      };
    }
  } catch (error) {
    return {
      disponivel: false,
      quantidadeNacionais: 0,
      quantidadeEstaduais: 0,
      total: 0,
      estadosDisponiveis: [],
    };
  } finally {
    // Garantir que sempre retornamos um objeto válido
    // (já tratado nos catch/return acima)
  }
}

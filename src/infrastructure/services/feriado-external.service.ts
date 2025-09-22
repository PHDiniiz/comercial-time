/**
 * Serviço de infraestrutura para buscar feriados de fontes externas
 *
 * Este serviço implementa a integração com APIs externas para
 * obter dados atualizados de feriados nacionais e estaduais.
 */

import { Feriado } from "../../domain/entities/horario-comercial.entity";
import { cachedFetch } from "./cached-fetch.service";

export interface FeriadoExternalSource {
  /** Nome da fonte */
  readonly nome: string;
  /** URL base da API */
  readonly urlBase: string;
  /** Endpoint para feriados nacionais */
  readonly endpointNacionais: string;
  /** Endpoint para feriados estaduais */
  readonly endpointEstaduais: string;
  /** Headers necessários para autenticação */
  readonly headers?: Record<string, string>;
}

export interface FeriadoExternalResponse {
  /** Feriados nacionais obtidos */
  readonly nacionais: Feriado[];
  /** Feriados estaduais obtidos por estado */
  readonly estaduais: Record<string, Feriado[]>;
  /** Sucesso da operação */
  readonly sucesso: boolean;
  /** Mensagem de status */
  readonly mensagem: string;
  /** Erro se houver */
  readonly erro?: string;
}

/**
 * Serviço para buscar feriados de fontes externas
 */
export class FeriadoExternalService {
  private readonly sources: Record<string, FeriadoExternalSource> = {
    BR: {
      nome: "API Brasil",
      urlBase: "https://api.calendario.com.br",
      endpointNacionais: "/feriados-nacionais",
      endpointEstaduais: "/feriados-estaduais",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "comercialTime/1.0.0",
      },
    },
    US: {
      nome: "Holiday API",
      urlBase: "https://holidayapi.com",
      endpointNacionais: "/v1/holidays",
      endpointEstaduais: "/v1/holidays",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "comercialTime/1.0.0",
      },
    },
    PT: {
      nome: "API Portugal",
      urlBase: "https://api.portugal.com",
      endpointNacionais: "/feriados-nacionais",
      endpointEstaduais: "/feriados-regionais",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "comercialTime/1.0.0",
      },
    },
  };

  /**
   * Busca feriados nacionais de uma fonte externa
   * @param pais - Código do país (BR, US, PT)
   * @param ano - Ano para buscar os feriados
   * @param timeoutMs - Timeout em milissegundos
   * @returns Promise com os feriados nacionais
   */
  async buscarFeriadosNacionais(
    pais: string,
    ano: number = new Date().getFullYear(),
    timeoutMs: number = 10000
  ): Promise<Feriado[]> {
    // Usar dados estáticos dos feriados mais buscados
    console.log(
      `[${pais.toUpperCase()}] Usando dados estáticos de feriados nacionais`
    );
    return this.obterFeriadosFallbackNacionais(pais, ano);
  }

  /**
   * Busca feriados estaduais de uma fonte externa
   * @param pais - Código do país (BR, US, PT)
   * @param ano - Ano para buscar os feriados
   * @param timeoutMs - Timeout em milissegundos
   * @returns Promise com os feriados estaduais
   */
  async buscarFeriadosEstaduais(
    pais: string,
    ano: number = new Date().getFullYear(),
    timeoutMs: number = 10000
  ): Promise<Record<string, Feriado[]>> {
    // Usar dados estáticos dos feriados mais buscados
    console.log(
      `[${pais.toUpperCase()}] Usando dados estáticos de feriados estaduais`
    );
    return this.obterFeriadosFallbackEstaduais(pais, ano);
  }

  /**
   * Faz uma requisição HTTP com cacheamento e retry automático
   * @param {string} url - URL para requisição
   * @param {Record<string, string>} [headers] - Headers da requisição
   * @param {number} [timeoutMs] - Timeout em milissegundos
   * @returns {Promise<any>} Promise com a resposta
   */
  private async fazerRequisicao(
    url: string,
    headers: Record<string, string> = {},
    timeoutMs: number = 10000
  ): Promise<any> {
    try {
      return await cachedFetch.fetch(url, {
        method: "GET",
        headers,
        timeout: {
          timeout: timeoutMs,
          enabled: true,
        },
        cache: {
          ttl: 30 * 60 * 1000, // 30 minutos para feriados
          enabled: true,
        },
        retry: {
          maxAttempts: 3,
          initialDelay: 1000,
          backoffMultiplier: 2,
          maxDelay: 5000,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Processa resposta de feriados nacionais
   * @param response - Resposta da API
   * @param pais - Código do país
   * @returns Array de feriados nacionais
   */
  private processarRespostaNacionais(response: any, pais: string): Feriado[] {
    // Implementação específica para cada país
    switch (pais.toUpperCase()) {
      case "BR":
        return this.processarFeriadosBrasilNacionais(response);
      case "US":
        return this.processarFeriadosUSNacionais(response);
      case "PT":
        return this.processarFeriadosPortugalNacionais(response);
      default:
        throw new Error(`Processamento não implementado para o país: ${pais}`);
    }
  }

  /**
   * Processa resposta de feriados estaduais
   * @param response - Resposta da API
   * @param pais - Código do país
   * @returns Objeto com feriados estaduais por estado
   */
  private processarRespostaEstaduais(
    response: any,
    pais: string
  ): Record<string, Feriado[]> {
    // Implementação específica para cada país
    switch (pais.toUpperCase()) {
      case "BR":
        return this.processarFeriadosBrasilEstaduais(response);
      case "US":
        return this.processarFeriadosUSEstaduais(response);
      case "PT":
        return this.processarFeriadosPortugalEstaduais(response);
      default:
        throw new Error(`Processamento não implementado para o país: ${pais}`);
    }
  }

  /**
   * Processa feriados nacionais do Brasil
   * @param response - Resposta da API
   * @returns Array de feriados nacionais
   */
  private processarFeriadosBrasilNacionais(response: any): Feriado[] {
    if (!Array.isArray(response)) {
      return this.obterFeriadosFallbackNacionais("BR");
    }

    return response.map((item: any) => ({
      nome: item.nome || item.name || item.title,
      data: item.data || item.date || item.dataISO,
      observacoes: item.observacoes || item.description || item.notes || "",
    }));
  }

  /**
   * Processa feriados estaduais do Brasil
   * @param response - Resposta da API
   * @returns Objeto com feriados estaduais por estado
   */
  private processarFeriadosBrasilEstaduais(
    response: any
  ): Record<string, Feriado[]> {
    if (!response || typeof response !== "object") {
      return this.obterFeriadosFallbackEstaduais("BR");
    }

    const result: Record<string, Feriado[]> = {};

    for (const [estado, feriados] of Object.entries(response)) {
      if (Array.isArray(feriados)) {
        result[estado] = feriados.map((item: any) => ({
          nome: item.nome || item.name || item.title,
          data: item.data || item.date || item.dataISO,
          observacoes: item.observacoes || item.description || item.notes || "",
        }));
      }
    }

    return result;
  }

  /**
   * Processa feriados nacionais dos EUA
   * @param response - Resposta da API
   * @returns Array de feriados nacionais
   */
  private processarFeriadosUSNacionais(response: any): Feriado[] {
    if (!response || !response.holidays || !Array.isArray(response.holidays)) {
      return this.obterFeriadosFallbackNacionais("US");
    }

    return response.holidays
      .filter(
        (item: any) => item.type === "national" || item.type === "federal"
      )
      .map((item: any) => ({
        nome: item.name,
        data: item.date,
        observacoes: item.description || item.notes || "",
      }));
  }

  /**
   * Processa feriados estaduais dos EUA
   * @param response - Resposta da API
   * @returns Objeto com feriados estaduais por estado
   */
  private processarFeriadosUSEstaduais(
    response: any
  ): Record<string, Feriado[]> {
    if (!response || !response.holidays || !Array.isArray(response.holidays)) {
      return this.obterFeriadosFallbackEstaduais("US");
    }

    const result: Record<string, Feriado[]> = {};

    response.holidays
      .filter((item: any) => item.type === "state" && item.states)
      .forEach((item: any) => {
        item.states.forEach((state: string) => {
          if (!result[state]) {
            result[state] = [];
          }
          result[state].push({
            nome: item.name,
            data: item.date,
            observacoes: item.description || item.notes || "",
          });
        });
      });

    return result;
  }

  /**
   * Processa feriados nacionais de Portugal
   * @param response - Resposta da API
   * @returns Array de feriados nacionais
   */
  private processarFeriadosPortugalNacionais(response: any): Feriado[] {
    if (!Array.isArray(response)) {
      return this.obterFeriadosFallbackNacionais("PT");
    }

    return response.map((item: any) => ({
      nome: item.nome || item.name || item.title,
      data: item.data || item.date || item.dataISO,
      observacoes: item.observacoes || item.description || item.notes || "",
    }));
  }

  /**
   * Processa feriados regionais de Portugal
   * @param response - Resposta da API
   * @returns Objeto com feriados regionais por região
   */
  private processarFeriadosPortugalEstaduais(
    response: any
  ): Record<string, Feriado[]> {
    if (!response || typeof response !== "object") {
      return this.obterFeriadosFallbackEstaduais("PT");
    }

    const result: Record<string, Feriado[]> = {};

    for (const [regiao, feriados] of Object.entries(response)) {
      if (Array.isArray(feriados)) {
        result[regiao] = feriados.map((item: any) => ({
          nome: item.nome || item.name || item.title,
          data: item.data || item.date || item.dataISO,
          observacoes: item.observacoes || item.description || item.notes || "",
        }));
      }
    }

    return result;
  }

  /**
   * Obtém feriados nacionais de fallback quando a API falha
   * @param pais - Código do país
   * @param ano - Ano para os feriados
   * @returns Array de feriados nacionais
   */
  private obterFeriadosFallbackNacionais(
    pais: string,
    ano: number = new Date().getFullYear()
  ): Feriado[] {
    // Retorna feriados básicos quando a API externa falha
    switch (pais.toUpperCase()) {
      case "BR":
        return [
          {
            nome: "Confraternização Universal",
            data: `${ano}-01-01`,
            observacoes: "Início do ano civil.",
          },
          {
            nome: "Tiradentes",
            data: `${ano}-04-21`,
            observacoes: "Em homenagem ao mártir da Inconfidência Mineira.",
          },
          {
            nome: "Dia do Trabalhador",
            data: `${ano}-05-01`,
            observacoes: "Homenagem a todos os trabalhadores.",
          },
          {
            nome: "Independência do Brasil",
            data: `${ano}-09-07`,
            observacoes: "Proclamação da Independência.",
          },
          {
            nome: "Nossa Senhora Aparecida",
            data: `${ano}-10-12`,
            observacoes: "Padroeira do Brasil.",
          },
          {
            nome: "Finados",
            data: `${ano}-11-02`,
            observacoes: "Dia em memória aos mortos.",
          },
          {
            nome: "Proclamação da República",
            data: `${ano}-11-15`,
            observacoes: "Transformação do Império em República.",
          },
          {
            nome: "Dia Nacional de Zumbi e da Consciência Negra",
            data: `${ano}-11-20`,
            observacoes: "Data da Morte de Zumbi dos Palmares.",
          },
          {
            nome: "Natal",
            data: `${ano}-12-25`,
            observacoes: "Celebração do nascimento de Jesus.",
          },
        ];
      case "US":
        return [
          {
            nome: "New Year's Day",
            data: `${ano}-01-01`,
            observacoes: "New Year's Day celebration.",
          },
          {
            nome: "Martin Luther King Jr. Day",
            data: `${ano}-01-20`,
            observacoes: "Honoring civil rights leader.",
          },
          {
            nome: "Presidents' Day",
            data: `${ano}-02-17`,
            observacoes: "Honoring US presidents.",
          },
          {
            nome: "Memorial Day",
            data: `${ano}-05-26`,
            observacoes: "Honoring fallen soldiers.",
          },
          {
            nome: "Juneteenth",
            data: `${ano}-06-19`,
            observacoes: "Commemorating the end of slavery.",
          },
          {
            nome: "Independence Day",
            data: `${ano}-07-04`,
            observacoes: "US Independence Day.",
          },
          {
            nome: "Labor Day",
            data: `${ano}-09-01`,
            observacoes: "Honoring workers.",
          },
          {
            nome: "Columbus Day",
            data: `${ano}-10-13`,
            observacoes: "Commemorating Columbus' arrival.",
          },
          {
            nome: "Veterans Day",
            data: `${ano}-11-11`,
            observacoes: "Honoring military veterans.",
          },
          {
            nome: "Thanksgiving",
            data: `${ano}-11-27`,
            observacoes: "Thanksgiving celebration.",
          },
          {
            nome: "Christmas Day",
            data: `${ano}-12-25`,
            observacoes: "Christmas celebration.",
          },
        ];
      case "PT":
        return [
          {
            nome: "Dia de Ano Novo",
            data: `${ano}-01-01`,
            observacoes: "Início do ano civil.",
          },
          {
            nome: "Carnaval",
            data: `${ano}-03-04`,
            observacoes: "Carnaval.",
          },
          {
            nome: "Sexta-feira Santa",
            data: `${ano}-04-18`,
            observacoes: "Sexta-feira Santa.",
          },
          {
            nome: "Páscoa",
            data: `${ano}-04-21`,
            observacoes: "Domingo de Páscoa.",
          },
          {
            nome: "Dia da Liberdade",
            data: `${ano}-04-25`,
            observacoes: "Revolução dos Cravos.",
          },
          {
            nome: "Dia do Trabalhador",
            data: `${ano}-05-01`,
            observacoes: "Dia Internacional do Trabalhador.",
          },
          {
            nome: "Dia de Portugal",
            data: `${ano}-06-10`,
            observacoes:
              "Dia de Portugal, de Camões e das Comunidades Portuguesas.",
          },
          {
            nome: "Assunção de Nossa Senhora",
            data: `${ano}-08-15`,
            observacoes: "Assunção de Nossa Senhora.",
          },
          {
            nome: "Implantação da República",
            data: `${ano}-10-05`,
            observacoes: "Implantação da República.",
          },
          {
            nome: "Dia de Todos os Santos",
            data: `${ano}-11-01`,
            observacoes: "Dia de Todos os Santos.",
          },
          {
            nome: "Restauração da Independência",
            data: `${ano}-12-01`,
            observacoes: "Restauração da Independência.",
          },
          {
            nome: "Imaculada Conceição",
            data: `${ano}-12-08`,
            observacoes: "Imaculada Conceição.",
          },
          {
            nome: "Natal",
            data: `${ano}-12-25`,
            observacoes: "Celebração do nascimento de Jesus.",
          },
        ];
      default:
        return [];
    }
  }

  /**
   * Obtém feriados estaduais de fallback quando a API falha
   * @param pais - Código do país
   * @param ano - Ano para os feriados
   * @returns Objeto com feriados estaduais por estado
   */
  private obterFeriadosFallbackEstaduais(
    pais: string,
    ano: number = new Date().getFullYear()
  ): Record<string, Feriado[]> {
    // Retorna feriados básicos quando a API externa falha
    switch (pais.toUpperCase()) {
      case "BR":
        return {
          SP: [
            {
              nome: "Dia da Revolução Constitucionalista",
              data: `${ano}-07-09`,
              observacoes: "Revolução Constitucionalista de 1932.",
            },
          ],
          RJ: [
            {
              nome: "Dia de São Sebastião",
              data: `${ano}-01-20`,
              observacoes: "Padroeiro da cidade do Rio de Janeiro.",
            },
          ],
          MG: [
            {
              nome: "Dia de Tiradentes",
              data: `${ano}-04-21`,
              observacoes: "Mártir da Inconfidência Mineira.",
            },
          ],
          RS: [
            {
              nome: "Revolução Farroupilha",
              data: `${ano}-09-20`,
              observacoes: "Revolução Farroupilha.",
            },
          ],
          BA: [
            {
              nome: "Independência da Bahia",
              data: `${ano}-07-02`,
              observacoes: "Independência da Bahia.",
            },
          ],
          PE: [
            {
              nome: "Revolução Pernambucana",
              data: `${ano}-03-06`,
              observacoes: "Revolução Pernambucana.",
            },
          ],
        };
      case "US":
        return {
          CA: [
            {
              nome: "Cesar Chavez Day",
              data: `${ano}-03-31`,
              observacoes: "Honoring labor leader Cesar Chavez.",
            },
          ],
          TX: [
            {
              nome: "Texas Independence Day",
              data: `${ano}-03-02`,
              observacoes: "Texas Independence Day.",
            },
          ],
          NY: [
            {
              nome: "Election Day",
              data: `${ano}-11-05`,
              observacoes: "General Election Day.",
            },
          ],
          FL: [
            {
              nome: "Good Friday",
              data: `${ano}-04-18`,
              observacoes: "Good Friday.",
            },
          ],
          IL: [
            {
              nome: "Casimir Pulaski Day",
              data: `${ano}-03-04`,
              observacoes: "Honoring Casimir Pulaski.",
            },
          ],
          MA: [
            {
              nome: "Patriots' Day",
              data: `${ano}-04-15`,
              observacoes: "Patriots' Day.",
            },
          ],
        };
      case "PT":
        return {
          LISBOA: [
            {
              nome: "Dia de Santo António",
              data: `${ano}-06-13`,
              observacoes: "Padroeiro de Lisboa.",
            },
          ],
          PORTO: [
            {
              nome: "Dia de São João",
              data: `${ano}-06-24`,
              observacoes: "Padroeiro do Porto.",
            },
          ],
          COIMBRA: [
            {
              nome: "Dia da Rainha Santa",
              data: `${ano}-07-04`,
              observacoes: "Padroeira de Coimbra.",
            },
          ],
          BRAGA: [
            {
              nome: "Dia de São João Baptista",
              data: `${ano}-06-24`,
              observacoes: "Padroeiro de Braga.",
            },
          ],
          AVEIRO: [
            {
              nome: "Dia de Santa Joana",
              data: `${ano}-05-12`,
              observacoes: "Padroeira de Aveiro.",
            },
          ],
          FARO: [
            {
              nome: "Dia de São Gonçalo",
              data: `${ano}-01-10`,
              observacoes: "Padroeiro de Faro.",
            },
          ],
        };
      default:
        return {};
    }
  }
}

/**
 * Testes para funcionalidades de feriados personalizados via URL
 */

// Jest imports
import {
  carregarFeriadosPersonalizados,
  carregarFeriadosPersonalizadosDeUrl,
  feriadosPersonalizadosDisponiveis,
  obterInfoFeriadosPersonalizados,
} from "../../src/infrastructure/utils/locale.util";

// Mock do cachedFetch
jest.mock("../../src/infrastructure/services/cached-fetch.service", () => ({
  cachedFetch: {
    fetch: jest.fn(),
  },
}));

import { cachedFetch } from "../../src/infrastructure/services/cached-fetch.service";

describe("Feriados Personalizados via URL", () => {
  beforeEach(() => {
    // Limpar mocks
    jest.clearAllMocks();
    (cachedFetch.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    // Limpar variáveis de ambiente
    delete process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;
  });

  describe("carregarFeriadosPersonalizadosDeUrl", () => {
    it("deve carregar feriados de URL válida com formato novo", async () => {
      const mockData = {
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {
          SP: [
            {
              nome: "Feriado SP",
              data: "2025-07-09",
              observacoes: "Feriado estadual",
            },
          ],
        },
      };

      (cachedFetch.fetch as jest.Mock).mockResolvedValue(mockData);

      const result = await carregarFeriadosPersonalizadosDeUrl(
        "https://api.exemplo.com/feriados.json"
      );

      expect(result).toEqual({
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {
          SP: [
            {
              nome: "Feriado SP",
              data: "2025-07-09",
              observacoes: "Feriado estadual",
            },
          ],
        },
      });
    });

    it("deve carregar feriados de URL válida com formato antigo (array)", async () => {
      const mockData = [
        {
          nome: "Dia da Empresa",
          data: "2025-03-15",
          observacoes: "Aniversário da empresa",
        },
      ];

      (cachedFetch.fetch as jest.Mock).mockResolvedValue(mockData);

      const result = await carregarFeriadosPersonalizadosDeUrl(
        "https://api.exemplo.com/feriados.json"
      );

      expect(result).toEqual({
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {},
      });
    });

    it("deve retornar null para URL inválida", async () => {
      const result = await carregarFeriadosPersonalizadosDeUrl("not-a-url");
      expect(result).toBeNull();
    });

    it("deve retornar null para resposta HTTP não OK", async () => {
      // Mock para retornar null quando há erro
      (cachedFetch.fetch as jest.Mock).mockResolvedValue(null);

      const result = await carregarFeriadosPersonalizadosDeUrl(
        "https://api.exemplo.com/feriados.json"
      );
      expect(result).toBeNull();
    });

    it("deve retornar null para JSON inválido", async () => {
      // Mock para retornar dados inválidos
      (cachedFetch.fetch as jest.Mock).mockResolvedValue("invalid json");

      const result = await carregarFeriadosPersonalizadosDeUrl(
        "https://api.exemplo.com/feriados.json"
      );
      expect(result).toBeNull();
    });

    it("deve retornar null para feriado sem campos obrigatórios", async () => {
      const mockData = [
        {
          nome: "Dia da Empresa",
          // data e observacoes faltando
        },
      ];

      (cachedFetch.fetch as jest.Mock).mockResolvedValue(mockData);

      const result = await carregarFeriadosPersonalizadosDeUrl(
        "https://api.exemplo.com/feriados.json"
      );
      expect(result).toBeNull();
    });

    it("deve retornar null para erro de rede", async () => {
      (cachedFetch.fetch as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await carregarFeriadosPersonalizadosDeUrl(
        "https://api.exemplo.com/feriados.json"
      );
      expect(result).toBeNull();
    });
  });

  describe("carregarFeriadosPersonalizados (assíncrono)", () => {
    it("deve carregar feriados de URL quando PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON é URL", async () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON =
        "https://api.exemplo.com/feriados.json";

      const mockData = {
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {},
      };

      (cachedFetch.fetch as jest.Mock).mockResolvedValue(mockData);

      const result = await carregarFeriadosPersonalizados();

      expect(result).toEqual({
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {},
      });
    });

    it("deve carregar feriados de JSON quando PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON é JSON", async () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = JSON.stringify({
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {},
      });

      const result = await carregarFeriadosPersonalizados();

      expect(result).toEqual({
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {},
      });
    });

    it("deve retornar null quando PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON é vazio", async () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = "";

      const result = await carregarFeriadosPersonalizados();
      expect(result).toBeNull();
    });

    it("deve retornar null quando PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON é undefined", async () => {
      delete process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;

      const result = await carregarFeriadosPersonalizados();
      expect(result).toBeNull();
    });

    it("deve retornar null quando PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON é inválido", async () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = "invalid-value";

      const result = await carregarFeriadosPersonalizados();
      expect(result).toBeNull();
    });
  });

  describe("feriadosPersonalizadosDisponiveis", () => {
    it("deve retornar true para URL válida", () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON =
        "https://api.exemplo.com/feriados.json";

      const result = feriadosPersonalizadosDisponiveis();
      expect(result).toBe(true);
    });

    it("deve retornar true para JSON válido", () => {
      const jsonData = JSON.stringify([
        {
          nome: "Dia da Empresa",
          data: "2025-03-15",
          observacoes: "Aniversário da empresa",
        },
      ]);

      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = jsonData;

      // Debug: verificar se a variável foi definida
      console.log(
        "PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON:",
        process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON
      );

      // Debug: testar a validação diretamente
      try {
        const isValid = JSON.parse(jsonData);
        console.log("JSON válido:", isValid);
      } catch (e) {
        console.log("JSON inválido:", e);
      }

      // Debug: testar a função isValidPersonalHolidaysValue diretamente
      const personalHolidaysJson =
        process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;
      console.log("personalHolidaysJson:", personalHolidaysJson);
      console.log(
        "isValidUrl:",
        personalHolidaysJson ? personalHolidaysJson.startsWith("http") : false
      );

      // Debug: testar a validação JSON diretamente
      try {
        const parsed = JSON.parse(personalHolidaysJson!);
        console.log("JSON parse success:", parsed);
      } catch (e) {
        console.log("JSON parse error:", e);
      }

      // Debug: testar a função isValidPersonalHolidaysValue diretamente
      console.log("Testing isValidPersonalHolidaysValue directly:");
      console.log("Value:", personalHolidaysJson);
      console.log(
        "Is empty:",
        !personalHolidaysJson || personalHolidaysJson.trim() === ""
      );
      console.log(
        "Is URL:",
        personalHolidaysJson ? personalHolidaysJson.startsWith("http") : false
      );

      // Debug: testar a validação JSON diretamente na função
      try {
        const parsed = JSON.parse(personalHolidaysJson!);
        console.log("JSON parse in function should work:", parsed);
      } catch (e) {
        console.log("JSON parse error in function:", e);
      }

      const result = feriadosPersonalizadosDisponiveis();
      console.log("Result:", result);
      expect(result).toBe(true);
    });

    it("deve retornar false para valor vazio", () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = "";

      const result = feriadosPersonalizadosDisponiveis();
      expect(result).toBe(false);
    });

    it("deve retornar false para valor undefined", () => {
      delete process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON;

      const result = feriadosPersonalizadosDisponiveis();
      expect(result).toBe(false);
    });

    it("deve retornar false para valor inválido", () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = "invalid-value";

      const result = feriadosPersonalizadosDisponiveis();
      expect(result).toBe(false);
    });
  });

  describe("obterInfoFeriadosPersonalizados", () => {
    it("deve retornar info para URL válida", () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON =
        "https://api.exemplo.com/feriados.json";

      const result = obterInfoFeriadosPersonalizados();

      expect(result).toEqual({
        disponivel: true,
        quantidadeNacionais: 0,
        quantidadeEstaduais: 0,
        total: 0,
        estadosDisponiveis: [],
      });
    });

    it("deve retornar info para JSON válido", () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = JSON.stringify({
        nacionais: [
          {
            nome: "Dia da Empresa",
            data: "2025-03-15",
            observacoes: "Aniversário da empresa",
          },
        ],
        estaduais: {
          SP: [
            {
              nome: "Feriado SP",
              data: "2025-07-09",
              observacoes: "Feriado estadual",
            },
          ],
        },
      });

      const result = obterInfoFeriadosPersonalizados();

      expect(result).toEqual({
        disponivel: true,
        quantidadeNacionais: 1,
        quantidadeEstaduais: 1,
        total: 2,
        exemploNacional: {
          nome: "Dia da Empresa",
          data: "2025-03-15",
          observacoes: "Aniversário da empresa",
        },
        exemploEstadual: {
          nome: "Feriado SP",
          data: "2025-07-09",
          observacoes: "Feriado estadual",
        },
        estadosDisponiveis: ["SP"],
      });
    });

    it("deve retornar info vazia para valor inválido", () => {
      process.env.PERSONAL_LIST_OF_HOLLIDAYS_IN_JSON = "invalid-value";

      const result = obterInfoFeriadosPersonalizados();

      expect(result).toEqual({
        disponivel: false,
        quantidadeNacionais: 0,
        quantidadeEstaduais: 0,
        total: 0,
        estadosDisponiveis: [],
      });
    });
  });
});

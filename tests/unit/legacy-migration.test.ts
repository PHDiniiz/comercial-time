/**
 * Testes de Migração do Código Legado
 *
 * Estes testes validam que a migração do código legado para a nova arquitetura
 * está funcionando corretamente e mantém compatibilidade.
 */

import { describe, it, expect } from "@jest/globals";
import {
  HorarioComercialFactory,
  HorarioComercialUseCaseImpl,
  HorarioComercial,
} from "../../src/index";

// Configuração de horário comercial para testes
const horarioComercialTeste = {
  "0": { abertura: "09:00", fechamento: "18:00" }, // Domingo
  "1": { abertura: "08:00", fechamento: "18:00" }, // Segunda
  "2": { abertura: "08:00", fechamento: "18:00" }, // Terça
  "3": { abertura: "08:00", fechamento: "18:00" }, // Quarta
  "4": { abertura: "08:00", fechamento: "18:00" }, // Quinta
  "5": { abertura: "08:00", fechamento: "18:00" }, // Sexta
  "6": { abertura: "09:00", fechamento: "17:00" }, // Sábado
};

describe("Migração do Código Legado", () => {
  describe("HorarioComercialFactory", () => {
    it("deve criar instância com configuração completa", async () => {
      const factory = await HorarioComercialFactory.create({
        horarioInput: horarioComercialTeste,
        feriadosConfig: {
          location: "pt-br",
          nacionais: true,
          estaduais: ["SP"],
          fallbackToPtBr: true,
        },
      });

      expect(factory).toBeDefined();
      expect(factory.horarioComercial).toBeDefined();
      expect(factory.comercialTime).toBeDefined();
      expect(factory.useCase).toBeDefined();
      expect(factory.obterInfoFeriados).toBeDefined();
      expect(factory.obterEstadosDisponiveis).toBeDefined();
    });

    it("deve criar instância simplificada", () => {
      const factory = HorarioComercialFactory.createSimple(
        horarioComercialTeste,
        {
          location: "pt-br",
          nacionais: true,
        }
      );

      expect(factory).toBeDefined();
      expect(factory.openedNow).toBeDefined();
      expect(typeof factory.openedNow).toBe("boolean");
    });

    it("deve criar instância para Brasil", async () => {
      const factory = await HorarioComercialFactory.createParaBrasil(
        horarioComercialTeste,
        ["SP", "RJ"]
      );

      expect(factory).toBeDefined();
      expect(factory.horarioComercial).toBeDefined();
      expect(factory.comercialTime).toBeDefined();

      const infoFeriados = factory.obterInfoFeriados();
      expect(infoFeriados.localizacao).toBe("pt-br");
      expect(infoFeriados.nacionais).toBeGreaterThan(0);
    });

    it("deve criar instância para EUA", async () => {
      const factory = await HorarioComercialFactory.createParaEUA(
        horarioComercialTeste,
        ["CA", "NY"]
      );

      expect(factory).toBeDefined();
      expect(factory.horarioComercial).toBeDefined();
      expect(factory.comercialTime).toBeDefined();

      const infoFeriados = factory.obterInfoFeriados();
      expect(infoFeriados.localizacao).toBe("en-US");
    });

    it("deve criar instância para Portugal", async () => {
      const factory = await HorarioComercialFactory.createParaPortugal(
        horarioComercialTeste,
        ["LIS", "POR"]
      );

      expect(factory).toBeDefined();
      expect(factory.horarioComercial).toBeDefined();
      expect(factory.comercialTime).toBeDefined();

      const infoFeriados = factory.obterInfoFeriados();
      expect(infoFeriados.localizacao).toBe("pt-PT");
    });

    it("deve fornecer métodos utilitários", async () => {
      const factory = await HorarioComercialFactory.createParaBrasil(
        horarioComercialTeste
      );

      const infoFeriados = factory.obterInfoFeriados();
      expect(infoFeriados).toHaveProperty("total");
      expect(infoFeriados).toHaveProperty("nacionais");
      expect(infoFeriados).toHaveProperty("estaduais");
      expect(infoFeriados).toHaveProperty("localizacao");
      expect(infoFeriados).toHaveProperty("usandoPersonalizados");
      expect(infoFeriados).toHaveProperty("estadosDisponiveis");

      const estados = factory.obterEstadosDisponiveis();
      expect(Array.isArray(estados)).toBe(true);

      const estadoDisponivel = factory.estadoDisponivel("SP");
      expect(typeof estadoDisponivel).toBe("boolean");
    });
  });

  describe("HorarioComercialUseCaseImpl", () => {
    it("deve criar instância com configuração", async () => {
      const useCase = await HorarioComercialUseCaseImpl.create({
        horarioInput: horarioComercialTeste,
        feriadosConfig: {
          location: "pt-br",
          nacionais: true,
          estaduais: ["SP"],
          fallbackToPtBr: true,
        },
      });

      expect(useCase).toBeDefined();
      expect(useCase.verificarSeEstaAberto).toBeDefined();
      expect(useCase.obterProximaAbertura).toBeDefined();
      expect(useCase.obterProximoFechamento).toBeDefined();
      expect(useCase.adicionarMinutosUteis).toBeDefined();
      expect(useCase.obterMinutosRestantesHoje).toBeDefined();
      expect(useCase.obterHorarioConfigurado).toBeDefined();
      expect(useCase.obterStatusAtual).toBeDefined();
    });

    it("deve criar instância com método estático", async () => {
      const useCase = await HorarioComercialUseCaseImpl.createSimple(
        horarioComercialTeste,
        {
          location: "pt-br",
          nacionais: true,
        }
      );

      expect(useCase).toBeDefined();
      expect(useCase.verificarSeEstaAberto).toBeDefined();
      expect(useCase.obterStatusAtual).toBeDefined();
    });

    it("deve fornecer métodos de feriados", async () => {
      const useCase = await HorarioComercialUseCaseImpl.create({
        horarioInput: horarioComercialTeste,
        feriadosConfig: {
          location: "pt-br",
          nacionais: true,
          estaduais: ["SP"],
        },
      });

      const infoFeriados = useCase.obterInfoFeriados();
      expect(infoFeriados).toHaveProperty("total");
      expect(infoFeriados).toHaveProperty("nacionais");
      expect(infoFeriados).toHaveProperty("estaduais");
      expect(infoFeriados).toHaveProperty("localizacao");

      const estados = useCase.obterEstadosDisponiveis();
      expect(Array.isArray(estados)).toBe(true);

      const estadoDisponivel = useCase.estadoDisponivel("SP");
      expect(typeof estadoDisponivel).toBe("boolean");

      const feriadosNacionais = useCase.obterFeriadosNacionais();
      expect(Array.isArray(feriadosNacionais)).toBe(true);

      const feriadosEstaduais = useCase.obterFeriadosEstaduais("SP");
      expect(Array.isArray(feriadosEstaduais)).toBe(true);

      const localizacao = useCase.obterLocalizacaoUsada();
      expect(typeof localizacao).toBe("string");

      const usandoPersonalizados = useCase.estaUsandoFeriadosPersonalizados();
      expect(typeof usandoPersonalizados).toBe("boolean");

      const comercialTime = useCase.obterComercialTime();
      expect(comercialTime).toBeDefined();
    });

    it("deve manter compatibilidade com métodos básicos", async () => {
      const useCase = await HorarioComercialUseCaseImpl.createSimple(
        horarioComercialTeste
      );

      // Testar métodos básicos
      const estaAberto = useCase.verificarSeEstaAberto();
      expect(typeof estaAberto).toBe("boolean");

      const proximaAbertura = useCase.obterProximaAbertura();
      expect(proximaAbertura === null || proximaAbertura instanceof Date).toBe(
        true
      );

      const proximoFechamento = useCase.obterProximoFechamento();
      expect(
        proximoFechamento === null || proximoFechamento instanceof Date
      ).toBe(true);

      const minutosRestantes = useCase.obterMinutosRestantesHoje();
      expect(typeof minutosRestantes).toBe("number");
      expect(minutosRestantes).toBeGreaterThanOrEqual(0);

      const horarioConfigurado = useCase.obterHorarioConfigurado();
      expect(horarioConfigurado).toBeDefined();

      const statusAtual = useCase.obterStatusAtual();
      expect(typeof statusAtual).toBe("boolean");
    });
  });

  describe("Compatibilidade com Código Legado", () => {
    it("deve manter compatibilidade com HorarioComercial legado", () => {
      // Testar se a classe legado ainda funciona
      const legado = new HorarioComercial(horarioComercialTeste, []);

      expect(legado).toBeDefined();
      expect(legado.estaAberto).toBeDefined();
      expect(legado.proximaAbertura).toBeDefined();
      expect(legado.proximoFechamento).toBeDefined();
      expect(legado.adicionarMinutosUteis).toBeDefined();
      expect(legado.minutosRestantesHoje).toBeDefined();
      expect(legado.obterHorario).toBeDefined();
      expect(legado.openedNow).toBeDefined();
    });

    it("deve produzir resultados consistentes entre legado e moderno", () => {
      const legado = new HorarioComercial(horarioComercialTeste, []);
      const moderno = HorarioComercialFactory.createSimple(
        horarioComercialTeste
      );

      // Testar se os resultados são consistentes
      const dataTeste = new Date("2024-01-15T10:00:00"); // Segunda-feira 10:00

      const legadoAberto = legado.estaAberto(dataTeste);
      const modernoAberto = moderno.estaAberto(dataTeste);
      expect(legadoAberto).toBe(modernoAberto);

      const legadoProximaAbertura = legado.proximaAbertura(dataTeste);
      const modernoProximaAbertura = moderno.proximaAbertura(dataTeste);

      if (legadoProximaAbertura && modernoProximaAbertura) {
        expect(legadoProximaAbertura.getTime()).toBe(
          modernoProximaAbertura.getTime()
        );
      } else {
        expect(legadoProximaAbertura).toBe(modernoProximaAbertura);
      }
    });
  });

  describe("Funcionalidades Avançadas", () => {
    it("deve suportar múltiplos países", async () => {
      const brasil = await HorarioComercialFactory.createParaBrasil(
        horarioComercialTeste
      );
      const eua = await HorarioComercialFactory.createParaEUA(
        horarioComercialTeste
      );
      const portugal = await HorarioComercialFactory.createParaPortugal(
        horarioComercialTeste
      );

      expect(brasil.obterInfoFeriados().localizacao).toBe("pt-br");
      expect(eua.obterInfoFeriados().localizacao).toBe("en-US");
      expect(portugal.obterInfoFeriados().localizacao).toBe("pt-PT");
    });

    it("deve suportar feriados estaduais específicos", async () => {
      const factory = await HorarioComercialFactory.createParaBrasil(
        horarioComercialTeste,
        ["SP", "RJ"]
      );

      const estados = factory.obterEstadosDisponiveis();
      expect(estados.length).toBeGreaterThan(0);

      expect(factory.estadoDisponivel("SP")).toBe(true);
      expect(factory.estadoDisponivel("RJ")).toBe(true);
    });

    it("deve fornecer informações detalhadas sobre feriados", async () => {
      const factory = await HorarioComercialFactory.createParaBrasil(
        horarioComercialTeste,
        ["SP"]
      );

      const info = factory.obterInfoFeriados();
      expect(info.total).toBeGreaterThan(0);
      expect(info.nacionais).toBeGreaterThan(0);
      expect(info.estaduais).toBeGreaterThan(0);
      expect(info.localizacao).toBe("pt-br");
      expect(Array.isArray(info.estadosDisponiveis)).toBe(true);
    });
  });
});

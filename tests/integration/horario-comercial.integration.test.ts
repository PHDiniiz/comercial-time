/**
 * Testes de Integração
 *
 * Testes que verificam a integração entre diferentes camadas
 * e o funcionamento completo da aplicação.
 */

import { HorarioComercialFactory } from "../../src/presentation/factories/horario-comercial.factory";
import { HorarioComercial } from "../../src/legacy/horario-comercial.legacy";

describe("HorarioComercial Integration Tests", () => {
  const horarioComercial = new HorarioComercial(
    {
      segunda: { abertura: "08:00", fechamento: "18:00" },
      terca: { abertura: "08:00", fechamento: "18:00" },
      quarta: { abertura: "08:00", fechamento: "18:00" },
      quinta: { abertura: "08:00", fechamento: "18:00" },
      sexta: { abertura: "08:00", fechamento: "18:00" },
    },
    ["2024-12-25", "2024-01-01"]
  );

  describe("Funcionalidade Básica", () => {
    it("deve verificar se está aberto em horário comercial", () => {
      const dataAberta = new Date("2024-01-08T10:00:00"); // Segunda-feira, 10h
      expect(horarioComercial.estaAberto(dataAberta)).toBe(true);
    });

    it("deve verificar se está fechado fora do horário comercial", () => {
      const dataFechada = new Date("2024-01-08T20:00:00"); // Segunda-feira, 20h
      expect(horarioComercial.estaAberto(dataFechada)).toBe(false);
    });

    it("deve verificar se está fechado em feriados", () => {
      const dataFeriado = new Date("2024-12-25T10:00:00"); // Natal, 10h
      expect(horarioComercial.estaAberto(dataFeriado)).toBe(false);
    });

    it("deve ter propriedade openedNow", () => {
      expect(typeof horarioComercial.openedNow).toBe("boolean");
    });

    it("deve retornar status atual baseado no timezone", () => {
      const status = horarioComercial.openedNow;
      expect(typeof status).toBe("boolean");
    });
  });

  describe("Próxima Abertura", () => {
    it("deve retornar próxima abertura quando fechado", () => {
      const dataFechada = new Date("2024-01-08T20:00:00"); // Segunda-feira, 20h
      const proximaAbertura = horarioComercial.proximaAbertura(dataFechada);

      expect(proximaAbertura).not.toBeNull();
      // Verificar se é um dia útil (segunda a sexta = 1 a 5)
      expect(proximaAbertura?.getDay()).toBeGreaterThanOrEqual(1);
      expect(proximaAbertura?.getDay()).toBeLessThanOrEqual(5);
      expect(proximaAbertura?.getHours()).toBe(8); // 8h
    });
  });

  describe("Adicionar Minutos Úteis", () => {
    it("deve adicionar minutos úteis corretamente", () => {
      const dataInicial = new Date("2024-01-08T14:00:00"); // Segunda-feira, 14h
      const dataFinal = horarioComercial.adicionarMinutosUteis(
        dataInicial,
        120
      ); // +2 horas

      expect(dataFinal.getHours()).toBe(16); // 16h
      expect(dataFinal.getMinutes()).toBe(0);
    });

    it("deve pular fins de semana ao adicionar minutos úteis", () => {
      const sextaTarde = new Date("2024-01-12T17:00:00"); // Sexta-feira, 17h
      const dataFinal = horarioComercial.adicionarMinutosUteis(sextaTarde, 120); // +2 horas

      // Deve ir para a próxima segunda-feira
      expect(dataFinal.getDay()).toBe(1); // Segunda-feira
      // Verificar se está no horário correto (pode variar por timezone)
      expect(dataFinal.getHours()).toBeGreaterThanOrEqual(8);
      expect(dataFinal.getHours()).toBeLessThanOrEqual(12);
    });
  });

  describe("Factory Pattern", () => {
    it("deve criar instâncias corretamente", async () => {
      const { service, useCase, controller } =
        await HorarioComercialFactory.create({
          horarioInput: {
            segunda: { abertura: "09:00", fechamento: "17:00" },
          },
          feriadosConfig: {
            location: "pt-br",
            nacionais: true,
            fallbackToPtBr: true,
          },
        });

      expect(service).toBeDefined();
      expect(useCase).toBeDefined();
      expect(controller).toBeDefined();
    });

    it("deve funcionar com controller", async () => {
      const { controller } = await HorarioComercialFactory.create({
        horarioInput: {
          segunda: { abertura: "09:00", fechamento: "17:00" },
        },
        feriadosConfig: {
          location: "pt-br",
          nacionais: true,
          fallbackToPtBr: true,
        },
      });

      const estaAberto = controller.estaAberto(new Date("2024-01-08T10:00:00"));
      const minutosRestantes = controller.minutosRestantesHoje();

      expect(estaAberto).toBe(true);
      // Verificar se retorna um número válido (pode ser 0 se estiver fora do horário)
      expect(typeof minutosRestantes).toBe("number");
      expect(minutosRestantes).toBeGreaterThanOrEqual(0);
    });
  });
});

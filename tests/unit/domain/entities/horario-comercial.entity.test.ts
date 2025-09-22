/**
 * Testes Unitários - Domain Layer
 *
 * Testes para entidades e regras de negócio do domínio.
 */

import {
  DIAS_SEMANA,
  HORARIO_PADRAO,
  LIMITE_BUSCA_DIAS,
} from "../../../../src/domain/entities/horario-comercial.entity";

describe("HorarioComercial Entity", () => {
  describe("DIAS_SEMANA", () => {
    it("deve ter todos os dias da semana definidos", () => {
      expect(DIAS_SEMANA.DOMINGO).toBe(0);
      expect(DIAS_SEMANA.SEGUNDA).toBe(1);
      expect(DIAS_SEMANA.TERCA).toBe(2);
      expect(DIAS_SEMANA.QUARTA).toBe(3);
      expect(DIAS_SEMANA.QUINTA).toBe(4);
      expect(DIAS_SEMANA.SEXTA).toBe(5);
      expect(DIAS_SEMANA.SABADO).toBe(6);
    });
  });

  describe("HORARIO_PADRAO", () => {
    it("deve ter horários padrão definidos", () => {
      expect(HORARIO_PADRAO.ABERTURA).toBe("08:00");
      expect(HORARIO_PADRAO.FECHAMENTO).toBe("18:00");
    });
  });

  describe("LIMITE_BUSCA_DIAS", () => {
    it("deve ter limite de busca definido", () => {
      expect(LIMITE_BUSCA_DIAS).toBe(14);
      expect(LIMITE_BUSCA_DIAS).toBeGreaterThan(0);
      expect(LIMITE_BUSCA_DIAS).toBeLessThanOrEqual(30);
    });
  });
});

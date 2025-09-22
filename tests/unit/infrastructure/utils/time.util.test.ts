/**
 * Testes Unitários - Infrastructure Layer
 *
 * Testes para utilitários de tempo.
 */

import {
  horaParaMinutos,
  minutosParaHora,
  diaIndex,
  minutosDoDia,
  validarFormatoHora,
  formatarDataParaISO,
} from "../../../../src/infrastructure/utils/time.util";

describe("Time Utils", () => {
  describe("horaParaMinutos", () => {
    it("deve converter hora válida para minutos", () => {
      expect(horaParaMinutos("08:00")).toBe(480);
      expect(horaParaMinutos("12:30")).toBe(750);
      expect(horaParaMinutos("23:59")).toBe(1439);
      expect(horaParaMinutos("00:00")).toBe(0);
    });

    it("deve lançar erro para formato inválido", () => {
      expect(() => horaParaMinutos("25:00")).toThrow(
        "Formato de hora inválido"
      );
      expect(() => horaParaMinutos("12:60")).toThrow(
        "Formato de hora inválido"
      );
      expect(() => horaParaMinutos("abc")).toThrow("Formato de hora inválido");
    });
  });

  describe("minutosParaHora", () => {
    it("deve converter minutos para hora", () => {
      expect(minutosParaHora(480)).toBe("08:00");
      expect(minutosParaHora(750)).toBe("12:30");
      expect(minutosParaHora(1439)).toBe("23:59");
      expect(minutosParaHora(0)).toBe("00:00");
    });

    it("deve normalizar minutos negativos", () => {
      expect(minutosParaHora(-1)).toBe("23:59");
      expect(minutosParaHora(-60)).toBe("23:00");
    });

    it("deve normalizar minutos maiores que 24h", () => {
      expect(minutosParaHora(1440)).toBe("00:00");
      expect(minutosParaHora(1500)).toBe("01:00");
    });
  });

  describe("diaIndex", () => {
    it("deve retornar índice correto do dia", () => {
      const domingo = new Date("2024-01-08"); // Domingo (getDay() = 0)
      const segunda = new Date("2024-01-09"); // Segunda (getDay() = 1)
      const sabado = new Date("2024-01-14"); // Sábado (getDay() = 6)

      expect(diaIndex(domingo)).toBe(0);
      expect(diaIndex(segunda)).toBe(1);
      expect(diaIndex(sabado)).toBe(6);
    });
  });

  describe("minutosDoDia", () => {
    it("deve retornar minutos corretos do dia", () => {
      const data = new Date("2024-01-08T14:30:00");
      expect(minutosDoDia(data)).toBe(870); // 14 * 60 + 30
    });
  });

  describe("validarFormatoHora", () => {
    it("deve validar formatos corretos", () => {
      expect(validarFormatoHora("08:00")).toBe(true);
      expect(validarFormatoHora("23:59")).toBe(true);
      expect(validarFormatoHora("00:00")).toBe(true);
    });

    it("deve rejeitar formatos incorretos", () => {
      expect(validarFormatoHora("25:00")).toBe(false);
      expect(validarFormatoHora("12:60")).toBe(false);
      expect(validarFormatoHora("abc")).toBe(false);
    });
  });

  describe("formatarDataParaISO", () => {
    it("deve formatar data para ISO", () => {
      const data = new Date("2024-01-08T14:30:00");
      expect(formatarDataParaISO(data)).toBe("2024-01-08");
    });
  });
});

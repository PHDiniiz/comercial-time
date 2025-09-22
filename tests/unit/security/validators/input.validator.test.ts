/**
 * Testes Unitários - Security Layer
 *
 * Testes para validadores de entrada e segurança.
 */

import { InputValidator } from "../../../../src/security/validators/input.validator";

describe("InputValidator", () => {
  describe("validateHorarioInput", () => {
    it("deve validar horários corretos", () => {
      expect(InputValidator.validateHorarioInput("08:00")).toBe(true);
      expect(InputValidator.validateHorarioInput("23:59")).toBe(true);
      expect(InputValidator.validateHorarioInput("00:00")).toBe(true);
    });

    it("deve rejeitar horários com caracteres perigosos", () => {
      expect(InputValidator.validateHorarioInput("08:00<script>")).toBe(false);
      expect(InputValidator.validateHorarioInput("08:00'; DROP TABLE")).toBe(
        false
      );
      expect(InputValidator.validateHorarioInput("08:00&")).toBe(false);
    });

    it("deve rejeitar formatos inválidos", () => {
      expect(InputValidator.validateHorarioInput("25:00")).toBe(false);
      expect(InputValidator.validateHorarioInput("12:60")).toBe(false);
    });
  });

  describe("validateDiaInput", () => {
    it("deve validar nomes de dias corretos", () => {
      expect(InputValidator.validateDiaInput("segunda")).toBe(true);
      expect(InputValidator.validateDiaInput("segunda-feira")).toBe(true);
      expect(InputValidator.validateDiaInput("monday")).toBe(true);
    });

    it("deve rejeitar nomes com caracteres perigosos", () => {
      expect(InputValidator.validateDiaInput("segunda<script>")).toBe(false);
      expect(InputValidator.validateDiaInput("segunda'; DROP TABLE")).toBe(
        false
      );
      expect(InputValidator.validateDiaInput("segunda&")).toBe(false);
    });
  });

  describe("validateDateInput", () => {
    it("deve validar datas corretas", () => {
      expect(InputValidator.validateDateInput("2024-01-08")).toBe(true);
      expect(InputValidator.validateDateInput(new Date("2024-01-08"))).toBe(
        true
      );
    });

    it("deve rejeitar datas inválidas", () => {
      expect(InputValidator.validateDateInput("invalid-date")).toBe(false);
      expect(InputValidator.validateDateInput(new Date("invalid"))).toBe(false);
    });

    it("deve rejeitar datas muito antigas ou futuras", () => {
      expect(InputValidator.validateDateInput("1800-01-01")).toBe(false);
      expect(InputValidator.validateDateInput("2200-01-01")).toBe(false);
    });
  });

  describe("sanitizeString", () => {
    it("deve remover caracteres perigosos", () => {
      expect(InputValidator.sanitizeString("test<script>")).toBe("test");
      expect(InputValidator.sanitizeString("test'; DROP TABLE")).toBe(
        "test DROP TABLE"
      );
    });

    it("deve limitar tamanho da string", () => {
      const longString = "a".repeat(150);
      const result = InputValidator.sanitizeString(longString);
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });

  describe("validateFeriados", () => {
    it("deve validar array de feriados correto", () => {
      const feriados = ["2024-01-01", "2024-12-25"];
      expect(InputValidator.validateFeriados(feriados)).toBe(true);
    });

    it("deve rejeitar array muito grande", () => {
      const feriados = Array(1001).fill("2024-01-01");
      expect(InputValidator.validateFeriados(feriados)).toBe(false);
    });

    it("deve rejeitar formatos inválidos", () => {
      const feriados = ["invalid-date", "2024-13-01"];
      expect(InputValidator.validateFeriados(feriados)).toBe(false);
    });
  });
});

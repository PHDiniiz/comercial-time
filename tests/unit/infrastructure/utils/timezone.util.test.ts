/**
 * Unit Tests - Timezone Utilities
 */

import { describe, it, expect, beforeEach, vi } from "@jest/globals";
import {
  toCurrentTimezone,
  getTimezoneOffset,
  isValidTimezone,
  getNowInTimezone,
  formatDateInTimezone,
  getTimeInTimezone,
  getDateInTimezone,
  getDayOfWeekInTimezone,
  getDayNameInTimezone,
  createDateInTimezone,
  compareDatesInTimezone,
  isTodayInTimezone,
  isFutureInTimezone,
  isPastInTimezone,
} from "../../../src/infrastructure/utils/timezone.util";

describe("Timezone Utilities", () => {
  beforeEach(() => {
    // Mock timezone manager to use a consistent timezone for tests
    vi.spyOn(
      require("../../../src/config/timezone.config"),
      "getCurrentTimezone"
    ).mockReturnValue("America/Sao_Paulo");
  });

  describe("toCurrentTimezone", () => {
    it("should convert Date to current timezone", () => {
      const utcDate = new Date("2024-01-08T14:30:00Z");
      const converted = toCurrentTimezone(utcDate, "America/Sao_Paulo");

      expect(converted).toBeInstanceOf(Date);
      expect(Number.isNaN(converted.getTime())).toBe(false);
    });

    it("should return same date when no timezone provided", () => {
      const utcDate = new Date("2024-01-08T14:30:00Z");
      const converted = toCurrentTimezone(utcDate);

      expect(converted).toBeInstanceOf(Date);
      expect(Number.isNaN(converted.getTime())).toBe(false);
    });

    it("should handle invalid date gracefully", () => {
      const invalidDate = new Date("invalid-date");
      const converted = toCurrentTimezone(invalidDate, "America/Sao_Paulo");

      expect(converted).toBeInstanceOf(Date);
    });
  });

  describe("getTimezoneOffset", () => {
    it("should return offset for valid timezone", () => {
      const offset = getTimezoneOffset("America/Sao_Paulo");
      expect(typeof offset).toBe("number");
    });

    it("should return 0 for invalid timezone", () => {
      const offset = getTimezoneOffset("Invalid/Timezone");
      expect(offset).toBe(0);
    });
  });

  describe("isValidTimezone", () => {
    it("should return true for valid timezone", () => {
      expect(isValidTimezone("America/Sao_Paulo")).toBe(true);
      expect(isValidTimezone("Europe/London")).toBe(true);
      expect(isValidTimezone("UTC")).toBe(true);
    });

    it("should return false for invalid timezone", () => {
      expect(isValidTimezone("Invalid/Timezone")).toBe(false);
      expect(isValidTimezone("")).toBe(false);
    });
  });

  describe("getNowInTimezone", () => {
    it("should return current date in timezone", () => {
      const now = getNowInTimezone("America/Sao_Paulo");
      expect(now).toBeInstanceOf(Date);
      expect(Number.isNaN(now.getTime())).toBe(false);
    });
  });

  describe("formatDateInTimezone", () => {
    it("should format date in timezone", () => {
      const testDate = new Date("2024-01-08T14:30:00Z");
      const formatted = formatDateInTimezone(testDate, "America/Sao_Paulo");

      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2024");
    });

    it("should format date with custom options", () => {
      const testDate = new Date("2024-01-08T14:30:00Z");
      const formatted = formatDateInTimezone(testDate, "America/Sao_Paulo", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      expect(typeof formatted).toBe("string");
    });

    it("should handle invalid date gracefully", () => {
      const invalidDate = new Date("invalid-date");
      const formatted = formatDateInTimezone(invalidDate, "America/Sao_Paulo");

      expect(typeof formatted).toBe("string");
    });
  });

  describe("getTimeInTimezone", () => {
    it("should return time in timezone", () => {
      const time = getTimeInTimezone("America/Sao_Paulo");

      expect(typeof time).toBe("string");
      expect(time).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe("getDateInTimezone", () => {
    it("should return date in timezone", () => {
      const date = getDateInTimezone(
        "2024-01-08T14:30:00Z",
        "America/Sao_Paulo"
      );

      expect(typeof date).toBe("string");
      expect(date).toContain("2024");
    });
  });

  describe("getDayOfWeekInTimezone", () => {
    it("should return day of week in timezone", () => {
      const testDate = new Date("2024-01-08T14:30:00Z"); // Monday
      const dayOfWeek = getDayOfWeekInTimezone(testDate, "America/Sao_Paulo");

      expect(typeof dayOfWeek).toBe("number");
      expect(dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(dayOfWeek).toBeLessThanOrEqual(6);
    });
  });

  describe("getDayNameInTimezone", () => {
    it("should return day name in timezone", () => {
      const testDate = new Date("2024-01-08T14:30:00Z"); // Monday
      const dayName = getDayNameInTimezone(testDate, "America/Sao_Paulo");

      expect(typeof dayName).toBe("string");
      expect([
        "domingo",
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
      ]).toContain(dayName);
    });
  });

  describe("createDateInTimezone", () => {
    it("should create date in timezone", () => {
      const testDate = new Date("2024-01-08T14:30:00Z");
      const date = createDateInTimezone(testDate, "America/Sao_Paulo");

      expect(date).toBeInstanceOf(Date);
      expect(Number.isNaN(date.getTime())).toBe(false);
    });
  });

  describe("compareDatesInTimezone", () => {
    it("should compare dates in timezone", () => {
      const date1 = new Date("2024-01-08T14:30:00Z");
      const date2 = new Date("2024-01-08T15:30:00Z");

      const result = compareDatesInTimezone(date1, date2, "America/Sao_Paulo");
      expect(typeof result).toBe("number");
    });

    it("should return 0 for equal dates", () => {
      const date1 = new Date("2024-01-08T14:30:00Z");
      const date2 = new Date("2024-01-08T14:30:00Z");

      const result = compareDatesInTimezone(date1, date2, "America/Sao_Paulo");
      expect(result).toBe(0);
    });
  });

  describe("isTodayInTimezone", () => {
    it("should check if date is today in timezone", () => {
      const today = new Date();
      const result = isTodayInTimezone(today, "America/Sao_Paulo");

      expect(typeof result).toBe("boolean");
    });

    it("should return false for future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = isTodayInTimezone(futureDate, "America/Sao_Paulo");
      expect(result).toBe(false);
    });
  });

  describe("isFutureInTimezone", () => {
    it("should check if date is in future in timezone", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = isFutureInTimezone(futureDate, "America/Sao_Paulo");
      expect(result).toBe(true);
    });

    it("should return false for past date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = isFutureInTimezone(pastDate, "America/Sao_Paulo");
      expect(result).toBe(false);
    });
  });

  describe("isPastInTimezone", () => {
    it("should check if date is in past in timezone", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const result = isPastInTimezone(pastDate, "America/Sao_Paulo");
      expect(result).toBe(true);
    });

    it("should return false for future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const result = isPastInTimezone(futureDate, "America/Sao_Paulo");
      expect(result).toBe(false);
    });
  });
});

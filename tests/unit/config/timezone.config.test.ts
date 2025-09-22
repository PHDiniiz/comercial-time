/**
 * Unit Tests - Timezone Configuration
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  timezoneManager,
  getCurrentTimezone,
  setTimezone,
  getCurrentDate,
  formatDate,
  DEFAULT_TIMEZONE_CONFIG,
} from "../../../src/config/timezone.config";

describe("Timezone Configuration", () => {
  beforeEach(() => {
    // Reset timezone manager to default state
    timezoneManager.updateConfig(DEFAULT_TIMEZONE_CONFIG);
  });

  describe("DEFAULT_TIMEZONE_CONFIG", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_TIMEZONE_CONFIG.defaultTimezone).toBe("America/Sao_Paulo");
      expect(DEFAULT_TIMEZONE_CONFIG.fallbackTimezone).toBe("UTC");
      expect(DEFAULT_TIMEZONE_CONFIG.autoDetect).toBe(true);
    });
  });

  describe("timezoneManager", () => {
    it("should initialize with default timezone", () => {
      const timezone = timezoneManager.getCurrentTimezone();
      expect(timezone).toBe("America/Sao_Paulo");
    });

    it("should allow setting a valid timezone", () => {
      timezoneManager.setTimezone("America/New_York");
      expect(timezoneManager.getCurrentTimezone()).toBe("America/New_York");
    });

    it("should throw error for invalid timezone", () => {
      expect(() => {
        timezoneManager.setTimezone("Invalid/Timezone");
      }).toThrow("Timezone inválido: Invalid/Timezone");
    });

    it("should update configuration", () => {
      const newConfig = {
        defaultTimezone: "Europe/London",
        autoDetect: false,
      };

      timezoneManager.updateConfig(newConfig);
      const config = timezoneManager.getConfig();

      expect(config.defaultTimezone).toBe("Europe/London");
      expect(config.autoDetect).toBe(false);
      expect(config.fallbackTimezone).toBe("UTC"); // Should remain unchanged
    });

    it("should get current date in timezone", () => {
      const currentDate = timezoneManager.getCurrentDate();
      expect(currentDate).toBeInstanceOf(Date);
      expect(Number.isNaN(currentDate.getTime())).toBe(false);
    });

    it("should format date in timezone", () => {
      const testDate = new Date("2024-01-08T14:30:00Z");
      const formatted = timezoneManager.formatDate(testDate);

      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2024");
    });
  });

  describe("Utility Functions", () => {
    it("should get current timezone", () => {
      const timezone = getCurrentTimezone();
      expect(typeof timezone).toBe("string");
      expect(timezone).toBe("America/Sao_Paulo");
    });

    it("should set timezone", () => {
      setTimezone("America/New_York");
      expect(getCurrentTimezone()).toBe("America/New_York");
    });

    it("should get current date", () => {
      const currentDate = getCurrentDate();
      expect(currentDate).toBeInstanceOf(Date);
      expect(Number.isNaN(currentDate.getTime())).toBe(false);
    });

    it("should format date", () => {
      const testDate = new Date("2024-01-08T14:30:00Z");
      const formatted = formatDate(testDate);

      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2024");
    });
  });

  describe("Timezone Detection", () => {
    it("should use default timezone when autoDetect is disabled", () => {
      timezoneManager.updateConfig({
        autoDetect: false,
        defaultTimezone: "Europe/London",
      });
      const timezone = timezoneManager.getCurrentTimezone();

      expect(timezone).toBe("Europe/London");
    });

    it("should use default timezone when autoDetect is enabled", () => {
      timezoneManager.updateConfig({
        autoDetect: true,
        defaultTimezone: "America/New_York",
      });
      const timezone = timezoneManager.getCurrentTimezone();

      expect(timezone).toBe("America/New_York");
    });
  });

  describe("Environment Variable Integration", () => {
    it("should allow setTimezone without parameter to use default", () => {
      // Set timezone without parameter should use default
      setTimezone();

      expect(getCurrentTimezone()).toBe("America/Sao_Paulo");
    });

    it("should prioritize explicit timezone over default", () => {
      // Set explicit timezone should override default
      setTimezone("Asia/Tokyo");

      expect(getCurrentTimezone()).toBe("Asia/Tokyo");

      // Reset to default
      setTimezone("America/Sao_Paulo");
    });
  });
});

/**
 * Types & Constants Test Suite
 * - 타입 상수 정합성 검증
 * - 설정값 무결성 테스트
 */
import {
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  COLUMNS,
  PROJECT_COLORS,
  Status,
  Priority,
} from "@/lib/types";

describe("Types & Constants", () => {
  describe("STATUS_CONFIG", () => {
    it("should have all 3 statuses defined", () => {
      expect(Object.keys(STATUS_CONFIG)).toHaveLength(3);
      expect(STATUS_CONFIG).toHaveProperty("TODO");
      expect(STATUS_CONFIG).toHaveProperty("IN_PROGRESS");
      expect(STATUS_CONFIG).toHaveProperty("DONE");
    });

    it("each status should have label, color, and icon", () => {
      Object.values(STATUS_CONFIG).forEach((config) => {
        expect(config).toHaveProperty("label");
        expect(config).toHaveProperty("color");
        expect(config).toHaveProperty("icon");
        expect(config.label).toBeTruthy();
        expect(config.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it("should have unique colors for each status", () => {
      const colors = Object.values(STATUS_CONFIG).map((c) => c.color);
      expect(new Set(colors).size).toBe(colors.length);
    });
  });

  describe("PRIORITY_CONFIG", () => {
    it("should have all 3 priorities defined", () => {
      expect(Object.keys(PRIORITY_CONFIG)).toHaveLength(3);
      expect(PRIORITY_CONFIG).toHaveProperty("HIGH");
      expect(PRIORITY_CONFIG).toHaveProperty("MEDIUM");
      expect(PRIORITY_CONFIG).toHaveProperty("LOW");
    });

    it("each priority should have label, color, and bg", () => {
      Object.values(PRIORITY_CONFIG).forEach((config) => {
        expect(config).toHaveProperty("label");
        expect(config).toHaveProperty("color");
        expect(config).toHaveProperty("bg");
        expect(config.color).toMatch(/^#[0-9A-F]{6}$/i);
        expect(config.bg).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it("HIGH priority should have red color", () => {
      expect(PRIORITY_CONFIG.HIGH.color).toBe("#EF4444");
    });
  });

  describe("COLUMNS", () => {
    it("should have 3 columns in correct order", () => {
      expect(COLUMNS).toEqual(["TODO", "IN_PROGRESS", "DONE"]);
    });

    it("should match STATUS_CONFIG keys", () => {
      COLUMNS.forEach((col) => {
        expect(STATUS_CONFIG).toHaveProperty(col);
      });
    });
  });

  describe("PROJECT_COLORS", () => {
    it("should have 8 preset colors", () => {
      expect(PROJECT_COLORS).toHaveLength(8);
    });

    it("all colors should be valid hex", () => {
      PROJECT_COLORS.forEach((color) => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it("should have unique colors", () => {
      expect(new Set(PROJECT_COLORS).size).toBe(PROJECT_COLORS.length);
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  AssetStateMachine,
  DomainError,
} from "../src/modules/asset/domain/AssetStateMachine.js";
import { AssetStatus, MovementType } from "@veylix/types";

describe("AssetStateMachine (Domain Invariants)", () => {
  describe("canAssign", () => {
    it("should allow assignment when asset is AVAILABLE and unassigned", () => {
      expect(AssetStateMachine.canAssign(AssetStatus.AVAILABLE, false)).toBe(
        true,
      );
    });

    it("should throw DomainError when asset already has an assigned custodian (INV-001)", () => {
      expect(() =>
        AssetStateMachine.canAssign(AssetStatus.AVAILABLE, true),
      ).toThrow(DomainError);
    });

    it("should throw DomainError when asset is RETIRED (INV-002)", () => {
      expect(() =>
        AssetStateMachine.canAssign(AssetStatus.RETIRED, false),
      ).toThrow(DomainError);
    });

    it("should throw DomainError when asset is LOST (INV-002)", () => {
      expect(() =>
        AssetStateMachine.canAssign(AssetStatus.LOST, false),
      ).toThrow(DomainError);
    });

    it("should throw DomainError when asset is in MAINTENANCE (INV-003)", () => {
      expect(() =>
        AssetStateMachine.canAssign(AssetStatus.MAINTENANCE, false),
      ).toThrow(DomainError);
    });
  });

  describe("canTransfer", () => {
    it("should allow transfer when valid and between different employees", () => {
      expect(
        AssetStateMachine.canTransfer(
          AssetStatus.IN_USE,
          "emp_1",
          "emp_1",
          "emp_2",
        ),
      ).toBe(true);
    });

    it("should throw DomainError when transferring to the same employee", () => {
      expect(() =>
        AssetStateMachine.canTransfer(
          AssetStatus.IN_USE,
          "emp_1",
          "emp_1",
          "emp_1",
        ),
      ).toThrow("Asset is already assigned to the target employee.");
    });

    it("should throw DomainError when asset is not assigned to fromEmployee", () => {
      expect(() =>
        AssetStateMachine.canTransfer(
          AssetStatus.IN_USE,
          "emp_other",
          "emp_1",
          "emp_2",
        ),
      ).toThrow("Asset is not currently assigned to the specified employee.");
    });

    it("should throw DomainError when asset is RETIRED (INV-002)", () => {
      expect(() =>
        AssetStateMachine.canTransfer(
          AssetStatus.RETIRED,
          "emp_1",
          "emp_1",
          "emp_2",
        ),
      ).toThrow(DomainError);
    });

    it("should throw DomainError when asset is LOST (INV-002)", () => {
      expect(() =>
        AssetStateMachine.canTransfer(
          AssetStatus.LOST,
          "emp_1",
          "emp_1",
          "emp_2",
        ),
      ).toThrow(DomainError);
    });

    it("should throw DomainError when asset is in MAINTENANCE (INV-003)", () => {
      expect(() =>
        AssetStateMachine.canTransfer(
          AssetStatus.MAINTENANCE,
          "emp_1",
          "emp_1",
          "emp_2",
        ),
      ).toThrow(DomainError);
    });
  });

  describe("canReturn", () => {
    it("should allow return when asset is IN_USE and has an assigned custodian", () => {
      expect(AssetStateMachine.canReturn(AssetStatus.IN_USE, "emp_1")).toBe(
        true,
      );
    });

    it("should throw DomainError when asset has no assigned custodian", () => {
      expect(() =>
        AssetStateMachine.canReturn(AssetStatus.AVAILABLE, null),
      ).toThrow("Asset does not have an assigned custodian to return.");
    });

    it("should throw DomainError when asset is in MAINTENANCE (INV-003)", () => {
      expect(() =>
        AssetStateMachine.canReturn(AssetStatus.MAINTENANCE, "emp_1"),
      ).toThrow(DomainError);
    });

    it("should throw DomainError when asset is RETIRED (INV-002)", () => {
      expect(() =>
        AssetStateMachine.canReturn(AssetStatus.RETIRED, "emp_1"),
      ).toThrow(DomainError);
    });
  });

  describe("canRetire", () => {
    it("should allow retiring an AVAILABLE or IN_USE asset", () => {
      expect(AssetStateMachine.canRetire(AssetStatus.AVAILABLE)).toBe(true);
      expect(AssetStateMachine.canRetire(AssetStatus.IN_USE)).toBe(true);
    });

    it("should throw DomainError when asset is already RETIRED", () => {
      expect(() => AssetStateMachine.canRetire(AssetStatus.RETIRED)).toThrow(
        "Asset is already retired.",
      );
    });

    it("should throw DomainError when asset is in MAINTENANCE (INV-006)", () => {
      expect(() =>
        AssetStateMachine.canRetire(AssetStatus.MAINTENANCE),
      ).toThrow("Cannot retire an asset that is currently in maintenance.");
    });
  });

  describe("canStartMaintenance", () => {
    it("should allow starting maintenance on AVAILABLE or IN_USE asset", () => {
      expect(AssetStateMachine.canStartMaintenance(AssetStatus.AVAILABLE)).toBe(
        true,
      );
      expect(AssetStateMachine.canStartMaintenance(AssetStatus.IN_USE)).toBe(
        true,
      );
    });

    it("should throw DomainError when asset is already in MAINTENANCE", () => {
      expect(() =>
        AssetStateMachine.canStartMaintenance(AssetStatus.MAINTENANCE),
      ).toThrow("Asset is already in maintenance.");
    });

    it("should throw DomainError when asset is RETIRED or LOST", () => {
      expect(() =>
        AssetStateMachine.canStartMaintenance(AssetStatus.RETIRED),
      ).toThrow(DomainError);
      expect(() =>
        AssetStateMachine.canStartMaintenance(AssetStatus.LOST),
      ).toThrow(DomainError);
    });
  });

  describe("getNextStatusForMovement", () => {
    it("should transition correctly for all movement types", () => {
      expect(
        AssetStateMachine.getNextStatusForMovement(MovementType.ASSIGNMENT),
      ).toBe(AssetStatus.IN_USE);
      expect(
        AssetStateMachine.getNextStatusForMovement(MovementType.TRANSFER),
      ).toBe(AssetStatus.IN_USE);
      expect(
        AssetStateMachine.getNextStatusForMovement(MovementType.RETURN),
      ).toBe(AssetStatus.AVAILABLE);
      expect(
        AssetStateMachine.getNextStatusForMovement(
          MovementType.LOCATION_CHANGE,
        ),
      ).toBe(AssetStatus.AVAILABLE);
      expect(
        AssetStateMachine.getNextStatusForMovement(MovementType.RETIREMENT),
      ).toBe(AssetStatus.RETIRED);
    });
  });
});

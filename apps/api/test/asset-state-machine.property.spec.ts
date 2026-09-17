import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  AssetStateMachine,
  DomainError,
} from "../src/modules/asset/domain/AssetStateMachine.js";
import { AssetStatus, MovementType, MaintenanceStatus } from "@veylix/types";

describe("AssetStateMachine Property-Based Testing (fast-check)", () => {
  const allAssetStatuses = Object.values(AssetStatus);
  const allMovementTypes = Object.values(MovementType);
  const allMaintenanceStatuses = Object.values(MaintenanceStatus);

  const assetStatusArbitrary = fc.constantFrom(...allAssetStatuses);
  const movementTypeArbitrary = fc.constantFrom(...allMovementTypes);
  const maintenanceStatusArbitrary = fc.constantFrom(...allMaintenanceStatuses);
  const employeeIdArbitrary = fc.string({ minLength: 1, maxLength: 50 });

  describe("INV-001: Maximum one assigned custodian", () => {
    it("property: canAssign MUST always reject if asset already has an assigned custodian", () => {
      fc.assert(
        fc.property(assetStatusArbitrary, (status) => {
          expect(() => AssetStateMachine.canAssign(status, true)).toThrow(
            DomainError,
          );
        }),
        { numRuns: 100 },
      );
    });

    it("property: canAssign rejects forbidden statuses (RETIRED, LOST, MAINTENANCE) regardless of assignee", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            AssetStatus.RETIRED,
            AssetStatus.LOST,
            AssetStatus.MAINTENANCE,
          ),
          fc.boolean(),
          (status, hasAssignee) => {
            expect(() =>
              AssetStateMachine.canAssign(status, hasAssignee),
            ).toThrow(DomainError);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("property: canAssign allows assignment when AVAILABLE and unassigned", () => {
      expect(AssetStateMachine.canAssign(AssetStatus.AVAILABLE, false)).toBe(
        true,
      );
    });
  });

  describe("INV-002: Terminal or Lost Assets cannot be transferred, assigned, or returned", () => {
    const terminalOrLostArbitrary = fc.constantFrom(
      AssetStatus.RETIRED,
      AssetStatus.LOST,
    );

    it("property: RETIRED or LOST assets can never be assigned, transferred, returned, or maintained", () => {
      fc.assert(
        fc.property(
          terminalOrLostArbitrary,
          fc.boolean(),
          employeeIdArbitrary,
          employeeIdArbitrary,
          (status, hasAssignee, empA, empB) => {
            // canAssign
            expect(() =>
              AssetStateMachine.canAssign(status, hasAssignee),
            ).toThrow(DomainError);

            // canTransfer
            expect(() =>
              AssetStateMachine.canTransfer(status, empA, empA, empB),
            ).toThrow(DomainError);

            // canReturn
            expect(() => AssetStateMachine.canReturn(status, empA)).toThrow(
              DomainError,
            );

            // canStartMaintenance
            expect(() => AssetStateMachine.canStartMaintenance(status)).toThrow(
              DomainError,
            );
          },
        ),
        { numRuns: 150 },
      );
    });
  });

  describe("INV-003: Assets in MAINTENANCE status cannot undergo custody movements or retirement", () => {
    it("property: MAINTENANCE assets reject canAssign, canTransfer, canReturn, canRetire, canStartMaintenance", () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          employeeIdArbitrary,
          employeeIdArbitrary,
          (hasAssignee, empA, empB) => {
            const status = AssetStatus.MAINTENANCE;

            expect(() =>
              AssetStateMachine.canAssign(status, hasAssignee),
            ).toThrow(DomainError);
            expect(() =>
              AssetStateMachine.canTransfer(status, empA, empA, empB),
            ).toThrow(DomainError);
            expect(() => AssetStateMachine.canReturn(status, empA)).toThrow(
              DomainError,
            );
            expect(() => AssetStateMachine.canRetire(status)).toThrow(
              DomainError,
            );
            expect(() => AssetStateMachine.canStartMaintenance(status)).toThrow(
              DomainError,
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe("canTransfer Invariants and Identity Rules", () => {
    it("property: transfer to the exact same employee MUST always throw DomainError", () => {
      fc.assert(
        fc.property(
          assetStatusArbitrary,
          employeeIdArbitrary,
          (status, empId) => {
            expect(() =>
              AssetStateMachine.canTransfer(status, empId, empId, empId),
            ).toThrow(DomainError);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("property: transfer when fromEmployee does not match currentAssignee MUST always throw DomainError", () => {
      fc.assert(
        fc.property(
          assetStatusArbitrary,
          employeeIdArbitrary,
          employeeIdArbitrary,
          employeeIdArbitrary,
          (status, currentAssignee, fromEmp, toEmp) => {
            fc.pre(currentAssignee !== fromEmp);

            expect(() =>
              AssetStateMachine.canTransfer(
                status,
                currentAssignee,
                fromEmp,
                toEmp,
              ),
            ).toThrow(DomainError);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("property: valid transfer from current custodian to a distinct employee in IN_USE status succeeds", () => {
      fc.assert(
        fc.property(
          employeeIdArbitrary,
          employeeIdArbitrary,
          (fromEmp, toEmp) => {
            fc.pre(fromEmp !== toEmp);

            const result = AssetStateMachine.canTransfer(
              AssetStatus.IN_USE,
              fromEmp,
              fromEmp,
              toEmp,
            );
            expect(result).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe("canReturn Invariants", () => {
    it("property: canReturn MUST reject when asset has no current assignee", () => {
      fc.assert(
        fc.property(assetStatusArbitrary, (status) => {
          expect(() => AssetStateMachine.canReturn(status, null)).toThrow(
            DomainError,
          );
        }),
        { numRuns: 100 },
      );
    });

    it("property: canReturn succeeds for IN_USE asset with valid assignee", () => {
      fc.assert(
        fc.property(employeeIdArbitrary, (assigneeId) => {
          expect(
            AssetStateMachine.canReturn(AssetStatus.IN_USE, assigneeId),
          ).toBe(true);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe("canRetire Invariants", () => {
    it("property: already RETIRED assets can never be retired again", () => {
      expect(() => AssetStateMachine.canRetire(AssetStatus.RETIRED)).toThrow(
        DomainError,
      );
    });

    it("property: AVAILABLE and IN_USE assets can always be safely retired", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(AssetStatus.AVAILABLE, AssetStatus.IN_USE),
          (status) => {
            expect(AssetStateMachine.canRetire(status)).toBe(true);
          },
        ),
        { numRuns: 50 },
      );
    });
  });

  describe("INV-006: Maintenance Ticket and State Restoration", () => {
    it("property: canCloseMaintenance only succeeds when asset is MAINTENANCE and ticket is OPEN or IN_PROGRESS", () => {
      fc.assert(
        fc.property(
          assetStatusArbitrary,
          maintenanceStatusArbitrary,
          (assetStatus, ticketStatus) => {
            const isAssetInMaintenance =
              assetStatus === AssetStatus.MAINTENANCE;
            const isTicketClosable =
              ticketStatus === MaintenanceStatus.OPEN ||
              ticketStatus === MaintenanceStatus.IN_PROGRESS;

            if (isAssetInMaintenance && isTicketClosable) {
              expect(
                AssetStateMachine.canCloseMaintenance(
                  assetStatus,
                  ticketStatus,
                ),
              ).toBe(true);
            } else {
              expect(() =>
                AssetStateMachine.canCloseMaintenance(
                  assetStatus,
                  ticketStatus,
                ),
              ).toThrow(DomainError);
            }
          },
        ),
        { numRuns: 200 },
      );
    });

    it("property: getRestoredStatusAfterMaintenance restores IN_USE iff hasAssignee is true, else AVAILABLE", () => {
      fc.assert(
        fc.property(fc.boolean(), (hasAssignee) => {
          const restored =
            AssetStateMachine.getRestoredStatusAfterMaintenance(hasAssignee);
          if (hasAssignee) {
            expect(restored).toBe(AssetStatus.IN_USE);
          } else {
            expect(restored).toBe(AssetStatus.AVAILABLE);
          }
        }),
        { numRuns: 50 },
      );
    });
  });

  describe("getNextStatusForMovement Exhaustive Determinism", () => {
    it("property: every movement type maps deterministically to a valid AssetStatus", () => {
      fc.assert(
        fc.property(movementTypeArbitrary, (movType) => {
          const nextStatus =
            AssetStateMachine.getNextStatusForMovement(movType);
          expect(allAssetStatuses).toContain(nextStatus);

          switch (movType) {
            case MovementType.ASSIGNMENT:
            case MovementType.TRANSFER:
              expect(nextStatus).toBe(AssetStatus.IN_USE);
              break;
            case MovementType.RETURN:
            case MovementType.LOCATION_CHANGE:
              expect(nextStatus).toBe(AssetStatus.AVAILABLE);
              break;
            case MovementType.RETIREMENT:
              expect(nextStatus).toBe(AssetStatus.RETIRED);
              break;
          }
        }),
        { numRuns: 100 },
      );
    });
  });
});

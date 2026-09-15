import { AssetStatus, MovementType } from "@veylix/types";

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class AssetStateMachine {
  /**
   * Validates if an asset can be assigned to an employee.
   * Enforces INV-001, INV-002, INV-003.
   */
  static canAssign(
    currentStatus: AssetStatus,
    hasCurrentAssignee: boolean,
  ): boolean {
    if (
      currentStatus === AssetStatus.RETIRED ||
      currentStatus === AssetStatus.LOST
    ) {
      throw new DomainError(`Cannot assign a ${currentStatus} asset.`);
    }
    if (currentStatus === AssetStatus.MAINTENANCE) {
      throw new DomainError(
        "Cannot assign an asset that is currently in maintenance.",
      );
    }
    if (hasCurrentAssignee) {
      throw new DomainError(
        "Asset already has an assigned custodian. Transfer or return it first.",
      );
    }
    return true;
  }

  /**
   * Validates if an asset can be transferred from one employee to another.
   * Enforces INV-002, INV-003.
   */
  static canTransfer(
    currentStatus: AssetStatus,
    currentAssigneeId: string | null,
    fromEmployeeId: string,
    toEmployeeId: string,
  ): boolean {
    if (
      currentStatus === AssetStatus.RETIRED ||
      currentStatus === AssetStatus.LOST
    ) {
      throw new DomainError(`Cannot transfer a ${currentStatus} asset.`);
    }
    if (currentStatus === AssetStatus.MAINTENANCE) {
      throw new DomainError(
        "Cannot transfer an asset that is currently in maintenance.",
      );
    }
    if (currentAssigneeId !== fromEmployeeId) {
      throw new DomainError(
        "Asset is not currently assigned to the specified employee.",
      );
    }
    if (fromEmployeeId === toEmployeeId) {
      throw new DomainError(
        "Asset is already assigned to the target employee.",
      );
    }
    return true;
  }

  /**
   * Validates if an asset can be returned from an employee custodian.
   * Enforces INV-002, INV-003.
   */
  static canReturn(
    currentStatus: AssetStatus,
    currentAssigneeId: string | null,
  ): boolean {
    if (
      currentStatus === AssetStatus.RETIRED ||
      currentStatus === AssetStatus.LOST
    ) {
      throw new DomainError(`Cannot return a ${currentStatus} asset.`);
    }
    if (currentStatus === AssetStatus.MAINTENANCE) {
      throw new DomainError(
        "Cannot return an asset that is currently in maintenance.",
      );
    }
    if (!currentAssigneeId) {
      throw new DomainError(
        "Asset does not have an assigned custodian to return.",
      );
    }
    return true;
  }

  /**
   * Validates if an asset can be retired.
   * Enforces INV-002, INV-003.
   */
  static canRetire(currentStatus: AssetStatus): boolean {
    if (currentStatus === AssetStatus.RETIRED) {
      throw new DomainError("Asset is already retired.");
    }
    if (currentStatus === AssetStatus.MAINTENANCE) {
      throw new DomainError(
        "Cannot retire an asset that is currently in maintenance. Resolve maintenance first.",
      );
    }
    return true;
  }

  /**
   * Validates if an asset can be sent to maintenance.
   */
  static canStartMaintenance(currentStatus: AssetStatus): boolean {
    if (
      currentStatus === AssetStatus.RETIRED ||
      currentStatus === AssetStatus.LOST
    ) {
      throw new DomainError(
        `Cannot perform maintenance on a ${currentStatus} asset.`,
      );
    }
    if (currentStatus === AssetStatus.MAINTENANCE) {
      throw new DomainError("Asset is already in maintenance.");
    }
    return true;
  }

  /**
   * Determines the new status based on the operation and previous state.
   */
  static getNextStatusForMovement(movementType: MovementType): AssetStatus {
    switch (movementType) {
      case MovementType.ASSIGNMENT:
      case MovementType.TRANSFER:
        return AssetStatus.IN_USE;
      case MovementType.RETURN:
      case MovementType.LOCATION_CHANGE:
        return AssetStatus.AVAILABLE;
      case MovementType.RETIREMENT:
        return AssetStatus.RETIRED;
      default:
        throw new DomainError("Unknown movement type");
    }
  }
}

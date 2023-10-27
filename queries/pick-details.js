/**
 * Get subinventory details
 * @param {*} inventoryOrgId
 * @param {*} soLineId
 * @returns subinventory code, source location
 */
const SourceSubInventoryDetails = (inventoryOrgId, soLineId) => {
  return `SELECT  SUBINVENTORY_CODE sub_inventory,(SELECT    segment1
                || '.'
                || segment2
                || '.'
                || segment3
                || '.'
                || segment4
                || '.'
                || segment5
                || '.'
                || segment6
                || '.'
                || segment7
                || '.'
                || segment8
                || '.'
                || segment9
                || '.'
                || segment10   
        FROM MTL_ITEM_LOCATIONS
        WHERE inventory_location_id = mtt.locator_id) SOURCE_LOC
        FROM mtl_material_transactions_temp mtt
        WHERE ORGANIZATION_ID = ${inventoryOrgId} AND trx_source_line_id = ${soLineId}
            `;
};

/**
 * Detsination Sub Inventory Details
 * @param {*} inventoryOrgId
 * @returns
 */
const DestinationSubInventoryDetails = (inventoryOrgId) => {
  return `SELECT SECONDARY_INVENTORY_NAME sub_inventory
      FROM MTL_SECONDARY_INVENTORIES
     WHERE ORGANIZATION_ID = ${inventoryOrgId}`;
};

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} subinventory
 * @param {*} palletVal
 * @returns List of Pallets available or searched Pallet Value
 */
const PalleteLOV = (inventoryOrgId, subinventory, palletVal) => {
  return `
  SELECT DISTINCT SEGMENT1 PALLET
  FROM MTL_ITEM_LOCATIONS
 WHERE ORGANIZATION_ID = ${inventoryOrgId}
   AND UPPER(SUBINVENTORY_CODE) = UPPER('${subinventory}')
   AND SEGMENT1 LIKE NVL('%'|| ${palletVal} || '%',SEGMENT1)`;
};

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} subinventory
 * @param {*} palletVal
 * @param {*} cageVal
 * @returns Cage List available or searched cage value
 */
const CageLOV = (inventoryOrgId, subinventory, palletVal, cageVal) => {
  return ` SELECT DISTINCT SEGMENT2 CAGE
    FROM MTL_ITEM_LOCATIONS
   WHERE ORGANIZATION_ID = ${inventoryOrgId}
     AND UPPER(SUBINVENTORY_CODE) = UPPER('${subinventory}')
     AND SEGMENT1 = ${palletVal}
     AND SEGMENT2 LIKE NVL('%'|| ${cageVal} || '%',SEGMENT2)`;
};

const ToteLOV = (inventoryOrgId, subinventory, palletVal, cageVal, toteVal) => {
  return ` SELECT DISTINCT SEGMENT3 TOTE
    FROM MTL_ITEM_LOCATIONS
   WHERE ORGANIZATION_ID = ${inventoryOrgId}
     AND UPPER(SUBINVENTORY_CODE) = UPPER('${subinventory}')
     AND SEGMENT1 = ${palletVal}
     AND SEGMENT2 = ${cageVal}
     AND SEGMENT3 LIKE NVL('%'|| ${toteVal} || '%',SEGMENT3)`;
};

const GetLinesCountBasedOnSO = (inventoryOrgId, soNumber) => {
  return `select count(SOURCE_Line_NUMBER) Lines,sum(REQUESTED_QUANTITY) UNITS
    from   WSH_DELIVERABLES_V    where SOURCE_HEADER_NUMBER = ${soNumber} and organization_id = ${inventoryOrgId}`;
};

module.exports = {
  SourceSubInventoryDetails,
  DestinationSubInventoryDetails,
  PalleteLOV,
  CageLOV,
  ToteLOV,
  GetLinesCountBasedOnSO,
};

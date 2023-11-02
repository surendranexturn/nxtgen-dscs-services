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
const PalleteLOV = (inventoryOrgCode, palletVal) => {
      return `
  SELECT MEANING PALLET,ATTRIBUTE2 SUBINVENTORY_CODE
           FROM FND_LOOKUP_VALUES
          WHERE LOOKUP_TYPE = 'AMZ_STOCK_LOCATORS'
            AND ATTRIBUTE1 = '${inventoryOrgCode}'
            AND MEANING =  NVL('${palletVal}',MEANING)`;
};

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} subinventory
 * @param {*} palletVal
 * @param {*} cageVal
 * @returns Cage List available or searched cage value
 */
const CageLOV = (inventoryOrgCode, palletVal, cageVal) => {
      return `SELECT DESCRIPTION CAGE
  FROM FND_LOOKUP_VALUES
 WHERE LOOKUP_TYPE = 'AMZ_STOCK_LOCATORS'
   AND ATTRIBUTE1 = '${inventoryOrgCode}'
   AND DESCRIPTION = NVL('${palletVal}',DESCRIPTION)
   AND MEANING = NVL('${cageVal}',MEANING)`;
};

const ToteLOV = (inventoryOrgCode, palletVal, cageVal, toteVal) => {
      return ` SELECT TAG TOTE
  FROM FND_LOOKUP_VALUES
 WHERE LOOKUP_TYPE = 'AMZ_STOCK_LOCATORS'
   AND ATTRIBUTE1 = '${inventoryOrgCode}'
   AND MEANING = NVL('${palletVal}',MEANING)
   AND DESCRIPTION = NVL('${cageVal}',DESCRIPTION)
   and TAG = NVL('${toteVal}',TAG)`;
};

const PickupLookupPalletCageTote = (inventoryOrgCode, palletVal, cageVal, toteVal) => {
      return ` SELECT DESCRIPTION CAGE, TAG TOTE, MEANING PALLET,ATTRIBUTE2 SUBINVENTORY_CODE
  FROM FND_LOOKUP_VALUES
 WHERE LOOKUP_TYPE = 'AMZ_STOCK_LOCATORS'
   AND ATTRIBUTE1 = '${inventoryOrgCode}'
   ${palletVal ? `AND MEANING = NVL('${palletVal}',MEANING)` : ``}
   ${cageVal ? `AND DESCRIPTION = NVL('${cageVal}',DESCRIPTION)` : ``}
   ${toteVal ? `and TAG = NVL('${toteVal}',TAG)` : ``}`;
};


const GetLinesCountBasedOnSO = (inventoryOrgId, soNumber) => {
      return `select count(SOURCE_Line_NUMBER) Lines,sum(REQUESTED_QUANTITY) UNITS
    from   WSH_DELIVERABLES_V    where SOURCE_HEADER_NUMBER = ${soNumber} and organization_id = ${inventoryOrgId}`;
};

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} soNumber
 * @returns
 */
const GetSoLinesDetails = (inventoryOrgId, soNumber) => {
      return `SELECT  request_number,SOURCE_HEADER_NUMBER ORDER_NUMBER,
                SOURCE_LINE_NUMBER SO_LINE,SOURCE_LINE_ID,mv.inventory_item_id,
              XXMB_UTILITY_PKG.ITEM_NUMBER (mv.inventory_item_id,mv.organization_id) ITEM,
              XXMB_UTILITY_PKG.ITEM_DESC (mv.inventory_item_id,mv.organization_id) DESCRIPTION,
                          XXMB_UTILITY_PKG.ITEM_SERIAL (mv.inventory_item_id,mv.organization_id) ITEM_TYPE,
              -- XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WV.DELIVERY_ID,mv.ORGANIZATION_ID) ITEM_CATEGORY,
              --XXMB_UTILITY_PKG.ITEM_ONHAND(mv.inventory_item_id,mv.organization_id) ONHAND_QTY,
              QUANTITY REQUESTED_QUANTITY, (CASE WHEN mv.QUANTITY_DELIVERED IS  NULL THEN
                    mv.QUANTITY ELSE (mv.QUANTITY- mv.QUANTITY_DELIVERED)END) REMAINING_QUANTITY
              ,UOM_CODE UOM   
              FROM MTL_TXN_REQUEST_LINES_V mv,WSH_DELIVERABLES_V wv--,MTL_MATERIAL_TRANSACTIONS_TEMP mt
              WHERE     mv.organization_id = wv.organization_id
                    AND TXN_SOURCE_LINE_DETAIL_ID = DELIVERY_LINE_ID
                  AND mv.organization_id = ${inventoryOrgId}
                  AND wv.SOURCE_HEADER_NUMBER = ${soNumber}
                  AND -1 = -1
              AND (    mv.move_order_type = 3
                        AND mv.line_status IN (3, 7, 9))
              ORDER BY SOURCE_LINE_NUMBER`;
};

/**
 * @param {*} inventoryOrgId
 * @param {*} deliveryId
 * @returns
 */
const UpdateAutoPopulateFullPickQty = (inventoryOrgId, deliveryId) => {
      return `
  update
      mtl_material_transactions_temp
set
      TRANSACTION_QUANTITY = (
            select
                  quantity
            from
                  MTL_TXN_REQUEST_LINES_V
            where
                  line_id = move_order_line_id
      )
where
      organization_id = ${inventoryOrgId}
      AND move_order_line_id in (
            select
                  line_id
            from
                  MTL_TXN_REQUEST_LINES_V mv,
                  WSH_DELIVERABLES_V wv
            WHERE
                  mv.organization_id = wv.organization_id
                  AND TXN_SOURCE_LINE_DETAIL_ID = DELIVERY_LINE_ID
                  AND mv.organization_id = ${inventoryOrgId}
                  AND wv.delivery_id = ${deliveryId}
                  AND -1 = -1
                  AND (
                        mv.move_order_type = 3
                        AND mv.line_status IN (3, 7, 9)
                  )
      )
  `
};

const Search = (inventoryOrgId, deliveryId, itemDesc) => {
      return `SELECT  
      request_number,SOURCE_HEADER_NUMBER ORDER_NUMBER,
      SOURCE_LINE_NUMBER SO_LINE,mv.inventory_item_id,
      XXMB_UTILITY_PKG.ITEM_NUMBER (mv.inventory_item_id,mv.organization_id) ITEM,
      XXMB_UTILITY_PKG.ITEM_DESC (mv.inventory_item_id,mv.organization_id) DESCRIPTION,
        XXMB_UTILITY_PKG.ITEM_SERIAL (mv.inventory_item_id,mv.organization_id) ITEM_TYPE,
    XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WV.DELIVERY_ID,mv.ORGANIZATION_ID) ITEM_CATEGORY,
      XXMB_UTILITY_PKG.ITEM_ONHAND(mv.inventory_item_id,mv.organization_id) ONHAND_QTY,
      QUANTITY REQUESTED_QUANTITY, decode((quantity_delivered-quantity),NULL,0,(quantity-quantity_delivered)) Remaining_qty,UOM_CODE UOM   
    FROM 
      MTL_TXN_REQUEST_LINES_V mv,WSH_DELIVERABLES_V wv
  WHERE 
      mv.organization_id = wv.organization_id
  AND TXN_SOURCE_LINE_DETAIL_ID = DELIVERY_LINE_ID
  AND mv.organization_id = ${inventoryOrgId}
  AND wv.delivery_id = ${deliveryId}
  AND upper(XXMB_UTILITY_PKG.ITEM_DESC (mv.inventory_item_id,mv.organization_id)) like '%${itemDesc}%'
  AND -1 = -1
  AND (mv.move_order_type = 3 AND mv.line_status IN (3, 7, 9))
  ORDER BY REQUEST_NUMBER, MOVE_ORDER_TYPE_NAME, LINE_NUMBER`
};

const DeliveryDetails = (deliveryId, inventoryOrgId) => {
      return `SELECT 
                            request_number,SOURCE_HEADER_NUMBER ORDER_NUMBER,
                            SOURCE_LINE_NUMBER SO_LINE,SOURCE_LINE_ID,mv.inventory_item_id,SOURCE_LINE_ID,
                            XXMB_UTILITY_PKG.ITEM_NUMBER (mv.inventory_item_id,mv.organization_id) ITEM,
                            XXMB_UTILITY_PKG.ITEM_DESC (mv.inventory_item_id,mv.organization_id) DESCRIPTION,
                            XXMB_UTILITY_PKG.ITEM_SERIAL (mv.inventory_item_id,mv.organization_id) ITEM_TYPE,
                            XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WV.DELIVERY_ID,mv.ORGANIZATION_ID) ITEM_CATEGORY,
                            XXMB_UTILITY_PKG.ITEM_ONHAND(mv.inventory_item_id,mv.organization_id) ONHAND_QTY,
                            QUANTITY REQUESTED_QUANTITY, decode((quantity_delivered-quantity),NULL,0,(quantity-quantity_delivered)) Remaining_qty
                            ,UOM_CODE UOM   
                        FROM 
                            MTL_TXN_REQUEST_LINES_V mv,WSH_DELIVERABLES_V wv
                        WHERE     mv.organization_id = wv.organization_id
                        AND TXN_SOURCE_LINE_DETAIL_ID = DELIVERY_LINE_ID
                        AND mv.organization_id = ${inventoryOrgId}
                        AND wv.delivery_id = ${deliveryId}
                        AND -1 = -1
                        AND (mv.move_order_type = 3 AND mv.line_status IN (3, 7, 9))
                        ORDER BY REQUEST_NUMBER, MOVE_ORDER_TYPE_NAME, LINE_NUMBER`;
};

const CountBasedonDeliveryId = (deliveryId, inventoryOrgId) => {
      return `select 
        count(SOURCE_Line_NUMBER) Lines, 
        sum(REQUESTED_QUANTITY) UNITS, 
        decode(
          min(LATEST_PICKUP_DATE), 
          NULL, 
          min(Date_requested), 
          min(LATEST_PICKUP_DATE)
        ) promise_date 
      from 
        WSH_DELIVERABLES_V 
      where 
        delivery_id = ${deliveryId}
        and organization_id = ${inventoryOrgId}
      `;
};

const UpdateLockDeliveryQuery = () => {
      return `UPDATE WSH_NEW_DELIVERIES
      SET ATTRIBUTE11 = upper(:username), --FND_USER Table USER_NAME Column Name    
      LAST_UPDATE_DATE = SYSDATE, --System Date    
      LAST_UPDATED_BY = (SELECT USER_ID FROM FND_USER WHERE USER_NAME = upper(:username)) --FND_USER Table USER_ID Column Name    
      WHERE DELIVERY_ID = :deliveryId    
      AND ATTRIBUTE11 is NULL`
}

module.exports = {
      Search,
      DeliveryDetails,
      CountBasedonDeliveryId,
      SourceSubInventoryDetails,
      DestinationSubInventoryDetails,
      PalleteLOV,
      CageLOV,
      ToteLOV,
      GetLinesCountBasedOnSO,
      GetSoLinesDetails,
      UpdateAutoPopulateFullPickQty,
      PickupLookupPalletCageTote,
      UpdateLockDeliveryQuery
};

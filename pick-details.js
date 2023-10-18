async function CountBasedonDeliveryId(deliveryId, inventoryOrgId) {
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
}

async function DeliveryDetails(deliveryId, inventoryOrgId) {
  return `SELECT 
                        request_number,SOURCE_HEADER_NUMBER ORDER_NUMBER,
                        SOURCE_LINE_NUMBER SO_LINE,mv.inventory_item_id,
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
}

const PickDetails = {
  CountBasedonDeliveryId,
  DeliveryDetails,
};
module.exports = PickDetails;

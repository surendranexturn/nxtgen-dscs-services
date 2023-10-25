const List = (inventoryOrgId) => {
    return `
    SELECT DELIVERY_ID,
                  PROMISE_DATE,
                  ORDER_NUMBER,
                  SO_DISPLAY,
                  ITEM_COUNT,
                  SEQ,
                  ROW_NUM,
                  COUNT(*) OVER () TOTAL_ROWCOUNT
                  FROM
                (SELECT  WDV.DELIVERY_ID,
                WDV.LATEST_PICKUP_DATE       PROMISE_DATE,
                WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                CASE 
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                      'SO# Multiple'
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                      'SO# '||WDV.SOURCE_HEADER_NUMBER
                  END SO_DISPLAY,
                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                  1 SEQ,
                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM
                FROM WSH_DELIVERABLES_V WDV
                WHERE WDV.SOURCE_CODE = 'OE'
                AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL
                AND WDV.CONTAINER_FLAG = 'N'
                AND WDV.RELEASED_STATUS = 'Y' 
                AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
                GROUP BY WDV.DELIVERY_ID,
                WDV.SOURCE_HEADER_NUMBER,
                WDV.LATEST_PICKUP_DATE,
                WDV.DATE_REQUESTED,
                WDV.DATE_SCHEDULED
                UNION
                SELECT  WDV.DELIVERY_ID,
                WDV.LATEST_PICKUP_DATE       PROMISE_DATE,
                WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                CASE 
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                      'SO# Multiple'
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                      'SO# '||WDV.SOURCE_HEADER_NUMBER
                  END SO_DISPLAY,
                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                  2 SEQ,
                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM
                FROM WSH_DELIVERABLES_V WDV
                WHERE WDV.SOURCE_CODE = 'OE'
                AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NULL
                AND WDV.CONTAINER_FLAG = 'N'
                AND WDV.RELEASED_STATUS = 'Y' 
                AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
                AND WDV.DELIVERY_ID NOT IN (SELECT DISTINCT WDV.DELIVERY_ID FROM WSH_DELIVERABLES_V WDV
                                            WHERE WDV.SOURCE_CODE = 'OE'
                                              AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL
                                              AND WDV.CONTAINER_FLAG = 'N'
                                              AND WDV.RELEASED_STATUS = 'Y' 
                                              AND WDV.ORGANIZATION_ID = ${inventoryOrgId})
                GROUP BY WDV.DELIVERY_ID,
                WDV.SOURCE_HEADER_NUMBER,
                WDV.LATEST_PICKUP_DATE,
                WDV.DATE_REQUESTED,
                WDV.DATE_SCHEDULED)
                WHERE ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE2
                FROM FND_LOOKUP_VALUES_VL FLV,
                      XXMB_INV_ORG_V XX
                WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                  AND FLV.ENABLED_FLAG = 'Y'
                  AND FLV.LOOKUP_CODE = XX.INV_ORG_CODE
                  AND SUBSTR(XX.INVENTORY_ORGANIZATION_NAME,1,3) = 'RAD'
                  AND XX.INV_ORG_ID = ${inventoryOrgId}),(SELECT ATTRIBUTE2
                FROM FND_LOOKUP_VALUES_VL FLV
                WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                  AND FLV.ENABLED_FLAG = 'Y'
                  AND FLV.MEANING = 'ALL'))  
                ORDER BY SEQ,ROW_NUM
    `
};

const Dashboard = (inventoryOrgId) => {
    return `SELECT (SELECT COUNT(DISTINCT DELIVERY_ID) TOTAL FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId}) TOTAL, (SELECT COUNT(DISTINCT DELIVERY_ID) TOTAL FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId}) IN_PROCESS, (SELECT COUNT(DISTINCT WDV.DELIVERY_ID) FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId} AND WDV.DELIVERY_ID NOT IN (SELECT DISTINCT WDV.DELIVERY_ID FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId})) READY_FOR_PACK FROM DUAL`
};

const SearchBySONumber = () => {
    return `
    SELECT DISTINCT WDV.SOURCE_HEADER_NUMBER AS ORDER_NUMBER
    FROM WSH_DELIVERABLES_V WDV
    WHERE CONTAINER_FLAG = 'N'
      AND SOURCE_CODE = 'OE'
      AND WDV.RELEASED_STATUS = 'Y' 
      AND WDV.SOURCE_HEADER_NUMBER LIKE '%' || :sonumber || '%'
      AND WDV.ORGANIZATION_ID = :inventoryOrgId`
};

const SearchByDeliveryId = () => {
    return `
    SELECT DISTINCT WDV.DELIVERY_ID AS DELIVERY
    FROM WSH_DELIVERABLES_V WDV
    WHERE CONTAINER_FLAG = 'N'
      AND SOURCE_CODE = 'OE'
      AND WDV.RELEASED_STATUS = 'Y'
      AND WDV.DELIVERY_ID LIKE '%' || :deliveryId || '%'
      AND WDV.ORGANIZATION_ID = :inventoryOrgId`
};

const SearchByDestinationLocator = () => {
    return `SELECT DISTINCT MIL.SEGMENT1||'.'||MIL.SEGMENT2||'.'||MIL.SEGMENT3||'.0.0.0.0.0.0.0' DESTINATION_LOCATOR
    FROM MTL_ITEM_LOCATIONS MIL
    WHERE ORGANIZATION_ID = :inventoryOrgId
      AND MIL.INVENTORY_ITEM_ID IN
        (SELECT DISTINCT WDV.INVENTORY_ITEM_ID
         FROM WSH_DELIVERABLES_V WDV
         WHERE CONTAINER_FLAG = 'N'
           AND WDV.SOURCE_CODE = 'OE'
           AND WDV.RELEASED_STATUS = 'Y'
           AND MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3 like NVL('%'|| :srchSegment || '%',MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3)
           AND WDV.ORGANIZATION_ID = :inventoryOrgId)`
};

const Search = (sonumber, deliveryId, srchSegment, inventoryOrgId) => {
    let append;
    if (sonumber != "") {
        append = `AND WDV.SOURCE_HEADER_NUMBER LIKE NVL('%'|| ${sonumber} || '%',WDV.SOURCE_HEADER_NUMBER)`;
    } else if (deliveryId != "") {
        append = `AND WDV.DELIVERY_ID LIKE NVL('%'|| ${deliveryId} || '%',WDV.DELIVERY_ID)`;
    } else if (srchSegment != "") {
        srchSegment = srchSegment ? `'${srchSegment}'` : "";
        append = `AND WDV.INVENTORY_ITEM_ID IN (SELECT INVENTORY_ITEM_ID FROM MTL_ITEM_LOCATIONS MIL
                                            WHERE ORGANIZATION_ID = ${inventoryOrgId}
                                               AND MIL.INVENTORY_ITEM_ID = WDV.INVENTORY_ITEM_ID
                                               AND MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3 like NVL('%'|| ${srchSegment} || '%',MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3))`;
    }

    return `SELECT DELIVERY_ID,
                  PROMISE_DATE AS "Date",
                  ORDER_NUMBER,
                  SO_DISPLAY,
                  ITEM_COUNT,
                  SEQ,
                  ROW_NUM,
                  COUNT(*) OVER () TOTAL_ROWCOUNT
                  FROM
                (SELECT  WDV.DELIVERY_ID,
                WDV.LATEST_PICKUP_DATE       PROMISE_DATE,
                WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                CASE 
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                      'SO# Multiple'
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                      'SO# '||WDV.SOURCE_HEADER_NUMBER
                  END SO_DISPLAY,
                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                  1 SEQ,
                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM
                FROM WSH_DELIVERABLES_V WDV
                WHERE WDV.SOURCE_CODE = 'OE'
                AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL
                AND WDV.CONTAINER_FLAG = 'N'
                AND WDV.RELEASED_STATUS = 'Y' 
                AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
                ${append}
                GROUP BY WDV.DELIVERY_ID,
                WDV.SOURCE_HEADER_NUMBER,
                WDV.LATEST_PICKUP_DATE,
                WDV.DATE_REQUESTED,
                WDV.DATE_SCHEDULED
                UNION
                SELECT  WDV.DELIVERY_ID,
                WDV.LATEST_PICKUP_DATE       PROMISE_DATE,
                WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                CASE 
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                      'SO# Multiple'
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                      'SO# '||WDV.SOURCE_HEADER_NUMBER
                  END SO_DISPLAY,
                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                  2 SEQ,
                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM
                FROM WSH_DELIVERABLES_V WDV
                WHERE WDV.SOURCE_CODE = 'OE'
                AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NULL
                AND WDV.CONTAINER_FLAG = 'N'
                AND WDV.RELEASED_STATUS = 'Y' 
                AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
               ${append}
                AND WDV.DELIVERY_ID NOT IN (SELECT DISTINCT WDV.DELIVERY_ID FROM WSH_DELIVERABLES_V WDV
                                            WHERE WDV.SOURCE_CODE = 'OE'
                                              AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL
                                              AND WDV.CONTAINER_FLAG = 'N'
                                              AND WDV.RELEASED_STATUS = 'Y' 
                                              AND WDV.ORGANIZATION_ID = ${inventoryOrgId})
                GROUP BY WDV.DELIVERY_ID,
                WDV.SOURCE_HEADER_NUMBER,
                WDV.LATEST_PICKUP_DATE,
                WDV.DATE_REQUESTED,
                WDV.DATE_SCHEDULED)
                WHERE ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE2
                FROM FND_LOOKUP_VALUES_VL FLV,
                      XXMB_INV_ORG_V XX
                WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                  AND FLV.ENABLED_FLAG = 'Y'
                  AND FLV.LOOKUP_CODE = XX.INV_ORG_CODE
                  AND SUBSTR(XX.INVENTORY_ORGANIZATION_NAME,1,3) = 'RAD'
                  AND XX.INV_ORG_ID = ${inventoryOrgId}),(SELECT ATTRIBUTE2
                FROM FND_LOOKUP_VALUES_VL FLV
                WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                  AND FLV.ENABLED_FLAG = 'Y'
                  AND FLV.MEANING = 'ALL'))  
                ORDER BY SEQ,ROW_NUM`;
};

const Filter = (inventoryOrgId, inporcess, packing) => {
    return `SELECT DELIVERY_ID,
    PROMISE_DATE AS "Date",
    ORDER_NUMBER,
    SO_DISPLAY,
    ITEM_COUNT,
    SEQ,
    ROW_NUM,
    COUNT(*) OVER () TOTAL_ROWCOUNT
    FROM
    (SELECT  WDV.DELIVERY_ID,
    WDV.LATEST_PICKUP_DATE       PROMISE_DATE,
    WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
    CASE 
    WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
          'SO# Multiple'
    WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
          'SO# '||WDV.SOURCE_HEADER_NUMBER
    END SO_DISPLAY,
    COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
    1 SEQ,
    ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM
    FROM WSH_DELIVERABLES_V WDV
    WHERE WDV.SOURCE_CODE = 'OE'
    AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL
    AND WDV.CONTAINER_FLAG = 'N'
    AND WDV.RELEASED_STATUS = 'Y' 
    AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
    AND 'INPROCESS' = UPPER('${inporcess}')
    GROUP BY WDV.DELIVERY_ID,
    WDV.SOURCE_HEADER_NUMBER,
    WDV.LATEST_PICKUP_DATE,
    WDV.DATE_REQUESTED,
    WDV.DATE_SCHEDULED
    UNION
    SELECT  WDV.DELIVERY_ID,
    WDV.LATEST_PICKUP_DATE       PROMISE_DATE,
    WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
    CASE 
    WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
          'SO# Multiple'
    WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
          'SO# '||WDV.SOURCE_HEADER_NUMBER
    END SO_DISPLAY,
    COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
    2 SEQ,
    ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM
    FROM WSH_DELIVERABLES_V WDV
    WHERE WDV.SOURCE_CODE = 'OE'
    AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NULL
    AND WDV.CONTAINER_FLAG = 'N'
    AND WDV.RELEASED_STATUS = 'Y' 
    AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
    AND 'AVAILABLE' = UPPER('${packing}')
    AND WDV.DELIVERY_ID NOT IN (SELECT DISTINCT WDV.DELIVERY_ID FROM WSH_DELIVERABLES_V WDV
                              WHERE WDV.SOURCE_CODE = 'OE'
                                AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL
                                AND WDV.CONTAINER_FLAG = 'N'
                                AND WDV.RELEASED_STATUS = 'Y' 
                                AND WDV.ORGANIZATION_ID = ${inventoryOrgId})
    GROUP BY WDV.DELIVERY_ID,
    WDV.SOURCE_HEADER_NUMBER,
    WDV.LATEST_PICKUP_DATE,
    WDV.DATE_REQUESTED,
    WDV.DATE_SCHEDULED)
    WHERE ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE2
    FROM FND_LOOKUP_VALUES_VL FLV,
        XXMB_INV_ORG_V XX
    WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
      AND FLV.ENABLED_FLAG = 'Y'
      AND FLV.LOOKUP_CODE = XX.INV_ORG_CODE
      AND SUBSTR(XX.INVENTORY_ORGANIZATION_NAME,1,3) = 'RAD'
      AND XX.INV_ORG_ID = ${inventoryOrgId}),(SELECT ATTRIBUTE2
    FROM FND_LOOKUP_VALUES_VL FLV
    WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
      AND FLV.ENABLED_FLAG = 'Y'
      AND FLV.MEANING = 'ALL'))  
    ORDER BY SEQ,ROW_NUM`;
};

const Detail = (inventoryOrgId, deliveryId) => {
    return `
    SELECT 'DEL#'||WDV.DELIVERY_ID DELIVERY_NUMBER,
           HZP.PARTY_NAME,
           MIN(WDV.LATEST_PICKUP_DATE) OVER (ORDER BY NVL(WDV.LATEST_PICKUP_DATE,WDV.DATE_REQUESTED)) PROMISE_DATE,
           'SO#' ||OOHA.ORDER_NUMBER SALES_ORDER,
           'Item# '||OOLA.ORDERED_ITEM ITEM_NUMBER,
           MSIB.DESCRIPTION ITEM_DESCRIPTION,
           OOLA.ORDERED_QUANTITY||' '||ORDER_QUANTITY_UOM QNTY_TO_BE_PACKED,
           'SO Line# '||WDV.SOURCE_LINE_NUMBER LINE_NUMBER,
           SUM( OOLA.ORDERED_QUANTITY) OVER (PARTITION BY WDV.DELIVERY_ID ) TOTAL_ITEM_COUNT,
           (SELECT HAZARD_CLASS 
              FROM PO_HAZARD_CLASSES_TL 
             WHERE HAZARD_CLASS_ID = MSIB.HAZARD_CLASS_ID) HAZARD_CLASS,
           DECODE(MSIB.SERIAL_NUMBER_CONTROL_CODE,1,'Consumable',2,'Asset',5,'Asset',6,'Asset') ITEM_CATEGORY
      FROM WSH_DELIVERABLES_V WDV,
           HZ_PARTIES HZP,
           HZ_CUST_ACCOUNTS HCA,
           OE_ORDER_HEADERS_ALL OOHA,
           OE_ORDER_LINES_ALL OOLA,
           MTL_SYSTEM_ITEMS_B MSIB
     WHERE WDV.SOURCE_CODE = 'OE'
       AND WDV.CONTAINER_FLAG = 'N'
       AND WDV.RELEASED_STATUS = 'Y'
       AND OOHA.HEADER_ID = WDV.SOURCE_HEADER_ID
       AND OOHA.HEADER_ID = OOLA.HEADER_ID
       AND OOLA.LINE_ID = WDV.SOURCE_LINE_ID
       AND WDV.CUSTOMER_ID = HCA.CUST_ACCOUNT_ID
       AND HCA.PARTY_ID = HZP.PARTY_ID
       AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
       AND WDV.INVENTORY_ITEM_ID = MSIB.INVENTORY_ITEM_ID
       AND WDV.ORGANIZATION_ID = MSIB.ORGANIZATION_ID
       AND WDV.DELIVERY_ID = ${deliveryId}
     `;
}

module.exports = {
    List,
    Dashboard,
    SearchBySONumber,
    SearchByDeliveryId,
    SearchByDestinationLocator,
    Search,
    Filter,
    Detail
}
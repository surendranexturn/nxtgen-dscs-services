const db = require("./db");

/**
 * Show the count of the pack dashboard query
 * @param {*} inventoryOrgId
 * @returns
 */
async function Dashboard(inventoryOrgId) {
  return `SELECT (SELECT COUNT(DISTINCT DELIVERY_ID) TOTAL FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId}) TOTAL, (SELECT COUNT(DISTINCT DELIVERY_ID) TOTAL FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId}) IN_PROCESS, (SELECT COUNT(DISTINCT WDV.DELIVERY_ID) FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId} AND WDV.DELIVERY_ID NOT IN (SELECT DISTINCT WDV.DELIVERY_ID FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId})) READY_FOR_PACK FROM DUAL`;
}

//Pack List Screen
/**
 * Released status = 'Y' if the status is Y means ready for packaging
 */
async function List(inventoryOrgId) {
  return `SELECT DELIVERY_ID,
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
                ORDER BY SEQ,ROW_NUM`;
}

/**
 * Author Surendra
 * Created on 20-Oct-23
 * @param {*} inventoryOrgId
 * @param {*} sonumber
 * returns as sql query
 */
async function SearchBySONumber(sonumber, inventoryOrgId, dbConfig) {
  const query = `
    SELECT DISTINCT WDV.SOURCE_HEADER_NUMBER AS ORDER_NUMBER
    FROM WSH_DELIVERABLES_V WDV
    WHERE CONTAINER_FLAG = 'N'
      AND SOURCE_CODE = 'OE'
      AND WDV.RELEASED_STATUS = 'Y' 
      AND WDV.SOURCE_HEADER_NUMBER LIKE '%' || :sonumber || '%'
      AND WDV.ORGANIZATION_ID = :inventoryOrgId`;

  db.executeQuery(query, { sonumber, inventoryOrgId }, dbConfig)
    .then((results) => {
      // Handle the results here
      return results;
    })
    .catch((error) => {
      // Handle errors here
      console.error("Error:", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Database error" }),
      };
    });
}

/**
 * * Author Surendra
 * Created on 20-Oct-23
 * @param {*} deliveryId
 * @param {*} inventoryOrgId
 * @returns sql query
 */
async function SearchByDeliveryId(deliveryId, inventoryOrgId, dbConfig) {
  const query = `
  SELECT DISTINCT WDV.DELIVERY_ID AS DELIVERY
  FROM WSH_DELIVERABLES_V WDV
  WHERE CONTAINER_FLAG = 'N'
    AND SOURCE_CODE = 'OE'
    AND WDV.RELEASED_STATUS = 'Y'
    AND WDV.DELIVERY_ID LIKE '%' || :deliveryId || '%'
    AND WDV.ORGANIZATION_ID = :inventoryOrgId`;
  const params = { deliveryId, inventoryOrgId };
  db.executeQuery(query, params, dbConfig)
    .then((results) => {
      // Handle the results here
      return results;
    })
    .catch((error) => {
      // Handle errors here
      console.error("Error:", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Database error" }),
      };
    });
}

/**
 *  Author Surendra
 * Created on 20-Oct-23
 * @param {*} inventoryOrgId
 * @returns sql query
 */
async function SearchByDestinationLocator(
  srchSegment,
  inventoryOrgId,
  dbConfig
) {
  const query = `
  SELECT DISTINCT MIL.SEGMENT1||'.'||MIL.SEGMENT2||'.'||MIL.SEGMENT3||'.0.0.0.0.0.0.0' DESTINATION_LOCATOR
  FROM MTL_ITEM_LOCATIONS MIL
  WHERE ORGANIZATION_ID = :inventoryOrgId
    AND MIL.INVENTORY_ITEM_ID IN
      (SELECT DISTINCT WDV.INVENTORY_ITEM_ID
      FROM WSH_DELIVERABLES_V WDV
      WHERE CONTAINER_FLAG = 'N'
        AND WDV.SOURCE_CODE = 'OE'
        AND WDV.RELEASED_STATUS = 'Y'
        AND MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3 like NVL('%'|| :srchSegment || '%',MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3)
        AND WDV.ORGANIZATION_ID = :inventoryOrgId})`;
  const params = { inventoryOrgId, srchSegment };
  db.executeQuery(query, params, dbConfig)
    .then((results) => {
      // Handle the results here
      return results;
    })
    .catch((error) => {
      // Handle errors here
      console.error("Error:", error.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Database error" }),
      };
    });
}

/**
 * Author Surendra
 * Created on 20-Oct-23
 * @param {DL(Deliveryid), SO(SalesOrder), SM(Segment)} searchType
 * @param {*} searchValue
 * @param {*} inventoryOrgId
 * @returns  sql Query
 */
async function Search(deliveryId, sonumber, srchSegment, inventoryOrgId) {
  sonumber = sonumber ? sonumber : ":INPUT_VAR";
  deliveryId = deliveryId ? deliveryId : ":INPUT_VAR1";
  srchSegment = srchSegment ? `'${srchSegment}'` : ":INPUT_VAR3";
  return `SELECT DELIVERY_ID,
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
                AND WDV.SOURCE_HEADER_NUMBER LIKE NVL('%'|| ${sonumber} || '%',WDV.SOURCE_HEADER_NUMBER)
                AND WDV.DELIVERY_ID LIKE NVL('%'|| ${deliveryId} || '%',WDV.DELIVERY_ID)
                AND WDV.INVENTORY_ITEM_ID IN (SELECT INVENTORY_ITEM_ID FROM MTL_ITEM_LOCATIONS MIL
                                            WHERE ORGANIZATION_ID = ${inventoryOrgId}
                                              AND MIL.INVENTORY_ITEM_ID = WDV.INVENTORY_ITEM_ID
                                              AND MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3 like NVL('%'|| ${srchSegment} || '%',MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3))
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
                AND WDV.SOURCE_HEADER_NUMBER LIKE NVL('%'|| ${sonumber} || '%',WDV.SOURCE_HEADER_NUMBER)
                AND WDV.DELIVERY_ID LIKE NVL('%'|| ${deliveryId} || '%',WDV.DELIVERY_ID)
                AND WDV.INVENTORY_ITEM_ID IN (SELECT INVENTORY_ITEM_ID FROM MTL_ITEM_LOCATIONS MIL
                                            WHERE ORGANIZATION_ID = ${inventoryOrgId}
                                              AND MIL.INVENTORY_ITEM_ID = WDV.INVENTORY_ITEM_ID
                                              AND MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3 like NVL('%'|| ${srchSegment} || '%',MIL.SEGMENT1||MIL.SEGMENT2||MIL.SEGMENT3))
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
}

/**
 * Author Surendra
 * @param {INPROCESS(Pack In Process)} inporcess
 * @param {AVAILABLE(Open for packing)} packing
 * @param {*} inventoryOrgId
 * @returns  sql query
 */
async function Filter(inporcess, packing, inventoryOrgId) {
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
}

const Pack = {
  Dashboard,
  List,
  Search,
  SearchBySONumber,
  SearchByDeliveryId,
  SearchByDestinationLocator,
  Filter,
};
module.exports = Pack;

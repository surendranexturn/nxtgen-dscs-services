/**
 * Author: Surendra
 * Date:10-Oct-2023
 * JIRA - AM 213
 * Updated: 19-Oct-2023
 * @param {*} username
 * @param {*} inventoryOrgId
 * @returns
 */
async function PickList(username, inventoryOrgId) {
  return `SELECT DELIVERY,
                  PICKED_BY,
                  PROMISE_DATE,
                  ORDER_NUMBER,
                  DATE_SCHEDULED,
                  ITEM_COUNT,
                  SO_DISPLAY,
                  DEMAND_TYPE,
                  ITEM_CATEGORY,
                  CUSTOMER_NAME,
                  COUNT(*) OVER () TOTAL_ROWCOUNT,
                  SEQ,ROW_NUM
                  FROM
                  (SELECT WDV.DELIVERY_ID              DELIVERY,
                    WND.ATTRIBUTE11  PICKED_BY,
                  1 SEQ,
                  WDV.LATEST_PICKUP_DATE       PROMISE_DATE,			
                  WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                  CASE 
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                        'SO# Multiple'
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                        'SO# '||WDV.SOURCE_HEADER_NUMBER
                  END SO_DISPLAY,
                  XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE,
                  XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY,
                  (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA
                  WHERE HCA.PARTY_ID = HZP.PARTY_ID
                    AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME,
                  DATE_SCHEDULED,
                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM,
                    WDV.CUSTOMER_ID
                  FROM   WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND
                  WHERE  WND.DELIVERY_ID=WDV.DELIVERY_ID
                  AND CONTAINER_FLAG = 'N'
                  AND SOURCE_CODE = 'OE'
                  AND RELEASED_STATUS = 'S'
                  AND WND.ATTRIBUTE11 = upper('${username}')
                  AND WDV.ORGANIZATION_ID = ${inventoryOrgId}		   
                  GROUP  BY WDV.DELIVERY_ID,
                      WND.ATTRIBUTE11,
                      WDV.LATEST_PICKUP_DATE,
                      SOURCE_HEADER_NUMBER,
                      DATE_REQUESTED,
                      DATE_SCHEDULED,WDV.CUSTOMER_ID
                  UNION
                  SELECT WDV.DELIVERY_ID              DELIVERY,
                  CASE WHEN WND.ATTRIBUTE11 IS NULL THEN 'Ready to be picked'  ELSE  WND.ATTRIBUTE11 END    PICKED_BY,
                  CASE WHEN WND.ATTRIBUTE11 <> upper('${username}') THEN 3
                        ELSE 2 END SEQ,
                  WDV.LATEST_PICKUP_DATE       PROMISE_DATE,			
                  WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                  CASE 
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                        'SO# Multiple'
                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                        'SO# '||WDV.SOURCE_HEADER_NUMBER
                  END SO_DISPLAY,
                  XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE,
                  XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY,
                  (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA
                  WHERE HCA.PARTY_ID = HZP.PARTY_ID
                    AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME,
                  DATE_SCHEDULED,
                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM,
                    WDV.CUSTOMER_ID
                  FROM   WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND
                  WHERE  WND.DELIVERY_ID=WDV.DELIVERY_ID
                  AND CONTAINER_FLAG = 'N'
                  AND SOURCE_CODE = 'OE'
                  AND RELEASED_STATUS = 'S' 
                  AND (WND.ATTRIBUTE11 <> upper('${username}') OR WND.ATTRIBUTE11 IS NULL)
                  AND WDV.ORGANIZATION_ID = ${inventoryOrgId}	
                  AND ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE1
                  FROM FND_LOOKUP_VALUES_VL FLV,
                      XXMB_INV_ORG_V XX
                  WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                    AND FLV.ENABLED_FLAG = 'Y'
                    AND FLV.LOOKUP_CODE = XX.INV_ORG_CODE
                    AND SUBSTR(XX.INVENTORY_ORGANIZATION_NAME,1,3) = 'RAD'
                    AND XX.INV_ORG_ID = ${inventoryOrgId}),(SELECT ATTRIBUTE1
                  FROM FND_LOOKUP_VALUES_VL FLV
                  WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                    AND FLV.ENABLED_FLAG = 'Y'
                    AND FLV.MEANING = 'ALL'))
                  GROUP  BY WDV.DELIVERY_ID,
                      WND.ATTRIBUTE11,
                      WDV.LATEST_PICKUP_DATE,
                      SOURCE_HEADER_NUMBER,
                      DATE_REQUESTED,
                      DATE_SCHEDULED,WDV.CUSTOMER_ID)
                  ORDER BY SEQ,ROW_NUM`;
}

// async function Search(inventoryOrgId) {
//   return `SELECT DELIVERY, PICKED_BY, PROMISE_DATE, ORDER_NUMBER, DATE_SCHEDULED, ITEM_COUNT, SO_DISPLAY, DEMAND_TYPE, ITEM_CATEGORY, CUSTOMER_NAME, COUNT(*) OVER () TOTAL_ROWCOUNT, SEQ, ROW_NUM FROM (SELECT WDV.DELIVERY_ID DELIVERY, WND.ATTRIBUTE11 PICKED_BY, 1 SEQ, WDV.LATEST_PICKUP_DATE PROMISE_DATE, WDV.SOURCE_HEADER_NUMBER ORDER_NUMBER, CASE WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID) > 1 THEN 'SO# Multiple' WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID) = 1 THEN 'SO# '||WDV.SOURCE_HEADER_NUMBER END SO_DISPLAY, XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE, XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY, (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA WHERE HCA.PARTY_ID = HZP.PARTY_ID AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME, DATE_SCHEDULED, COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT, ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM, WDV.CUSTOMER_ID FROM WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND WHERE WND.DELIVERY_ID=WDV.DELIVERY_ID AND WDV.SOURCE_HEADER_NUMBER LIKE NVL('%'|| ${orderNumber} || '%',WDV.SOURCE_HEADER_NUMBER) AND WDV.ITEM_DESCRIPTION LIKE NVL('%'|| ${itemDesc} || '%',WDV.ITEM_DESCRIPTION) AND WDV.DELIVERY_ID LIKE NVL('%'|| ${deliveryId} || '%',WDV.DELIVERY_ID) AND CONTAINER_FLAG = 'N' AND SOURCE_CODE = 'OE' AND RELEASED_STATUS = 'S' AND WND.ATTRIBUTE11 = upper('${username}') AND WDV.ORGANIZATION_ID = ${inventoryOrgId} GROUP BY WDV.DELIVERY_ID, WND.ATTRIBUTE11, WDV.LATEST_PICKUP_DATE, SOURCE_HEADER_NUMBER, DATE_REQUESTED, DATE_SCHEDULED,WDV.CUSTOMER_ID UNION SELECT WDV.DELIVERY_ID DELIVERY, CASE WHEN WND.ATTRIBUTE11 IS NULL THEN 'Read to be picked' ELSE WND.ATTRIBUTE11 END PICKED_BY, CASE WHEN WND.ATTRIBUTE11 <> upper('${username}') THEN 3 ELSE 2 END SEQ, WDV.LATEST_PICKUP_DATE PROMISE_DATE, WDV.SOURCE_HEADER_NUMBER ORDER_NUMBER, CASE WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID) > 1 THEN 'SO# Multiple' WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID) = 1 THEN 'SO# '||WDV.SOURCE_HEADER_NUMBER END SO_DISPLAY, XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE, XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY, (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA WHERE HCA.PARTY_ID = HZP.PARTY_ID AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME, DATE_SCHEDULED, COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT, ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM, WDV.CUSTOMER_ID FROM WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND WHERE WND.DELIVERY_ID=WDV.DELIVERY_ID AND WDV.SOURCE_HEADER_NUMBER LIKE NVL('%'|| :INPUT_VAR || '%',WDV.SOURCE_HEADER_NUMBER) AND WDV.ITEM_DESCRIPTION LIKE NVL('%'|| :INPUT_VAR1 || '%',WDV.ITEM_DESCRIPTION) AND WDV.DELIVERY_ID LIKE NVL('%'|| :INPUT_VAR2 || '%',WDV.DELIVERY_ID) AND CONTAINER_FLAG = 'N' AND SOURCE_CODE = 'OE' AND RELEASED_STATUS = 'S' AND (WND.ATTRIBUTE11 <> upper('${username}') OR WND.ATTRIBUTE11 IS NULL) AND WDV.ORGANIZATION_ID = ${inventoryOrgId} AND ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE1 FROM FND_LOOKUP_VALUES_VL FLV, XXMB_INV_ORG_V XX WHERE FLV.LOOKUP_TYPE = 'XXONT_RAD_SEG2' AND FLV.ENABLED_FLAG = 'Y' AND FLV.DESCRIPTION = XX.INV_ORG_CODE AND XX.INV_ORG_ID = ${inventoryOrgId}),5) GROUP BY WDV.DELIVERY_ID, WND.ATTRIBUTE11, WDV.LATEST_PICKUP_DATE, SOURCE_HEADER_NUMBER, DATE_REQUESTED, DATE_SCHEDULED,WDV.CUSTOMER_ID) ORDER BY SEQ, ROW_NUM`;
// }

/**
 * Author: Surendra
 * JIRA - AM214
 * Date:10-Oct-2023
 * Updated: 19-Oct-2023
 * @param {*} username
 * @param {*} searchLookupType
 * @param {*} searchValue
 * @param {*} inventoryOrgId
 * @returns
 */
async function Search(username, searchLookupType, searchValue, inventoryOrgId) {
  let appendQuery;
  if (searchLookupType === "D") {
    appendQuery = `AND WDV.DELIVERY_ID LIKE NVL('%'|| ${searchValue} || '%',WDV.DELIVERY_ID)`;
  } else if (searchLookupType === "S") {
    appendQuery = `AND WDV.SOURCE_HEADER_NUMBER LIKE NVL('%'|| ${searchValue} || '%',WDV.SOURCE_HEADER_NUMBER)`;
  } else if (searchLookupType === "I") {
    appendQuery = `AND WDV.ITEM_DESCRIPTION LIKE NVL('%'|| ${searchValue} || '%',WDV.ITEM_DESCRIPTION)`;
  }

  return `SELECT DELIVERY,
                                  PICKED_BY,
                                  PROMISE_DATE,
                                  ORDER_NUMBER,
                                  DATE_SCHEDULED,
                                  ITEM_COUNT,
                                  SO_DISPLAY,
                                  DEMAND_TYPE,
                                  ITEM_CATEGORY,
                                  CUSTOMER_NAME,
                                  COUNT(*) OVER () TOTAL_ROWCOUNT,
                                  SEQ,ROW_NUM
                                FROM
                                (SELECT WDV.DELIVERY_ID              DELIVERY,
                                  WND.ATTRIBUTE11  PICKED_BY,
                                1 SEQ,
                                  WDV.LATEST_PICKUP_DATE       PROMISE_DATE,			
                                  WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                                  CASE 
                                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                                      'SO# Multiple'
                                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                                      'SO# '||WDV.SOURCE_HEADER_NUMBER
                                  END SO_DISPLAY,
                                  XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE,
                                XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY,
                                (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA
                                  WHERE HCA.PARTY_ID = HZP.PARTY_ID
                                    AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME,
                                  DATE_SCHEDULED,
                                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM,
                                  WDV.CUSTOMER_ID
                                FROM   WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND
                                WHERE  WND.DELIVERY_ID=WDV.DELIVERY_ID
                                ${appendQuery}
                                  AND CONTAINER_FLAG = 'N'
                                  AND SOURCE_CODE = 'OE'
                                  AND RELEASED_STATUS = 'S'
                                  AND WND.ATTRIBUTE11 = upper('${username}')
                                  AND WDV.ORGANIZATION_ID = ${inventoryOrgId}		   
                                GROUP  BY WDV.DELIVERY_ID,
                                    WND.ATTRIBUTE11,
                                    WDV.LATEST_PICKUP_DATE,
                                    SOURCE_HEADER_NUMBER,
                                    DATE_REQUESTED,
                                    DATE_SCHEDULED,WDV.CUSTOMER_ID
                                UNION
                                SELECT WDV.DELIVERY_ID              DELIVERY,
                                  CASE WHEN WND.ATTRIBUTE11 IS NULL THEN 'Ready to be picked'  ELSE  WND.ATTRIBUTE11 END    PICKED_BY,
                                CASE WHEN WND.ATTRIBUTE11 <> upper('${username}') THEN 3
                                      ELSE 2 END SEQ,
                                  WDV.LATEST_PICKUP_DATE       PROMISE_DATE,			
                                  WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                                  CASE 
                                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                                      'SO# Multiple'
                                  WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                                      'SO# '||WDV.SOURCE_HEADER_NUMBER
                                  END SO_DISPLAY,
                                  XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE,
                                XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY,
                                (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA
                                  WHERE HCA.PARTY_ID = HZP.PARTY_ID
                                    AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME,
                                  DATE_SCHEDULED,
                                  COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                                  ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM,
                                  WDV.CUSTOMER_ID
                                FROM   WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND
                                WHERE  WND.DELIVERY_ID=WDV.DELIVERY_ID
                                ${appendQuery}
                                  AND CONTAINER_FLAG = 'N'
                                  AND SOURCE_CODE = 'OE'
                                  AND RELEASED_STATUS = 'S' 
                                  AND (WND.ATTRIBUTE11 <> upper('${username}') OR WND.ATTRIBUTE11 IS NULL)
                                  AND WDV.ORGANIZATION_ID = ${inventoryOrgId}	
                                  AND ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE1
                                FROM FND_LOOKUP_VALUES_VL FLV,
                                      XXMB_INV_ORG_V XX
                                WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                                  AND FLV.ENABLED_FLAG = 'Y'
                                  AND FLV.LOOKUP_CODE = XX.INV_ORG_CODE
                                  AND SUBSTR(XX.INVENTORY_ORGANIZATION_NAME,1,3) = 'RAD'
                                  AND XX.INV_ORG_ID = ${inventoryOrgId}),(SELECT ATTRIBUTE1
                                FROM FND_LOOKUP_VALUES_VL FLV
                                WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                                  AND FLV.ENABLED_FLAG = 'Y'
                                  AND FLV.MEANING = 'ALL'))
                                GROUP  BY WDV.DELIVERY_ID,
                                    WND.ATTRIBUTE11,
                                    WDV.LATEST_PICKUP_DATE,
                                    SOURCE_HEADER_NUMBER,
                                    DATE_REQUESTED,
                                    DATE_SCHEDULED,WDV.CUSTOMER_ID)
                                ORDER BY SEQ,ROW_NUM`;
}

/**
 * Author: Surendra
 * JIRA - AM214
 * Date:11-Oct-2023
 * Updated: 19-Oct-2023
 * @param {*} username
 * @param {*} input1
 * @param {*} input2
 * @param {*} input3
 * @param {*} inventoryOrgId
 * @returns
 */
async function Filter(username, input1, input2, input3, inventoryOrgId) {
  return `SELECT DELIVERY,
                PICKED_BY,
                PROMISE_DATE,
                ORDER_NUMBER,
                DATE_SCHEDULED,
                ITEM_COUNT,
                SO_DISPLAY,
                DEMAND_TYPE,
                ITEM_CATEGORY,
                CUSTOMER_NAME,
                COUNT(*) OVER () TOTAL_ROWCOUNT,
                SEQ,ROW_NUM
              FROM
              (SELECT WDV.DELIVERY_ID              DELIVERY,
                WND.ATTRIBUTE11  PICKED_BY,
              1 SEQ,
                WDV.LATEST_PICKUP_DATE       PROMISE_DATE,			
                WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                CASE 
                WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                    'SO# Multiple'
                WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                    'SO# '||WDV.SOURCE_HEADER_NUMBER
                END SO_DISPLAY,
                XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE,
              XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY,
              (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA
                WHERE HCA.PARTY_ID = HZP.PARTY_ID
                  AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME,
                DATE_SCHEDULED,
                COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM,
                WDV.CUSTOMER_ID
              FROM   WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND
              WHERE  WND.DELIVERY_ID=WDV.DELIVERY_ID
                AND CONTAINER_FLAG = 'N'
                AND SOURCE_CODE = 'OE'
                AND RELEASED_STATUS = 'S'
                AND WND.ATTRIBUTE11 = upper('${username}')
                AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
                AND 'SELF' = UPPER('${input1}')
              GROUP  BY WDV.DELIVERY_ID,
                  WND.ATTRIBUTE11,
                  WDV.LATEST_PICKUP_DATE,
                  SOURCE_HEADER_NUMBER,
                  DATE_REQUESTED,
                  DATE_SCHEDULED,WDV.CUSTOMER_ID
              UNION
              SELECT WDV.DELIVERY_ID              DELIVERY,
                'Ready to be picked'   PICKED_BY,
              2  SEQ,
                WDV.LATEST_PICKUP_DATE       PROMISE_DATE,			
                WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                CASE 
                WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                    'SO# Multiple'
                WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                    'SO# '||WDV.SOURCE_HEADER_NUMBER
                END SO_DISPLAY,
                XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE,
              XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY,
              (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA
                WHERE HCA.PARTY_ID = HZP.PARTY_ID
                  AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME,
                DATE_SCHEDULED,
                COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM,
                WDV.CUSTOMER_ID
              FROM   WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND
              WHERE  WND.DELIVERY_ID=WDV.DELIVERY_ID
                AND CONTAINER_FLAG = 'N'
                AND SOURCE_CODE = 'OE'
                AND RELEASED_STATUS = 'S' 
                AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
                AND WND.ATTRIBUTE11 IS NULL
                AND 'AVAILABLE' = UPPER('${input2}')
                AND ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE1
              FROM FND_LOOKUP_VALUES_VL FLV,
                    XXMB_INV_ORG_V XX
              WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                AND FLV.ENABLED_FLAG = 'Y'
                AND FLV.LOOKUP_CODE = XX.INV_ORG_CODE
                AND SUBSTR(XX.INVENTORY_ORGANIZATION_NAME,1,3) = 'RAD'
                AND XX.INV_ORG_ID = ${inventoryOrgId}),(SELECT ATTRIBUTE1
              FROM FND_LOOKUP_VALUES_VL FLV
              WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                AND FLV.ENABLED_FLAG = 'Y'
                AND FLV.MEANING = 'ALL'))
              GROUP  BY WDV.DELIVERY_ID,
                  WND.ATTRIBUTE11,
                  WDV.LATEST_PICKUP_DATE,
                  SOURCE_HEADER_NUMBER,
                  DATE_REQUESTED,
                  DATE_SCHEDULED,WDV.CUSTOMER_ID
              UNION
              SELECT WDV.DELIVERY_ID              DELIVERY,
                WND.ATTRIBUTE11 PICKED_BY,
                3  SEQ,
                WDV.LATEST_PICKUP_DATE       PROMISE_DATE,			
                WDV.SOURCE_HEADER_NUMBER     ORDER_NUMBER,
                CASE 
                WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) > 1 THEN
                    'SO# Multiple'
                WHEN COUNT(DISTINCT WDV.SOURCE_HEADER_NUMBER) OVER (PARTITION BY WDV.DELIVERY_ID ) = 1 THEN
                    'SO# '||WDV.SOURCE_HEADER_NUMBER
                END SO_DISPLAY,
                XX_DEMAND_TYPE_CATEGORY_FUNC('DEMAND',WDV.DELIVERY_ID,${inventoryOrgId}) DEMAND_TYPE,
              XX_DEMAND_TYPE_CATEGORY_FUNC('CATEGORY',WDV.DELIVERY_ID,${inventoryOrgId}) ITEM_CATEGORY,
              (SELECT UPPER(SUBSTR(HZP.PARTY_NAME,1,4)) FROM HZ_PARTIES HZP, HZ_CUST_ACCOUNTS HCA
                WHERE HCA.PARTY_ID = HZP.PARTY_ID
                  AND HCA.CUST_ACCOUNT_ID = WDV.CUSTOMER_ID) CUSTOMER_NAME,
                DATE_SCHEDULED,
                COUNT(WDV.SOURCE_LINE_ID) ITEM_COUNT,
                ROW_NUMBER() OVER(ORDER BY NVL(WDV.DATE_REQUESTED,WDV.DATE_SCHEDULED)) ROW_NUM,
                WDV.CUSTOMER_ID
              FROM   WSH_DELIVERABLES_V WDV, WSH_NEW_DELIVERIES WND
              WHERE  WND.DELIVERY_ID=WDV.DELIVERY_ID
                AND CONTAINER_FLAG = 'N'
                AND SOURCE_CODE = 'OE'
                AND RELEASED_STATUS = 'S' 
                AND WDV.ORGANIZATION_ID = ${inventoryOrgId}
                AND WND.ATTRIBUTE11 IS NOT NULL AND WND.ATTRIBUTE11 <> upper('${username}')
                AND 'OTHERS' = UPPER('${input3}')
                AND ROWNUM BETWEEN 0 AND NVL((SELECT ATTRIBUTE1
              FROM FND_LOOKUP_VALUES_VL FLV,
                    XXMB_INV_ORG_V XX
              WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                AND FLV.ENABLED_FLAG = 'Y'
                AND FLV.LOOKUP_CODE = XX.INV_ORG_CODE
                AND SUBSTR(XX.INVENTORY_ORGANIZATION_NAME,1,3) = 'RAD'
                AND XX.INV_ORG_ID = ${inventoryOrgId}),(SELECT ATTRIBUTE1
              FROM FND_LOOKUP_VALUES_VL FLV
              WHERE FLV.LOOKUP_TYPE = 'XXMB_OUTBOUND_TILES_RECORDS' 
                AND FLV.ENABLED_FLAG = 'Y'
                AND FLV.MEANING = 'ALL'))
              GROUP  BY WDV.DELIVERY_ID,
                  WND.ATTRIBUTE11,
                  WDV.LATEST_PICKUP_DATE,
                  SOURCE_HEADER_NUMBER,
                  DATE_REQUESTED,
                  DATE_SCHEDULED,WDV.CUSTOMER_ID)
              ORDER BY SEQ,ROW_NUM`;
}

async function SearchBySalesOrder(sonumber, inventoryOrgId) {
  return `SELECT DISTINCT WDV.SOURCE_HEADER_NUMBER ORDER_NUMBER FROM WSH_DELIVERABLES_V WDV WHERE CONTAINER_FLAG = 'N' AND SOURCE_CODE = 'OE' AND RELEASED_STATUS = 'S' AND WDV.SOURCE_HEADER_NUMBER LIKE NVL('%'|| ${sonumber} || '%',WDV.SOURCE_HEADER_NUMBER) AND WDV.ORGANIZATION_ID = ${inventoryOrgId}`;
}

async function SearchByItemDescription(itemDescription, inventoryOrgId) {
  return `SELECT DISTINCT WDV.ITEM_DESCRIPTION FROM WSH_DELIVERABLES_V WDV WHERE CONTAINER_FLAG = 'N' AND SOURCE_CODE = 'OE' AND RELEASED_STATUS = 'S' AND WDV.ITEM_DESCRIPTION LIKE NVL('%'|| '${itemDescription}' || '%',WDV.ITEM_DESCRIPTION) AND WDV.ORGANIZATION_ID = ${inventoryOrgId}`;
}

async function SearchByDeliveryId(deliveryId, inventoryOrgId) {
  return `SELECT DISTINCT WDV.DELIVERY_ID DELIVERY FROM WSH_DELIVERABLES_V WDV WHERE CONTAINER_FLAG = 'N' AND SOURCE_CODE = 'OE' AND RELEASED_STATUS = 'S' AND WDV.DELIVERY_ID LIKE NVL('%'|| ${deliveryId} || '%',WDV.DELIVERY_ID) AND WDV.ORGANIZATION_ID = ${inventoryOrgId}`;
}

const Pick = {
  PickList,
  Search,
  Filter,
  SearchBySalesOrder,
  SearchByItemDescription,
  SearchByDeliveryId,
};

module.exports = Pick;

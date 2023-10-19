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
  return `SELECT 
                    DELIVERY_ID,
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
                  ORDER BY SEQ,ROW_NUM`;
}

const Pack = {
  Dashboard,
  List,
};
module.exports = Pack;

async function Dashboard(inventoryOrgId) {
  return `SELECT (SELECT COUNT(DISTINCT DELIVERY_ID) TOTAL FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId}) TOTAL, (SELECT COUNT(DISTINCT DELIVERY_ID) TOTAL FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId}) IN_PROCESS, (SELECT COUNT(DISTINCT WDV.DELIVERY_ID) FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId} AND WDV.DELIVERY_ID NOT IN (SELECT DISTINCT WDV.DELIVERY_ID FROM WSH_DELIVERABLES_V WDV WHERE WDV.SOURCE_CODE = 'OE' AND WDV.PARENT_CONTAINER_INSTANCE_ID IS NOT NULL AND WDV.CONTAINER_FLAG = 'N' AND WDV.RELEASED_STATUS = 'Y' AND WDV.ORGANIZATION_ID = ${inventoryOrgId})) READY_FOR_PACK FROM DUAL`;
}

const Pack = {
  Dashboard,
};
module.exports = Pack;

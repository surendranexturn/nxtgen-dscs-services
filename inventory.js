/**
 * Get Tiles Based on inventory org id
 * Input : username, inventoryOrgId
 */
async function LoadTilesBasedOnInventoryOrg(username, inventoryOrgId) {
  return `SELECT DISTINCT FR.MEANING TILE, FR.LOOKUP_CODE FROM FND_COMPILED_MENU_FUNCTIONS cmf, FND_FORM_FUNCTIONS ff, FND_FORM_FUNCTIONS_TL ffl, FND_RESPONSIBILITY r, FND_RESPONSIBILITY_VL rtl, apps.FND_APPLICATION faa, apps.FND_USER_RESP_GROUPS fug, apps.FND_USER usr, xxmb_inv_org_v xx, (SELECT tag, MEANING, DESCRIPTION, LOOKUP_CODE FROM FND_LOOKUP_VALUES_VL WHERE lookup_type = 'XXMB_FUNC_TILE_MAP' AND ENABLED_FLAG = 'Y') FR WHERE 1 = 1 AND cmf.FUNCTION_ID = ff.FUNCTION_ID AND FR.tag = FF.FUNCTION_ID AND r.MENU_ID = cmf.MENU_ID AND rtl.RESPONSIBILITY_ID = r.RESPONSIBILITY_ID AND cmf.GRANT_FLAG = 'Y' AND ff.FUNCTION_ID = ffl.FUNCTION_ID AND faa.APPLICATION_ID(+) = r.APPLICATION_ID AND fug.RESPONSIBILITY_ID = r.RESPONSIBILITY_ID AND usr.USER_ID = fug.USER_ID AND r.END_DATE IS NULL AND rtl.END_DATE IS NULL AND ffl.FUNCTION_ID NOT IN (SELECT ACTION_ID FROM APPLSYS.FND_RESP_FUNCTIONS frfi WHERE frfi.RESPONSIBILITY_ID = rtl.RESPONSIBILITY_ID) AND rtl.END_DATE IS NULL AND rtl.version = 'M' AND usr.user_id = (SELECT user_id FROM fnd_user WHERE UPPER(user_name) = UPPER('${username}')) AND (SELECT PROFILE_OPTION_VALUE FROM FND_PROFILE_OPTION_VALUES WHERE PROFILE_OPTION_ID = (SELECT PROFILE_OPTION_ID FROM FND_PROFILE_OPTIONS WHERE PROFILE_OPTION_NAME = 'DEFAULT_ORG_ID') AND LEVEL_VALUE_APPLICATION_ID = faa.application_id AND LEVEL_VALUE = rtl.RESPONSIBILITY_ID) = xx.ORG_ID AND xx.INV_ORG_ID = ${inventoryOrgId} ORDER BY FR.LOOKUP_CODE`;
}

/**
 * List Inventory Orgs
 */
async function ListInventoryOrgs(orgs) {
  return `select ORG_ID , INV_ORG_ID ,  '('||INV_ORG_CODE||') '||INVENTORY_ORGANIZATION_NAME INVENTORY_ORGANIZATION_NAMES,COLOR from XXMB_INV_ORG_V where org_id IN (${orgs})`;
}

const Inventory = {
  LoadTilesBasedOnInventoryOrg,
  ListInventoryOrgs,
};

module.exports = Inventory;

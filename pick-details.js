const { transformArrayToKey } = require("./conversion");
const Db = require("./db");
const PickDetailsQueries = require("./queries/pick-details");
const Utils = require("./utils");

/**
 *  Author: surendra
 * Created on 18-Oct-2023
 * @param {*} deliveryId
 * @param {*} inventoryOrgId
 * @returns count of SO lines and Requested quantity
 */
async function CountBasedonDeliveryId(deliveryId, inventoryOrgId, source = Utils.DB_SOURCES.EBS) {
  try {
    return Db.ExecuteSqlQuery(source, PickDetailsQueries.CountBasedonDeliveryId(deliveryId, inventoryOrgId));
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 * Author: surendra
 * Created on 18-Oct-2023
 * @param {*} deliveryId
 * @param {*} inventoryOrgId
 * @returns SO details based  the inventory and delivery number
 */
async function DeliveryDetails(deliveryId, inventoryOrgId, source = Utils.DB_SOURCES.EBS) {
  try {
    return Db.ExecuteSqlQuery(source, PickDetailsQueries.DeliveryDetails(deliveryId, inventoryOrgId));
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}
/**
 * Author: surendra
 * Created on 18-Oct-2023
 * @param {*} deliveryId
 * @param {*} inventoryOrgId
 * @param {*} itemDesc
 * @returns SO details based on the Itemdesc mapping to the inventory and delivery number
 */

async function Search(deliveryId, inventoryOrgId, itemDesc, source = Utils.DB_SOURCES.EBS) {
  try {
    return Db.ExecuteSqlQuery(source, PickDetailsQueries.Search(inventoryOrgId, deliveryId, itemDesc));
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} soLineId
 * @param {*} source
 * @returns
 */
async function SourceSubInventoryDetails(
  inventoryOrgId,
  soLineId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.SourceSubInventoryDetails(inventoryOrgId, soLineId)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}
/**
 *
 * @param {*} inventoryOrgId
 * @param {*} source
 * @returns
 */
async function DestinationSubInventoryDetails(
  inventoryOrgId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.DestinationSubInventoryDetails(inventoryOrgId)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} subinventory
 * @param {*} palletVal
 * @param {*} source
 * @returns
 */
async function PalleteLOV(
  inventoryOrgCode,
  palletVal,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.PalleteLOV(inventoryOrgCode, palletVal)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 * CageLOV
 * @param {*} inventoryOrgId
 * @param {*} subinventory
 * @param {*} palletVal
 * @param {*} cageVal
 * @param {*} source
 * @returns
 */
async function CageLOV(
  inventoryOrgCode,
  palletVal,
  cageVal,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.CageLOV(inventoryOrgCode, palletVal, cageVal)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 * Tote LoV
 * @param {*} inventoryOrgId
 * @param {*} subinventory
 * @param {*} palletVal
 * @param {*} cageVal
 * @param {*} toteVal
 * @param {*} source
 * @returns
 */
async function ToteLOV(
  inventoryOrgCode,
  palletVal,
  cageVal,
  toteVal,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.ToteLOV(inventoryOrgCode, palletVal, cageVal, toteVal)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 * Lookup for Pallet, Cage & Tote
 * @param {*} inventoryOrgId
 * @param {*} palletVal
 * @param {*} cageVal
 * @param {*} toteVal
 * @param {*} source
 * @returns
 */
async function PickupLookupPalletCageTote(
  inventoryOrgCode,
  palletVal,
  cageVal,
  toteVal,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.PickupLookupPalletCageTote(inventoryOrgCode, palletVal, cageVal, toteVal)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} soNumber
 * @param {*} source
 * @returns
 */
async function GetLinesCountBasedOnSO(
  inventoryOrgId,
  soNumber,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.GetLinesCountBasedOnSO(inventoryOrgId, soNumber)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} soNumber
 * @param {*} source
 * @returns
 */
async function GetSoLinesDetails(
  inventoryOrgId,
  soNumber,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.GetSoLinesDetails(inventoryOrgId, soNumber)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} deliveryId
 * @returns
 */
async function UpdateAutoPopulateFullPickQty(
  inventoryOrgId,
  deliveryId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PickDetailsQueries.UpdateAutoPopulateFullPickQty(inventoryOrgId, deliveryId),
      {},
      true
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
};

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} deliveryId
 * @returns
 */
async function UpdateLockDeliveryQuery(deliveryId, username, source = Utils.DB_SOURCES.EBS) {
  try {
    return Db.ExecuteSqlQuery(source, PickDetailsQueries.UpdateLockDeliveryQuery(deliveryId, username), [username, username, deliveryId], true);
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
};

/**
 *
 * @param {*} inventoryOrgId
 * @param {*} deliveryId
 * @returns
 */
async function ExceptionList(source = Utils.DB_SOURCES.EBS) {
  try {
    return Db.ExecuteSqlQuery(source, PickDetailsQueries.ExceptionList());
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
};

const PickDetails = {
  CountBasedonDeliveryId,
  DeliveryDetails,
  Search,
  SourceSubInventoryDetails,
  DestinationSubInventoryDetails,
  PalleteLOV,
  CageLOV,
  ToteLOV,
  GetLinesCountBasedOnSO,
  GetSoLinesDetails,
  UpdateAutoPopulateFullPickQty,
  PickupLookupPalletCageTote,
  UpdateLockDeliveryQuery,
  ExceptionList
};
module.exports = PickDetails;

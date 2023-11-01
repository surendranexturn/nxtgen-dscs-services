const { transformArrayToKey } = require("./conversion");
const Db = require("./db");
const PackQueries = require("./queries/pack");
const Utils = require("./utils");
const oracledb = require("oracledb");

/**
 * Show the count of the pack dashboard query
 * @param {*} inventoryOrgId
 * @returns
 */
async function Dashboard(inventoryOrgId, source = Utils.DB_SOURCES.EBS) {
  try {
    return Db.ExecuteSqlQuery(source, PackQueries.Dashboard(inventoryOrgId));
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

//Pack List Screen
/**
 * Released status = 'Y' if the status is Y means ready for packaging
 */
async function List(inventoryOrgId, source = Utils.DB_SOURCES.EBS) {
  try {
    return Db.ExecuteSqlQuery(source, PackQueries.List(inventoryOrgId));
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 * Author Surendra
 * Created on 20-Oct-23
 * @param {*} inventoryOrgId
 * @param {*} sonumber
 * returns as sql query
 */
async function SearchBySONumber(
  sonumber,
  inventoryOrgId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    const result = await Db.ExecuteSqlQuery(
      source,
      PackQueries.SearchBySONumber(),
      { sonumber, inventoryOrgId }
    );
    return transformArrayToKey(result);
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 * * Author Surendra
 * Created on 20-Oct-23
 * @param {*} deliveryId
 * @param {*} inventoryOrgId
 * @returns sql query
 */
async function SearchByDeliveryId(
  deliveryId,
  inventoryOrgId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    const result = await Db.ExecuteSqlQuery(
      source,
      PackQueries.SearchByDeliveryId(),
      { deliveryId, inventoryOrgId }
    );
    return transformArrayToKey(result);
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
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
  source = Utils.DB_SOURCES.EBS
) {
  try {
    const result = await Db.ExecuteSqlQuery(
      source,
      PackQueries.SearchByDestinationLocator(),
      { inventoryOrgId, srchSegment }
    );
    return transformArrayToKey(result);
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

/**
 * Author Surendra
 * Created on 20-Oct-23
 * @param {DL(Deliveryid), SO(SalesOrder), SM(Segment)} searchType
 * @param {*} searchValue
 * @param {*} inventoryOrgId
 * @returns  sql Query
 */
async function Search(
  deliveryId,
  sonumber,
  srchSegment,
  inventoryOrgId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PackQueries.Search(sonumber, deliveryId, srchSegment, inventoryOrgId)
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
 * Author Surendra
 * @param {INPROCESS(Pack In Process)} inporcess
 * @param {AVAILABLE(Open for packing)} packing
 * @param {*} inventoryOrgId
 * @returns  sql query
 */
async function Filter(
  inporcess,
  packing,
  inventoryOrgId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PackQueries.Filter(inventoryOrgId, inporcess, packing)
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
 * Created Date 21-10-2023
 * @param {*} deliveryId
 * @param {*} inventoryOrgId
 * @param {*} dbConfig
 * @returns
 */
async function Detail(
  deliveryId,
  inventoryOrgId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    return Db.ExecuteSqlQuery(
      source,
      PackQueries.Detail(inventoryOrgId, deliveryId)
    );
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}

async function CreateLPN(
  inventoryOrgId,
  containerItemId,
  source = Utils.DB_SOURCES.EBS
) {
  try {
    const params = {
      p_organization_id: inventoryOrgId, // Replace with your actual input value
      p_container_item: containerItemId, // Replace with your actual input value
      p_lpn_number: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 100,
      },
      p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 600 },
    };
    const result = await Db.ExecuteSqlQuery(
      source,
      PackQueries.GenerateLPN(),
      params,
      true
    );
    return result;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" + error }),
    };
  }
}
const Pack = {
  Dashboard,
  List,
  Search,
  SearchBySONumber,
  SearchByDeliveryId,
  SearchByDestinationLocator,
  Filter,
  Detail,
  CreateLPN,
};
module.exports = Pack;

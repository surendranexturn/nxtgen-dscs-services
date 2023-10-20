const oracledb = require("oracledb");
let connection;

async function ExecuteSqlQuery(query, dbConfig) {
  try {
    connection = await oracledb.getConnection(dbConfig);

    const queryResult = await connection.execute(query, params);

    return queryResult;
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" }),
    };
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error("Error closing the database connection:", error);
      }
    }
  }
}

const Db = {
  ExecuteSqlQuery,
};
// module.exports = Db;
module.exports = Db;

const oracledb = require("oracledb");
const Secrets = require("./secrets");
const JsonConverison = require("./conversion");
const Utils = require("./utils");

async function ExecuteSqlQuery(source, query, variables = {}) {
  let connection;
  let result;

  try {
    // Getting the DB credentials from secret manager
    const scrt = await Secrets.getSecret(Utils.DB_SOURCES_SECRET_KEY[source]);

    // DB Connection Object
    const dbConfig = {
      user: scrt?.apps_usr,
      password: scrt?.apps_pwd,
      connectString: scrt?.host + ":" + scrt?.port + "/" + scrt?.dbname,
    };

    switch (source) {
      case Utils.DB_SOURCES.EBS:
        // Getting the connection
        connection = await oracledb.getConnection(dbConfig);

        // Executing query
        result = await connection.execute(query, variables);
        break;

      default:
        break;
    }

    result= await JsonConverison.TransformToJson(result);
    result= await JsonConverison.TransObjKeysToCamelCase(result);
    return result;

  } catch (error) {
    console.log('error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" }),
    };
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

const Db = {
  ExecuteSqlQuery,
};

module.exports = Db;

const oracledb = require("oracledb");

// Set your Oracle database connection details.

// Common function for executing queries with try-catch-finally.
const executeQuery = async (query, params = [], dbConfig) => {
  let connection;

  try {
    // Get a database connection.
    connection = await oracledb.getConnection(dbConfig);

    // Execute the query with parameters.
    const result = await connection.execute(query, params);

    // Commit the transaction (if needed).
    await connection.commit();

    return result; // or result if you need more details
  } catch (error) {
    // throw new Error(`Database query error: ${error.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database error" }),
    };
  } finally {
    // Release the database connection.
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          `Error while closing the database connection: ${err.message}`
        );
      }
    }
  }
};

module.exports = {
  executeQuery,
};

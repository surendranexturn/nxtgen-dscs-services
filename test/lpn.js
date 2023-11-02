const oracledb = require("oracledb");
const dbConfig = {
  user: "apps",
  password: "devapps",
  connectString: "ec2-52-2-62-212.compute-1.amazonaws.com:1521/ebs_DEV",
};

async function runProcedure() {
  let connection;

  try {
    // Establish a connection to the Oracle Database
    connection = await oracledb.getConnection(dbConfig);

    // Define the input and output parameters
    const params = {
      p_organization_id: 6138, // Replace with your actual input value
      p_container_item: 134152, // Replace with your actual input value
      p_lpn_number: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 100,
      },
      p_error: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 600 },
    };

    // Execute the procedure
    const result = await connection.execute(
      `BEGIN 
         XXMB_GENERATE_LPN_PROC(:p_organization_id, :p_container_item, :p_lpn_number, :p_error); 
         COMMIT; 
       END;`,
      params
    );

    // The output parameters can be accessed in result.outBinds
    console.log("p_lpn_number:", result.outBinds);
    console.log("p_error:", result.outBinds);
  } catch (error) {
    console.error("Error: ", error);
  } finally {
    if (connection) {
      try {
        // Release the connection
        await connection.close();
      } catch (error) {
        console.error("Error closing the connection: ", error);
      }
    }
  }
}

runProcedure();

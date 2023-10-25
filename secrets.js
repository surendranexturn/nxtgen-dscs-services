const axios = require("axios");

async function getSecret(secretName) {
  // Set the headers
  const url = `http://localhost:2773/secretsmanager/get?secretId=${encodeURIComponent(
    secretName
  )}`;

  // Set the headers
  const headers = {
    "Content-Type": "application/json",
    "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN,
  };

  try {
    const response = await axios.get(url, { headers });
    const dbConObj = JSON.parse(response?.data?.SecretString);

    // // Handle the response here
    // console.log("Response Team---->>>:", JSON.parse(response?.data?.SecretString));

    // const dbConObj = {
    //   user: dbInfo?.apps_usr,
    //   password: dbInfo?.apps_pwd,
    //   connectString: dbInfo?.host + ":" + dbInfo?.port + "/" + dbInfo?.dbname,
    // };
    // console.log("-->>> Db Config", dbConObj);

    return dbConObj;
  } catch (error) {
    console.error("Error while getting the secret:", error);
    throw error;
  }
}

const Secrets = {
  getSecret,
};

module.exports = Secrets;

async function TransformToJson(payload) {
  const transformData = payload?.metaData;
  const payloadDataRows = payload?.rows;
  //Added Dynamic Keys Iteration Function
  let payloadData = [];
  payloadDataRows.forEach(function (item, i) {
    var obj = {};
    Object.values(transformData).map((tfd, tdfIndex) => {
      obj[tfd["name"]] = item[tdfIndex];
      payloadData.push(obj);
    });
  });
  const payloadDataResult = [...new Set(payloadData)];
  return payloadDataResult;
}

function TransObjKeysToCamelCase(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => TransObjKeysToCamelCase(item));
  }

  const camelCasedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const lowerCaseKey = key.toLowerCase();
      const camelCaseKey = lowerCaseKey.replace(/_([A-Za-z])/g, (_, letter) =>
        letter.toUpperCase()
      );

      if (typeof obj[key] === "object" && obj[key] && obj[key].toISOString) {
        // If the value is a Date object, convert it to an ISO string
        camelCasedObj[camelCaseKey] = obj[key].toISOString();
      } else {
        camelCasedObj[camelCaseKey] = TransObjKeysToCamelCase(obj[key]);
      }
    }
  }

  return camelCasedObj;
}

const EBS_SECRET_MANAGER_KEY_NAME = "ebs_dev";

function toCamelCase(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item));
  }

  if (obj instanceof Date) {
    return obj; // Return the date object as is
  }

  const camelCasedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const lowerCaseKey = key.toLowerCase();
      const camelCaseKey = lowerCaseKey.replace(/_([A-Za-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      camelCasedObj[camelCaseKey] = toCamelCase(obj[key]);
    }
  }

  return camelCasedObj;
}

const JsonConverison = {
  TransformToJson,
  TransObjKeysToCamelCase,
  EBS_SECRET_MANAGER_KEY_NAME,
  toCamelCase,
};

module.exports = JsonConverison;

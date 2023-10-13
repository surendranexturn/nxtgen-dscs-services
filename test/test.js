const Plugin = require("nxtgen-dscs-services");
const { Login } = require("nxtgen-dscs-services");

const a = Plugin.Login.LoginUserDetails("xjeevana");

console.log("User Id", Plugin.Login.GetUserId("xjeevana"));
console.log("Is user Exists", Plugin.Login.IsUserLoginExists(2806376));

console.log("IsSessionsExists", Plugin.Login.IsSessionsExists(313378920));

console.log("ArchiveUserOldLogin", Plugin.Login.ArchiveUserOldLogin(313378920));

console.log(
  "CreateNewUserSession",
  Login.CreateNewUserSession(2806376, "xjeevana")
);

async function getUserID() {
  try {
    const result = await Login.GetUserId("xjeevana");
    console.log("User ID:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

getUserID();

console.log(a);

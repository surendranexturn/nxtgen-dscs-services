const { Pack } = require("nxtgen-dscs-services");

async function searchPick() {
  try {
    const result = await Pack.List(529);
    console.log("Pick Search Result:", result);
  } catch (error) {
    console.error("Error in Pick Search:", error);
  }
}

// Call the async function to search for picks
searchPick();

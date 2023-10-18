const { PickDetails } = require("nxtgen-dscs-services");

async function searchPick() {
  try {
    const result = await PickDetails.Search(404139, 529, "BARCODE");
    console.log("Pick Search Result:", result);
  } catch (error) {
    console.error("Error in Pick Search:", error);
  }
}

// Call the async function to search for picks
searchPick();

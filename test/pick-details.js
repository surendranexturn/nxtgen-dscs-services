const { PickDetails } = require("nxtgen-dscs-services");

async function testPackFunctions() {
  try {
    const i = "In";
    const palletVal = await PickDetails.PalleteLOV(529, "In-use", i);
    console.log(palletVal, "****************");
    const linesCount = await PickDetails.GetLinesCountBasedOnSO(529, 102582);
    console.log(linesCount, "--------->>>");
    const sourceSub = await PickDetails.SourceSubInventoryDetails(529, 35378);
    console.log(sourceSub, "--------->>>");

    const destSub = await PickDetails.DestinationSubInventoryDetails(529);
    console.log(destSub, "****************");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the async function to search for picks
testPackFunctions();

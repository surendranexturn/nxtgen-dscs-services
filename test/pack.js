const { Pack } = require("nxtgen-dscs-services");

async function testPackFunctions() {
  try {
    const Dashboard = await Pack.Dashboard(6138);
    console.log("Dashboard:", JSON.stringify(Dashboard, null, 2));

    const List = await Pack.List(6138);
    console.log("List:", JSON.stringify(List, null, 2));

    const SearchBySONumber = await Pack.SearchBySONumber(102125, 6138);
    console.log("SearchBySONumber:", JSON.stringify(SearchBySONumber, null, 2));

    const SearchByDeliveryId = await Pack.SearchByDeliveryId(96, 6138);
    console.log("SearchByDeliveryId:", JSON.stringify(SearchByDeliveryId, null, 2));

    const SearchByDestinationLocator = await Pack.SearchByDestinationLocator("wsP", 6138);
    console.log("SearchByDestinationLocator:", JSON.stringify(SearchByDestinationLocator, null, 2));

    const Search = await Pack.Search(null, null, "wsP", 6138);
    console.log("Search:", JSON.stringify(Search, null, 2));

    const Filter = await Pack.Filter("INPROCESS", "AVAILABLE", 6138);
    console.log("Filter:", JSON.stringify(Filter, null, 2));

    const Detail = await Pack.Detail(499236, 6138);
    console.log("Detail:", JSON.stringify(Detail, null, 2));


  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the async function to search for picks
testPackFunctions();

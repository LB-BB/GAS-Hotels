const LOCATION = '40.6782,-73.9442' // Latitude and Longitude for Brooklyn
const RADIUS = 5000 // Search within 5 km radius
const TYPE = 'lodging' // Type for hotels
const API_URL = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${LOCATION}&radius=${RADIUS}&type=${TYPE}&key=${returnKey()}`
const SHEET_NAME = 'Hotels'
const HEADER_RANGE = "A1:C1"
const HEADERS = ["Name", "Rating", "Address"]
const DATA_START_COL_ID = 1
const FILEDATA_RANGE = "A3:A"

function onOpen() {
  let ui = SpreadsheetApp.getUi()
  ui.createMenu('Get Hotels')
    .addItem('Get Hotels', 'getHotels')
    .addToUi()
}

function filterEmpty(value){
  return value[0] != ""
}

function getHotels() {
  Logger.log("Sending GET request to : "+API_URL)
  let response = UrlFetchApp.fetch(API_URL)
  if(response.getResponseCode() == 200){
    if(response.length != 0){
      let jsonContent = JSON.parse(response.getContentText())
      
      let sheetData = []
      let spreadSheet = SpreadsheetApp.getActiveSpreadsheet()
      let hotelSheet = spreadSheet.getSheetByName(SHEET_NAME)
      if(hotelSheet == null){
        // Create the Hotel sheet if it does not exist
        hotelSheet = spreadSheet.insertSheet(SHEET_NAME)
        hotelSheet.getRange(HEADER_RANGE).setValues([HEADERS])
      }else{
        // Read the existing data from the Hotel sheet if it exists
        let sheetData = hotelSheet.getRange(FILEDATA_RANGE).getValues()
        sheetData = sheetData.filter(filterEmpty)
      }

      let processedData = []

      jsonContent.results.forEach(function(record){
        processedData.push([record["name"],record["rating"], record["vicinity"]])
      })

      Logger.log(processedData)

      if(processedData.length != 0){
        hotelSheet.getRange(
          sheetData.length+2,
          DATA_START_COL_ID,
          processedData.length,
          processedData[0].length
        ).setValues(processedData)
      }
    }
  }
}
/**
 * Draws a menu with dev tools
 */
function drawDevToolMenu() {
  ui.createMenu("Dev menu")
    .addItem("redraw this", "drawDevToolMenu")
    .addItem("Update meet the units thing", "drawAllUnits")
  .addToUi()
}
/**
 * Fills the Meet the Units sheet with all the units
 */
function drawAllUnits () {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Meet The Units")

  //Number of each pool and the row you are placing units in
  let number = 1

  for (let pool of shopPools) {
    sheet.getRange(number, 1).setValue("Pool "+ number)
    //Column you are placing units in
    let number2 = 2
    
    for (let unit of pool) {
      sheet.getRange(number, number2).setValue(unit.name + " - \n" + unit.text)
      number2 +=1
    }
    number +=1
  }
  field.getRange("a1").getValue()
}
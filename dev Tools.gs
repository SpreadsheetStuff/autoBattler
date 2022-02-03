function drawDevToolMenu() {
  ui.createMenu("Dev menu")
    .addItem("redraw this", "drawDevToolMenu")
    .addItem("Update meet the units thing", "drawAllUnits")
  .addToUi()
}
function drawAllUnits () {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Meet The Units")
  let number = 1
  for (let pool of shopPools) {
    sheet.getRange(number, 1).setValue("Pool "+ number)
    let number2 = 2
    for (let unit of pool) {
      sheet.getRange(number, number2).setValue(unit.name + " - \n" + unit.text)
      number2 +=1
    }
    number +=1
  }
  field.getRange("a1").getValue()
}
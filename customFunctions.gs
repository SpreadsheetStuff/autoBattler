function sell() {
  var player = findPlayer()
  player.loadUnits()
  var column = getFieldColumn(player.number, SpreadsheetApp.getSelection().getCurrentCell().getColumn())
  let unit = player.findUnit(column)
  if (unit) {
    unit.sell()
  }
  player.saveUnits()
}

function moveCustomFunction() {
  var player = findPlayer()
  player.loadUnits()
  var column = getFieldColumn(player.number, SpreadsheetApp.getSelection().getCurrentCell().getColumn())
  let unit = player.findUnit(column)
  if (!unit) {
    return
  }
  let response = parseInt(ui.prompt("To which column? (1-5, 1 being the right)").getResponseText())
  if (!response) {
    return
  }
  if (typeof response != "number" || 5 < response || response < 1) {
    return
  }
  response = 6 - response
  if (player.number == 2) {
    response = 11 - response
  }
  if (selectionValid() && response != column) {
    field.getRange(1,unit.column,2).setValue("")
    if (player.findUnit(response)) {
      player.deleteUnit(unit)
      player.advanceAllUnitsOnceTo(column, response)
      player.units.push(unit)
    }
    unit.column = response
    unit.update()
  }
  player.saveUnits()
}

function u1() {
  let shop = findPlayer().shop
  shop.load()
  findPlayer().buy(shop.unitTypes[0])
}
function u2() {
  let shop = findPlayer().shop
  shop.load()
  findPlayer().buy(shop.unitTypes[1])
}
function u3() {
  let shop = findPlayer().shop
  shop.load()
  findPlayer().buy(shop.unitTypes[2])
}
function u4() {
  let shop = findPlayer().shop
  shop.load()
  findPlayer().buy(shop.unitTypes[3])
}
function u5() {
  let shop = findPlayer().shop
  shop.load()
  findPlayer().buy(shop.unitTypes[4])
}

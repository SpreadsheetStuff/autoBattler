function selectionValid(cell) {
  const selectedColumnRelative = cell.getColumn() - 4

  if (9 < selectedColumnRelative || selectedColumnRelative < 1) {
    return false
  }
  if (cell.getRow() > 8 && cell.getRow() != 2) {
    return false
  }
  return true
}
function getFieldColumn(playerNum, x){
  const selectedColumnRelative = (x - 3)/2
  if (playerNum == 1) {
    var y = selectedColumnRelative
  } else {
    var y = 11 - selectedColumnRelative
  }
  return y
}

// OnEdit/Open/etc
  function onOpen() {
    drawMenus()
  }
function drawMenus () {
  var turnMenu = ui.createMenu("Turn")
    .addItem("End Turn", "endTurn")
  turnMenu.addToUi()
  drawGameMenu()
}
function drawGameMenu() {
  if (properties.getProperty("ability pools")) {
    var abilityPools = JSON.parse(properties.getProperty("ability pools"))
  } else {
    var abilityPools = [true, true, true]
    properties.setProperty("ability pools", JSON.stringify(abilityPools))
  }

  let abilityPoolMenu = ui.createMenu("Shop pools")
  for (let poolIdx in abilityPools) {
    let pool = abilityPools[poolIdx]
    if (pool){
      abilityPoolMenu.addItem("Disable Shop Pool #" + (parseInt(poolIdx) + 1), "disablePool" + (parseInt(poolIdx) + 1))
    } else {
      abilityPoolMenu.addItem("Enable Shop Pool #" + (parseInt(poolIdx) + 1), "enablePool" + (parseInt(poolIdx) + 1))
    }
  }
  abilityPoolMenu.addItem("Enable All Shop Pools", "enableAllPools")
  var gameMenu = ui.createMenu("Game")
    .addItem("do nothing", "doNothing")
    .addItem('Reset','reset')
    .addSubMenu(abilityPoolMenu
    )
    .addItem("Redraw this menu", "drawMenus")
  gameMenu.addToUi()
}
function reset() {
  field.getRange("a1:j2").setValue("")
  gameInfo.getRange("b2").setValue("1")
  gameInfo.getRange("c2:e3").setValue("0")
  gameInfo.getRange("f2:g2").setValue("2")

  let pools = properties.getProperty("ability pools")

  properties.deleteAllProperties()

  properties.setProperty("ability pools", pools)
  properties.setProperty("player1 money", 2)
  properties.setProperty("player2 money", 2)
  p1Shop.generateShop()
  p2Shop.generateShop()
  p1Shop.save()
  p2Shop.save()
}
//

function findPlayer(){
  for (player of game.players) {
    if (player.activeSheet.getSheetName() == SpreadsheetApp.getActiveSheet().getSheetName()) {
      return player
    }
  }
}


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
    var movementMenu = ui.createMenu("Turn")
        /*.addItem("Move All to Selected Cell","moveAllToSelect")
        .addItem("Move Selected Right","right")
        .addItem("Move Selected Left","left")
        .addItem("Attack Selected","attackInput")*/
        .addItem("End Turn", "endTurn")
    movementMenu.addToUi()

    var gameMenu = ui.createMenu("Game")
      .addItem("do nothing", "doNothing")
      .addItem('Reset','reset')
    gameMenu.addToUi()
  }
   
function reset() {
  field.getRange("a1:j2").setValue("")
  gameInfo.getRange("b2").setValue("1")
  gameInfo.getRange("c2:e3").setValue("0")
  gameInfo.getRange("f2:g2").setValue("2")
  properties.deleteAllProperties()
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


/**
 * Returns whether a cell falls within the range that units can be placed in.
 * @param {SpreadsheetApp.Range} cell 
 * @returns {Boolean}
 */
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
/**
 * ---
 * Converts a column number in the ui to its corresponding column in the game.
 * 
 * Example when player 1 is selecting the "I"/9th column
 * ```
 * let selectedColumn = 9
 * let playerNum = 1
 * 
 * Logger.log(getFieldColumn(playerNum, column))
 * //Logs "3" 
 * //(From p1s perspective the I column is column 3)
 * ```
 * @param {number} playerNum The number of the player who the cell was selected by
 * @param {number} column The column selected
 * @returns {number} The column that column corresponds to in the data model and game.
 */

function getFieldColumn(playerNum, column){
  //Scale because the columns are 2 wide
  const selectedColumnRelative = (column - 3)/2

  //Adjust because p2 sees a reflection of what is in the data model
  if (playerNum == 1) {
    var y = selectedColumnRelative
  } else {
    var y = 11 - selectedColumnRelative
  }
  return y
}

/**
 * Runs on open but can't be called so it doesn't really need documentation.
 */
function onOpen() {
  drawMenus()
}

/**
 * Draws both the "Turn" and "Game" Menus 
 */
function drawMenus () {
  var turnMenu = ui.createMenu("Turn")
    .addItem("End Turn", "endTurn")
  turnMenu.addToUi()

  drawGameMenu()
}

/**
 * Draws specifically the "Game" menu
 */
function drawGameMenu() {
  //Checks if there are any shop pool prefrences saved
  //Creates a variable that is either that prefrence or the default prefrence
  if (properties.getProperty("ability pools")) {
    var abilityPools = JSON.parse(properties.getProperty("ability pools"))
  } else {
    var abilityPools = [true, true, true]
    //Saves the default prefrence as your normal preference 
    properties.setProperty("ability pools", JSON.stringify(abilityPools))
  }

  //Creates an empty menu that will be used as the shop pool configuration sub-menu
  let abilityPoolMenu = ui.createMenu("Shop pools")

  //Loops through the prefrences and creates a button to toggle each preference
  for (let poolIdx in abilityPools) {
    let pool = abilityPools[poolIdx]
    /*
    For each shop pool, there is a function titled disablePool< that shop pool's number> and enablePool<shop pool number>
    
    If a shop pool is enabled, then this would add a menu item to disable(Pool<it's number>) it and vice versa
    */
    if (pool){
      abilityPoolMenu.addItem("Disable Shop Pool #" + (parseInt(poolIdx) + 1), "disablePool" + (parseInt(poolIdx) + 1))
    } else {
      abilityPoolMenu.addItem("Enable Shop Pool #" + (parseInt(poolIdx) + 1), "enablePool" + (parseInt(poolIdx) + 1))
    }
  }
  abilityPoolMenu.addItem("Enable All Shop Pools", "enableAllPools")

  //Creates the full game menu 
  let gameMenu = ui.createMenu("Game")
    //this is here to prevent you from miss-clicking and reseting when trying to end your turn
    .addItem("do nothing", "doNothing")
    .addItem('Reset','reset')
    .addSubMenu(abilityPoolMenu)
    .addItem("Redraw this menu", "drawMenus")
  gameMenu.addToUi()
}

/**
 * Clears all properties relating to the game and resets the view
 */
function reset() {
  let pools = properties.getProperty("ability pools")
  properties.deleteAllProperties()
  // Stops the ability pool prefrences from getting deleted
  properties.setProperty("ability pools", pools)

  // Sets money to what it starts at each game
  properties.setProperty("player1 money", 2)
  properties.setProperty("player2 money", 2)
  gameInfo.getRange("f2:g2").setValue("2")
  
  //Clears the units from the field
  field.getRange("a1:j2").setValue("")
  //Sets round number
  gameInfo.getRange("b2").setValue("1")
  /*Resets:
    C2: Whether to hide each player's units from their opponent
    D2:E3: Wins and Winstreak
    C3 so i didn't have to change the range twice /shrug
  */
  gameInfo.getRange("c2:e3").setValue("0")
  
  //Generates and saves shops
  p1Shop.generateShop()
  p2Shop.generateShop()

  p1Shop.save()
  p2Shop.save()
}

/**
 * Finds out which player's sheet a user is viewing
 * @returns {Player} that player
 */
function findPlayer(){
  for (player of game.players) {
    if (player.activeSheet.getSheetName() == SpreadsheetApp.getActiveSheet().getSheetName()) {
      return player
    }
  }
}


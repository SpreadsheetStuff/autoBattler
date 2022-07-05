/**
 * Sells the unit the user is selecting
 */
function sell() {
  let player = findPlayer()
  player.loadUnits()

  //Column selected by the user
  const column = getFieldColumn(player.number, SpreadsheetApp.getSelection().getCurrentCell().getColumn())

  let unit = player.findUnit(column)
  //Checks if the player has a unit in that column
  if (unit) {
    unit.sell()
  }
  player.saveUnits()
}
/**
 * Moves the unit a user is selecting to a column they input through a ui.
 */
function moveCustomFunction() {
  let player = findPlayer()
  player.loadUnits()

  //Column selected by the user'
  const selectedCell = SpreadsheetApp.getCurrentCell()
  const column = getFieldColumn(player.number, selectedCell.getColumn())
  let unit = player.findUnit(column)

  //Checks that the user is selecting a unit
  if (!unit) {
    return
  }
  //Checks if the user selected a unit they can move
  if (!selectionValid(selectedCell)){
    return
  }

  //Creates a prompt to find out what column the user wants to move their unit to
  let response = parseInt(ui.prompt("To which column? (1-5, 1 being the right)").getResponseText())
  //Checks if they responded
  if (!response) {
    return
  }
  //Checks if their response is a valid column
  if (typeof response != "number" || 5 < response || response < 1) {
    return
  }
  //Flips their response to be the same as it is in the data model
  response = 6 - response
  if (player.number == 2) {
    response = 11 - response
  }
  //Checks if the use is trying to move a unit to where it already is
  if (response == column) {
    return
  }
  //Removes the unit from the view because the unit doesn't it's older self on redraw
  field.getRange(1,unit.column,2).setValue("")
  //Checks if a unit is in the way
  if (player.findUnit(response)) {
    //Temporarily deletes the unit you want to move
    player.deleteUnit(unit)
    //Advances the rest of the units towards where the moving unit was
    player.advanceAllUnitsOnceTo(column, response)
    //Places the unit back in the same spot because it will be placed in the right column anyways
    player.units.push(unit)
  }
  //Moves the unit
  unit.column = response
  unit.update()

  player.saveUnits()
}

/**
 * Buys the 1/2.../5st shop upgrade
 * Goole won't let you use menu or button functions so I had to do this
 */
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

/**
 * Has a bot auto-matically buy units for p2 then end p2's turn
 */
function player2TurnBot () {
  let player2 = game.players[1]
  //Loads everything
  player2.shop.load()
  player2.loadMoney()
  player2.loadUnits()
  //Advances all units because this bot places units in columns based only off how many units it has
  player2.advanceAllUnits()
  //Saves the advancement so because when the Player class's buy function loads its units which would revert the code above
  player2.saveUnits()

  while (player2.availibleUnits > 0){
    //Finds the unit with the largest strength

    //Sets an initial unit to compare the other shop units to
    let biggestUnit = player2.shop.unitTypes[0]
    // Cycles through each unit in the shop and compares them to the initial unit
    for (const unitType of player2.shop.unitTypes) {
      if (unitType.baseAttack > biggestUnit.baseAttack) {
        biggestUnit = unitType
      }
    }
    // If there is free space the unit is just bought
    if (player2.units.length < 5) {
      player2.buyForBots(biggestUnit, 13 - player2.units.length * 2)
    } else { 
      //Otherwise this will search for a unit with lower attack and replace it
      
      let deletedAUnit = false
      for (const unit of player2.units) {
        if (unit.damage < biggestUnit.baseAttack) {
          const column = unit.column

          deletedAUnit = true
          unit.sell()
          //Save here because the boy for bots would otherwise overide the sell
          player2.saveUnits()
          player2.buyForBots(biggestUnit, 25 - column * 2)
        }
      }
      if (!deletedAUnit) {
        break
      }
    }
  }
  //Saving
  player2.saveUnits()
  player2.saveMoney()
  //Readying p2
  saveOrLoadPlayersReady(false)
  if (game.players[0].ready) {
    game.endTurn()
  } else {
    player2.ready = true
  }
  saveOrLoadPlayersReady(true)
}

/**
 * ---
 * Sets a shop pool  to true or false
 * @param {number} number The number of the shop pool you want to toggle
 * @param {boolean} toggleTo The value you want it to toggle to
 */
function togglePoolNumber(number, toggleTo){
  let abilityPools = JSON.parse(properties.getProperty("ability pools"))
  abilityPools[number - 1] = toggleTo
  //Checks that after turning that pool off there is still at least one pool that is enabled so that at all times the shop can be filled
  for (const pool of abilityPools) {
    if (pool == true) {
      properties.setProperty("ability pools", JSON.stringify(abilityPools))
      drawGameMenu()
      return
    }
  }
  ui.alert("You can't disable all the shop pools")
}
/**
 * Enables all the shop pools
 * No disable function because at least one must always be enabled 
 */
function enableAllPools () {
  properties.setProperty("ability pools", JSON.stringify([true, true, true]))
  drawGameMenu()
}
/**
 * Enable or disable the 1/2/ect.st shop pool
 * Goole won't let you use parameters for menu functions so I had to do this
 */
function enablePool1(){
  togglePoolNumber(1, true)
}
function disablePool1(){
  togglePoolNumber(1, false)
}
function enablePool2(){
  togglePoolNumber(2, true)
}
function disablePool2(){
  togglePoolNumber(2, false)
}
function enablePool3(){
  togglePoolNumber(3, true)
}
function disablePool3(){
  togglePoolNumber(3, false)
}


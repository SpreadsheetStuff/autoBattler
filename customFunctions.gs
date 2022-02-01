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
  if (selectionValid(selection = SpreadsheetApp.getSelection().getCurrentCell()) && response != column) {
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

// Shop
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

function player2TurnBot () {
  let player2 = game.players[1]
  player2.shop.load()
  player2.loadMoney()
  player2.loadUnits()
  player2.advanceAllUnits()
  player2.saveUnits()
  while (player2.availibleUnits > 0){
    let biggestUnit = player2.shop.unitTypes[0]
    if (biggestUnit.ability == freeSearch) {
      biggestUnit = player2.shop.unitTypes[1]
    }
    for (let unitType of player2.shop.unitTypes) {
      if (unitType.baseAttack > biggestUnit.baseAttack && unitType.ability != freeSearch) {
        biggestUnit = unitType
      }
    }
    if (player2.units.length < 5) {
      player2.buyForBots(biggestUnit, 13 - player2.units.length * 2)
    } else {
      let deletedAUnit = false
      for (let unit of player2.units) {
        if (unit.damage < biggestUnit.baseAttack) {
          let column = unit.column
          deletedAUnit = true
          unit.sell()
          player2.saveUnits()
          player2.buyForBots(biggestUnit, 25 - column * 2)
        }
      }
      if (!deletedAUnit) {
        break
      }
    }
  }
  player2.saveUnits()
  player2.saveMoney()
  saveOrLoadPlayersReady(false)
  if (game.players[0].ready) {
    game.endTurn()
  } else {
    player2.ready = true
  }
  saveOrLoadPlayersReady(true)
}

//Ability Pools
  function togglePoolNumber(number, toggleTo){
    let abilityPools = JSON.parse(properties.getProperty("ability pools"))
    abilityPools[number - 1] = toggleTo
    for (let pool of abilityPools) {
      if (pool == true) {
        properties.setProperty("ability pools", JSON.stringify(abilityPools))
        drawGameMenu()
        return
      }
    }
    ui.alert("You can't disable all the shop pools")
  }
  function enableAllPools () {
    properties.setProperty("ability pools", JSON.stringify([true, true, true]))
    drawGameMenu()
  }
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
//

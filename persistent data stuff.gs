/**
 * Sets both players' local money to what `PropertiesService` stored. \
 * To only load one player's money see the method `Player.loadMoney()`.
 */
function loadPlayerMoney () {
  //Checks if there is anything stored to PropertiesService
  if (properties.getProperty("player1 money")) {} else {
    return
  }
  game.players[0].availibleUnits = parseInt(properties.getProperty("player1 money"))
  game.players[1].availibleUnits = parseInt(properties.getProperty("player2 money"))
}
/**
 * Sets what `PropertiesService` stored as the money for both players to their local money. \
 * To only save one player's money `Player.saveMoney()`.
 */
function savePlayerMoney () {
  properties.setProperty("player1 money", game.players[0].availibleUnits)
  properties.setProperty("player2 money", game.players[1].availibleUnits)
}

/**
 * @param {boolean} saving Determines if this is saving or loading 
 * If saving is true:
 * - Saves whether each of the players are ready to `PropertiesService`,\
 * otherwise:
 * - Loads whether each player is ready from `PropertiesService`
 */
function saveOrLoadPlayersReady (saving) {
  //Checks if there is anything stored to PropertiesService
  if (!properties.getProperty("players ready")) {
    properties.setProperty("players ready", JSON.stringify([player1.ready, player2.ready]))
  }
  if (saving) {
    properties.setProperty("players ready", JSON.stringify([player1.ready, player2.ready]))
  } else {
    const ready = JSON.parse(properties.getProperty("players ready"))
    game.players[0].ready = ready[0]
    game.players[1].ready = ready[1]
  }
}

/**
 * Either returns the last player that won or saves a value to PropertiesService as the last player to win.
 * @param {string=} Value you want to set the property to. If this value is false (it defaults to false) this will instead return the property
 * @returns {string|void} Either the last winner or nothing
 */
function setOrGetWinner (value = false) {
  //Checks if there is anything stored to PropertiesService
  if (!properties.getProperty("winner")) {
    properties.setProperty("winner", value)
  }
  if (value) {
    properties.setProperty("winner", value)
  } else {
    return properties.getProperty("winner")
  }
}

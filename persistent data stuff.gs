//Money
function loadPlayerMoney () {
  if (properties.getProperty("player1 money")) {} else {
    return
  }
  game.players[0].availibleUnits = parseInt(properties.getProperty("player1 money"))
  game.players[1].availibleUnits = parseInt(properties.getProperty("player2 money"))
}
function savePlayerMoney () {
  properties.setProperty("player1 money", game.players[0].availibleUnits)
  properties.setProperty("player2 money", game.players[1].availibleUnits)
}
//Readied
function saveOrLoadPlayersReady (saving) {
  if (!properties.getProperty("players ready")) {
    properties.setProperty("players ready", JSON.stringify([player1.ready, player2.ready]))
  }
  if (saving) {
    properties.setProperty("players ready", JSON.stringify([player1.ready, player2.ready]))
  } else {
    let ready = JSON.parse(properties.getProperty("players ready"))
    game.players[0].ready = ready[0]
    game.players[1].ready = ready[1]
  }
}
//Winner
function setOrGetWinner (value = false) {
  if (!properties.getProperty("winner")) {
    properties.setProperty("winner", value)
  }
  if (value) {
    properties.setProperty("winner", value)
  } else {
    return properties.getProperty("winner")
  }
}

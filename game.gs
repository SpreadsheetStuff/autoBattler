//Sheets
var player1ActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Player 1/Red")
var player2ActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Player 2/Blue")
var field = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing")
var gameInfo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Misc Game Info")
//Ui and properties
var ui = SpreadsheetApp.getUi()
var properties = PropertiesService.getScriptProperties()
//Stopwatch
var stopwatch = new Stopwatch ()

class Game  {
  constructor (players, shops) {
    this.players = players
    this.round = 1
    if (!properties.getProperty("round number")) {
    properties.setProperty("round number", this.round)
    }
    this.shops = shops
  }
  //getting and setting units from properties service
  saveUnits () {
    for (let player of this.players) {
     player.saveUnits()
    }
  }
  loadUnits() {
    for (let player of this.players) {
      player.loadUnits()
    }
  }

  //Turns
  endTurn() {
    //abilities
    this.loadUnits()
    for (let player of this.players) {
      for (let unit of player.units) {
        if (unit.ability.when == "onTurnEnd") {
          unit.ability.effect(unit)
        }
      }
    }
    field.getRange("a1").getValues()
    this.saveUnits()
    //show all units
    gameInfo.getRange("c2").setValue("1")
    for (let player of this.players) {
      for (let unit of player.units) {
        if (unit.ability.when == "onBattleStart") {
          unit.ability.effect(unit)
        }
      }
    }
    field.getRange("a1").getValues()

        //Battle

    //Advancing units
    for (var player of this.players) {
      player.advanceAllUnits()
    }
    stopwatch.sleep(1)

    //variable stuff
    let player1 = this.players[0]
    let player2 = this.players[1]

    //battle loop
    while (player1.units.length > 0 && player2.units.length > 0) {
      // Variables
      this.players = [player1, player2]
      let p1FirstUnit = player1.units[0]
      let p2FirstUnit = player2.units[0]
      let firstUnits = [p1FirstUnit, p2FirstUnit]
      Logger.log("p1 units:\n" + player1.units.map(a => a.toArray()) + "\np2:\n" + player2.units.map(a => a.toArray()))

      //Attack Phase
      if (p1FirstUnit.speed > p2FirstUnit.speed) {
        for (let unit of firstUnits) {
          if (unit.health > 0) {
            let player = this.players[unit.player.number % 2]
            for (let enemyUnit of unit.attack(player.units, false)) {
              enemyUnit.update()
            }
            unit.update()
          }
        }
      } else if (p2FirstUnit.speed > p1FirstUnit.speed) {
        for (let unit of firstUnits.reverse()) {
          if (unit.health > 0) {
            let player = this.players[unit.player.number % 2]
            for (let enemyUnit of unit.attack(player.units, false)) {
              enemyUnit.update()
            }
            unit.update()
          }
        }
      } else {
        let targets = []
        for (let unit of firstUnits) {
          let player = this.players[unit.player.number % 2]
          targets.push(unit.attack(player.units, true))
        }
        for (let i in targets) {
          for (let target of targets[i]){
            if (firstUnits[i].range > 5) {
              target.takeDamage(firstUnits[i].temporaryDamage + firstUnits[i].range - 5)
            } else {
            target.takeDamage(firstUnits[i].temporaryDamage)
            }
            firstUnits[i].temporaryDamage /= 2
          }
        }
        for (let unit of firstUnits) {
          unit.update("yay")
        }
        field.getRange("a1").getValue()
        stopwatch.sleep(0.5)
      }

      //updating everything and redrawing
      for (let unit of player1.units) {
        unit.update()
      }
      for (let unit of player2.units) {
        unit.update()
      }
      field.getRange("a1").getValue()

      //advancing everything
      for (player of this.players) {
        player.advanceAllUnits()
      }
      field.getRange("a1").getValue()
    }

    //After battle stuff

    //Advancing
    for (player of this.players) {
      player.advanceAllUnits()
    }

    //Picking winner
    if (player1.units.length > 0) {
      var winner = "Player 1"
      let range = gameInfo.getRange("d2")
      range.setValue(range.getValue() + 1)
      if (properties.getProperty("latest winner") == 1) {
        gameInfo.getRange("d3").setValue(gameInfo.getRange("d3").getValue() + 1)
      } else {
        gameInfo.getRange("d3:e3").setValues([[1,0]])
      }
      properties.setProperty("latest winner", 1)
    } else if (player2.units.length > 0) {
      var winner = "Player 2"
      let range = gameInfo.getRange("e2")
      range.setValue(range.getValue() + 1)
      if (properties.getProperty("latest winner") == 2) {
        gameInfo.getRange("e3").setValue(gameInfo.getRange("e3").getValue() + 1)
      } else {
        gameInfo.getRange("d3:e3").setValues([[0,1]])
      }
      properties.setProperty("latest winner", 2)
    } else {
      var winner = "Draw"
    }
    setOrGetWinner(winner)

    //Unreadying both players and giving them more money
    this.loadUnits()
    loadPlayerMoney()
    for (let player of this.players) {
      player.availibleUnits += 2
      player.ready = false

    }
    savePlayerMoney()
    saveOrLoadPlayersReady(true)

    //Shop
    for (let shop of this.shops) {
      shop.generateShop()
    }
    
    //Round
    this.round = parseInt(properties.getProperty("round number"))
    this.round += 1
    gameInfo.getRange("b2").setValue(this.round)
    properties.setProperty("round number", this.round)
  
    //gameinfo stuff
    gameInfo.getRange("c2").setValue("0")
    gameInfo.getRange("f2").setValue(player1.availibleUnits)
    gameInfo.getRange("g2").setValue(player2.availibleUnits)
  }

  
}
//Players
var player1 = new Player(player1ActiveSheet, 1, p1Shop)
var player2 = new Player(player2ActiveSheet, 2, p2Shop)
var players = [player1, player2]

var game = new Game(players, [p1Shop, p2Shop])

//Turn End
function endTurn() {
  saveOrLoadPlayersReady(false)
  let player = findPlayer()
  player.ready = true
  let otherPlayer = game.players[player.number % 2]
  if (otherPlayer.ready == false) {
    saveOrLoadPlayersReady(true)
    ui.alert("Turn Ended", "However, Player " + otherPlayer.number + " still needs to end their turn!", ui.ButtonSet.OK)
    let previousValue = setOrGetWinner()
    while (setOrGetWinner() == previousValue) {}
    if (!properties.getProperty("players ready")) {
      return
    }
  } else {
    this.ready = true
    saveOrLoadPlayersReady(true)
    game.endTurn()
  }
  if (setOrGetWinner() == "Draw") {
    ui.alert("It's a draw :(", "It is now Round " + properties.getProperty("round number"), ui.ButtonSet.OK)
  } else {
    let outputAsArray = setOrGetWinner().split("")
    let punctuation = ""
    let noun = ""
    if (outputAsArray[outputAsArray.length - 1] == findPlayer().number) {
      punctuation = "!"
      noun = "You"
    } else {
      punctuation = " :("
      noun = setOrGetWinner()
    }
    ui.alert(noun + " won" + punctuation, "It is now Round " + properties.getProperty("round number") + "!", ui.ButtonSet.OK)
  }
}
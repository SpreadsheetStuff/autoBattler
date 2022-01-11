class UnitType {
  constructor(baseHealth, baseAttack, baseSpeed, baseRange, ability) {
    this.name = ability.name
    this.baseHealth = baseHealth
    this.baseAttack = baseAttack
    this.baseSpeed = baseSpeed
    this.baseRange = baseRange
    this.ability = ability
    if (this.ability.when == "stats") {
      this.ability.effect(this)
    }
  }
  //buying 
  static refundForUnits(player, selectedCell) {
    // Check if right place
    if (selectionValid(selectedCell) == false) {
      ui.alert("Invalid Location","Select a cell to place a unit there",ui.ButtonSet.OK)
      return [1,0]
    }

    const selectedColumn = getFieldColumn(player.number, selectedCell.getColumn())

    return [0, selectedColumn]

  }
  buyFunction(player, refundOnly, selectedCell) {
    var [refund, sColumn] = UnitType.refundForUnits(player, selectedCell)

    if (refundOnly == false) {
      player.createUnit(this, sColumn)
    }
    return refund
  }

  //to strings
  toShopString () {
    return ("HP: " + this.baseHealth +" | Strength: " + this.baseAttack + "\nSpeed: " + this.baseSpeed + " | Range: " + this.baseRange + "\nAbility: " + this.ability.text)
  }
  toArray() {
    return [this.baseHealth, this.baseAttack, this.baseSpeed, this.baseRange, this.ability.id]
  }
}
/////////////
class Unit {
  constructor (name, health, damage, speed, range, ability, column, player) {
    this.name = name
    this.health = health
    this.damage = damage
    this.speed = speed
    this.ability = ability
    this.column = column
    this.player = player
    this.range = range
    this.temporaryDamage = this.damage
  }
  static constructFromType (type, column, player) {
    var unit = new Unit(type.name, type.baseHealth, type.baseAttack, type.baseSpeed, type.baseRange, type.ability, column, player)
    if (unit.ability.when == "onBuy") {
      unit.ability.effect(unit)
    }
    return unit
  }
  static constructFromArray (array) {
    var [name, health, damage, speed, range, column, playerNum, abilityId] = array
    var unit = new Unit(name, health, damage, speed,range, abilities[abilityId], Math.floor(column), game.players[playerNum-1])
    return unit
  }

  toArray() {
    return [this.name, this.health, this.damage, this.speed, this.range, this.column, this.player.number, this.ability.id]
  }
  
  // Attacking
  attack (units, tie) {
    // target selection
    var targets = []
    for (let unit of units) {
      if (Math.abs(unit.column - this.column) <= this.range) {
        targets.push(unit)
      }
    }

    //Ability
    if (this.ability.when == "onAttack") {
      this.ability.effect(this, targets)
      //range may change so checks for that target list still works
      targets = []
      for (let unit of units) {
        if (Math.abs(unit.column - this.column) <= this.range) {
          targets.push(unit)
        }
      }
    }

    //self evident
    if (targets.length == 0) {
      return []
    }

    //hitting all targets but decreasing damage
    this.temporaryDamage = this.damage
    if (!tie) {
      this.update("yay")
      for (let target of targets) {
        if (this.range > 5) {
          target.takeDamage(this.temporaryDamage + this.range - 5)
        } else {
          target.takeDamage(this.temporaryDamage)
        }
        this.temporaryDamage /= 2
      }
      field.getRange("a1").getValue()
      stopwatch.sleep(0.5)
    }

    return targets
  }
  takeDamage(amount) {
    this.update("ow")
    amount = Math.ceil(amount)
    this.health -= amount
    if (this.ability.when == "onHurt") {
      this.ability.effect(this, amount)
    }
  }
  // Death/Updating
  update (damaged = "") {
    if (this.health <=0 && damaged == "") {
      Logger.log(damaged + "!!!!!!!!!!!!!!!!!!!!!!!")
      this.die()
      return
    }
    let infoText = field.getRange(2, this.column)
    field.getRange(1, this.column).setValue("\n" + this.name + "\n" + this.player.number)
    if (damaged == "buffed:)" || damaged == "debuffed:(") {
      infoText.setValue("HP:*"+this.health+"*Strength: "+this.damage+"\nSpeed: "+this.speed+" | Range: "+this.range+"\nAbility: "+this.ability.text+"\n\n\n\n\n\n\n"+damaged)
      return
    }
    infoText.setValue(" " + damaged + "            HP:*"+this.health+"              " + damaged + " *Strength: "+this.damage+"\nSpeed: "+this.speed+" | Range: "+this.range+"\nAbility: "+this.ability.text)
  }

  die() {
    if (this.ability.when == "onDeath") {
      this.ability.effect(this)
    }
    let enemyUnit = game.players[this.player.number % 2].units[0]
    if (enemyUnit){
      if (enemyUnit.ability.when == "onKO") {
        enemyUnit.ability.effect(enemyUnit, this)
      }
    }
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing").getRange(1, this.column, 2).setValue("")
    this.player.deleteUnit(this)
  }
  sell () {
    if (this.ability.when == "onSell") {
      this.ability.effect(this)
    }
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing").getRange(1, this.column, 2).setValue("")
    this.player.deleteUnit(this)
  }
  
  buff(stat, amount) {
    if (this.ability.when == "onBuff" && amount > 0) {
      if (this.ability.effect(stat, amount, this)) {
        return
      }
    } else if (this.ability.when == "onDebuff" && amount < 0) {
      if (this.ability.effect(stat, amount, this)) {
        return
      }
    }
    for (let unit of this.player.units) {
      if (unit.ability.when == "onOtherBuff" && amount > 0){
        unit.ability.effect(stat, amount, this, unit)
      }
    }
    amount = Math.floor(amount)
    switch (stat) {
      case "health":
        this.health += amount
        break
      case "damage":
        this.damage += amount
        break
      case "range":
        this.range += amount
        break
      case "speed":
        this.speed += amount
        break
      default:
        return
    }
    if (amount > 0){
      this.update("buffed:)")
    }
    if (amount < 0){
      this.update("debuffed:(")
    }
  }

  //Movement
  move (direction) {
    const field = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing")
    var i = 0
    switch (direction) {
      case "left" :
        i = - 1
        break
      case "right" :
        i = 1
        break
      default:
        return false
    }
    var newX = this.column + i
    if (newX < 1 || newX > 10) {
     return false
    }
    var adjacent = field.getRange(1,newX)

    if (adjacent.getValue()) {
      for (let player of game.players){
        if (player.findUnit(newX)) {
          return false
        }
      }
    }
    field.getRange(1,this.column,2).setValue("")
    this.column = newX
    this.update()
    return true
  }

  moveTo(column) {
    while (this.column != column) {
      if (this.column > column) {
         if (!this.move("left")) {
           break
         }
      } else {
        if (!this.move("right")) {
           break
         }
      }
    } 
  }
}
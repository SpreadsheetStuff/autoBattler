/**
 * Class for items in the shop
 */
class UnitType {
  /**
   * --- 
   * Constructs a new instance of the `UnitType` class\
   * Also activates abilities with a .when of "stats"
   * @param {number} baseHealth The `UnitType`'s base health
   * @param {number} baseAttack The `UnitType`'s base attack
   * @param {number} baseSpeed The `UnitType`'s base speed
   * @param {number} baseRange The `UnitType`'s base range
   * @param {Ability} ability the ability of the new `UnitType`
   */
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

  /**
   * Returns the text this UnitType has inside the shop's ui
   * @returns {string}
   */
  toShopString () {
    return "HP: " + this.baseHealth +" | Strength: " + this.baseAttack + "\nSpeed: " + this.baseSpeed + " | Range: " + this.baseRange + "\nAbility: " + this.ability.text
  }
  /**
   * Converts this UnitType's properties so they can be stored on `PropertiesService`
   * @returns {Array<number>}
   */
  toArray() {
    return [this.baseHealth, this.baseAttack, this.baseSpeed, this.baseRange, this.ability.id]
  }
}
/**
 * Unit Class
 */
class Unit {
  /**
   * --- 
   * Constructs a new instance of the `Unit` class\
   * This class also has two other constructors:
   * - Unit.constructFromType()
   * - Unit.constructFromArray()
   * @param {string} name This unit's name
   * @param {number} health The `Unit`'s health
   * @param {number} attack The `Unit`'s attack
   * @param {number} speed The `Unit`'s speed
   * @param {number} range The `Unit`'s range
   * @param {Ability} ability the of this`Unit`
   * @param {number} column What column this is in inside the "Field Thing" sheet
   * @param {Player} player What player this unit belongs to
   */
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
  /**
   * --- 
   * Constructs a new instance of the `Unit` class based of a UnitType\
   * Also, activates onBuy effects of the unit that is constructed\
   * This class also has two other constructors:
   * - new Unit()
   * - Unit.constructFromArray()
   * @param {UnitType} type The type this unit should copy its stats from.
   * @param {number} column What column this is in inside the "Field Thing" sheet.
   * @param {Player} player What player this unit belongs to.
   * @returns {Unit} The new unit
   */
  static constructFromType (type, column, player) {
    let unit = new Unit(type.name, type.baseHealth, type.baseAttack, type.baseSpeed, type.baseRange, type.ability, column, player)
    if (unit.ability.when == "onBuy") {
      unit.ability.effect(unit)
    }
    return unit
  }
  /**
   * --- 
   * Constructs a new instance of the `Unit` class based of an Array\
   * This class also has two other constructors:
   * - new Unit()
   * - Unit.constructFromType()
   * @param {Array<string>|Array<number>} array The array to create this unit based off of. The array should be made of the unit's:
   * - Name
   * - Health
   * - Speed
   * - Range
   * - Column
   * - Player's Number
   * - Ability's Id
   * @returns {Unit} The unit
   */
  static constructFromArray (array) {
    const [name, health, damage, speed, range, column, playerNum, abilityId] = array
    const unit = new Unit(name, health, damage, speed,range, abilities[abilityId], Math.floor(column), game.players[playerNum-1])
    return unit
  }
  /**
   * Converts this unit to an array that can be converted back to a unit with Unit.constructFromArray()
   * @returns {Array<string>|Array<number>}
   */
  toArray() {
    return [this.name, this.health, this.damage, this.speed, this.range, this.column, this.player.number, this.ability.id]
  }
  
  /**
   * ---
   * Attacks a unit activating on attack abilities and dealing damage.
   * @param {Array<Unit>} units The units you want this unit to attempt to attack
   * @param {boolean} tie If this is a tie (if it is this doesn't deal damage)
   * @returns {Array<Unit>} The units this succesfully attacked
   */
  attack (units, tie) {
    // Selecting targets
    let targets = []
    for (let unit of units) {
      if (Math.abs(unit.column - this.column) <= this.range) {
        targets.push(unit)
      }
    }

    //Activating on attack abilities
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
    for (let unit of game.players[2 - this.player.number].units) {
      if (unit.ability.when == "onOpponentAttack") {
        if (!unit.ability.effect(this, unit, targets)) {
          targets = []
        }
      }
    }

    if (targets.length == 0) {
      return []
    }

    this.temporaryDamage = this.damage
    if (!tie) {
      //Animating itself as gray
      this.update("yay")
      //Dealing damage to each target
      for (let target of targets) {
        if (this.range > 5) {
          target.takeDamage(this.temporaryDamage + this.range - 5)
        } else {
          target.takeDamage(this.temporaryDamage)
        }
        //Decreasing the damage base of the proximity of the target to this unit
        this.temporaryDamage /= 2
      }
      field.getRange("a1").getValue()
      Stopwatch.sleep(0.5)
    }

    return targets
  }
  /**
   * Causes this unit to take damage.\
   * Activates on hurt effects and causes this unit to do the hurt animation.\
   * Damage is rounded up.
   * @param {number} amount How much damage to take
   */
  takeDamage(amount) {
    this.update("ow")

    amount = Math.ceil(amount)
    this.health -= amount

    if (this.ability.when == "onHurt") {
      this.ability.effect(this, amount)
    }
  }

  /**
   * Redraws this unit and plays certain animations
   * @param {string=} damaged Extra string that is added into this units text in the ui so that conditional formating can play animations.
   */
  update (damaged = "") {
    //Checks for death
    if (this.health <=0 && damaged == "") {
      this.die()
      return
    }

    let infoText = field.getRange(2, this.column)
    field.getRange(1, this.column).setValue("\n" + this.name + "\n" + this.player.number)
    //Makes it so buffs and debuffs color the bottom section of the unit while damage and attacking effects the top half.
    if (damaged == "buffed:)" || damaged == "debuffed:(") {
      infoText.setValue("HP:*"+this.health+"*Strength: "+this.damage+"\nSpeed: "+this.speed+" | Range: "+this.range+"\nAbility: "+this.ability.text+"\n\n\n\n\n\n\n"+damaged)
      return
    }
    infoText.setValue(" " + damaged + "            HP:*"+this.health+"              " + damaged + " *Strength: "+this.damage+"\nSpeed: "+this.speed+" | Range: "+this.range+"\nAbility: "+this.ability.text)
  }
  /**
   * Kills this unit and activates any death or ko effects it or the thing that ko'ed it have.
   */
  die() {
    if (this.ability.when == "onDeath") {
      this.ability.effect(this)
    }

    let enemyUnit = game.players[2 - this.player.number].units[0]
    if (enemyUnit){
      if (enemyUnit.ability.when == "onKO") {
        enemyUnit.ability.effect(enemyUnit, this)
      }
    }

    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing").getRange(1, this.column, 2).setValue("")
    this.player.deleteUnit(this)
  }
  /**
   * Sell basically the death function but activates different abilities
   */
  sell () {
    if (this.ability.when == "onSell") {
      this.ability.effect(this)
    }
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing").getRange(1, this.column, 2).setValue("")
    this.player.deleteUnit(this)
  }
  
  /**
   * Buffs this unit in a stat by a rounded down amount
   * @param {string} stat What stat is being buffed
   * @param {number} amount How much to buff it (negative to debuff it)
   */
  buff(stat, amount) {
    //Abilities
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
    //Animations
    if (amount > 0){
      this.update("buffed:)")
    }
    if (amount < 0){
      this.update("debuffed:(")
    }
  }

  /**
   * Moves the unit. Returns whether the unit was able to move
   * @param {string} direction Whether to move the unit "left" or "right"
   * @returns {boolean} Whether this succesfully moved
   */
  move (direction) {
    const field = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing")
    //Creates a temporary variable of what it's column number would be after moving
    switch (direction) {
      case "left" :
        var newX = this.column - 1
        break
      case "right" :
        var newX = this.column + 1
        break
      default:
        return false
    }

    //Checks that where it is moving is within the range units can be
    if (newX < 1 || newX > 10) {
     return false
    }
    //Checks that it isn't going to clip into something else
    for (let player of game.players){
      if (player.findUnit(newX)) {
        return false
      }
    }
    //Moves the unit
    field.getRange(1,this.column,2).setValue("")
    this.column = newX
    this.update()
    return true
  }
  /**
   * Repeatedly moves this unit till it reaches a column or something is in the way.
   * @param {number} column What column you want this unit to move to.
   */
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
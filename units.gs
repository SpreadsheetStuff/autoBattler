class UnitType {
  constructor(baseHealth, baseAttack, baseSpeed, baseRange, ability) {
    this.name = ability.name
    this.cost = 1
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
  static refundForUnits(amount, player, cost) {
    if (amount < 1) {
      return [0,0]
    }
    const selection = SpreadsheetApp.getActiveSpreadsheet().getSelection()
    const selectedCell = selection.getCurrentCell()

    if (selectedCell.getValue()) {
      ui.alert("There are already units there")
      return [amount * cost,0]
    }

    //Check for excess or less than amount
    var refund = 0
    if (amount > 1)  {
      refund += (amount - 1) * cost
    } 
    // Check if right place
    if (selectionValid() == false) {
      ui.alert("Invalid Location","Select a cell to place a unit there",ui.ButtonSet.OK)
      return [amount * cost,0]
    }

    const selectedColumn = getFieldColumn(player.number, selectedCell.getColumn())

    return [refund, selectedColumn]

  }

  buyFunction(amount, player, refundOnly) {
    var [refund, sColumn] = UnitType.refundForUnits(amount, player, this.cost)

    if (amount == 0) {
      return refund
    }

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

  toArray() {
    this.update()
    return [this.name, this.health, this.damage, this.speed, this.range, this.column, this.player.number, this.ability.id]
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
/////////////
//Abilities
class Ability {
  constructor(name, when, effect, text, id) {
    this.when = when
    this.effect = effect
    this.text = text
    this.id = id
    this.name = name
  }
}
/////////////
class Shop {
  constructor (abilityPool, range, playerNum) {
    this.abilityPool = abilityPool
    this.unitTypes = []
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Shop")
    this.range = range
    this.playerNum = playerNum
  }
  //Generating Shop
  generateShop() {
    if (this.playerNum == 1){
      this.unitTypes = []
      let ability = abilities[0]
      let baseStats = [10, 2, 1, 1]
      let leftover = 1
      let createStats = (a1, a2, a3) => a1.map((a, i) => Math.round(a/a3 * 10) + a2[i]) 
      for (let i = 0; i < 5; i++) {
        ability = this.abilityPool[Math.floor(Math.random() * this.abilityPool.length)]
        let stats = [Math.random(), Math.random(), Math.random()/2, Math.random()/2]
        let total = stats.reduce((a, b) => a + b)
        let stats2 = createStats(stats, baseStats, total)
        if (stats2[3] > 5) {
          stats2[3] = 5
        }
        leftover = 25 - stats2.reduce((a, b) => a + b)
        this.unitTypes.push(new UnitType(stats2[0], stats2[1], stats2[2] + leftover, stats2[3], ability))
      }
    } else {
      //this.unitTypes = p1Shop.unitTypes.map(a => a.toArray()).map(a => new UnitType(a[0], a[1], a[2], a[3], abilities[a[4]]))
      for (let type of p1Shop.unitTypes) {
        this.unitTypes.push(type)
      }
    }
    //this.unitTypes = this.unitTypes.concat(this.unitTypes)
    this.draw()
    this.save()
  }
  //Deleting items
  deleteItem(item) {
    this.unitTypes.splice(this.unitTypes.indexOf(item), 1, fillerUnit)
    this.draw()
    this.save()
  }
  //loading/saving/drawing etc
  load() {
    this.unitTypes = JSON.parse(properties.getProperty("shop" + this.playerNum)).map(a => new UnitType(a[0], a[1], a[2], a[3], abilities[a[4]]))
  }
  save() {
    properties.setProperty("shop" + this.playerNum, JSON.stringify(this.unitTypes.map(a => a.toArray())))
  }
  draw() {
    var typesAsStrings = this.unitTypes.map(a => a.toShopString())
    this.sheet.getRange(this.range).setValues([typesAsStrings])
    var names = this.unitTypes.map(a => a.name)
    let nameRange = this.sheet.getRange(this.sheet.getRange(this.range).getRow() + 1, this.sheet.getRange(this.range).getColumn(), 1, this.sheet.getRange(this.range).getNumColumns())
    nameRange.setValues([names])
  }
}
// All Abilities
  let speedBuffOnBuy = new Ability("Sanic", "onBuy", speedBuffEffect, "When bought, buffs all other units with + 3 speed!", 0)
  let strengthDebuffOnDeathS1 = new Ability("no more strength","stats", strengthDebuffOnDeathEffectS1, "", 1)
  let debuffImmunity = new Ability('"Situational"', "onDebuff", disableDebuff, "Can't be debuffed", 2)
  let debuffOnOutsped = new Ability("No more speed", "onHurt", debuffOnOutspedEffect, "When hit by a faster unit, gains 2 strength and that unit loses its speed.",3)
  let copyStatsFromBehind = new Ability("Clone", "onAttack", copyStatsFromBehindEffect, "Before attacking copies the strength, speed and range from the unit behind it.", 4)
  let stealStatsOnKO = new Ability("budget sweeper", "onKO", stealStatsOnKOEffect, "After KOing an enemy gain 1/2 of their strength and speed.", 5)
  let swapOnBattleStart = new Ability("Annoying thing", "onBattleStart", statYoinkEffect, "At the start of each battle copies an opponent's unit that is in the mirrored column as this.", 6)
  let healthBuffAllOnTurnEnd = new Ability("free health", "onTurnEnd", healthBuffAllEffect, "At the end of each turn buffs all units, without this ability, by 2 health.", 7)
  let reactivateOnBuysOnSell = new Ability("I can't name things", "onSell", reactivateOnBuysOnSellEffect, 'When deleted, activates all "When bought" abilities of your other units.', 8)
  let yoinkRangeOnBuy = new Ability("Balanced", "onBuy", yoinkRangeOnBuyEffect, "When bought steals all other units' range stats and converts them to strength.", 9)
  let doubleBuffs = new Ability("hmmmmmmm", "onOtherBuff" , doubleBuffsEffect, "Doubles any stat buffs any unit on this team receives", 10)
  let generalBuffs = new Ability("free range :)", "onBuy", generalBuffsEffect, "On buy, buff all other units by one of each stat.", 11)
  let stealBuffs = new Ability("hmm part 2", "onOtherBuff", stealBuffsEffect, "When another team member is buffed in a stat other than health steal half of that buff.", 12)
  let stunOnDeath = new Ability("setup", "onDeath", stunOnDeathEffect, "On death, the attacker is stunned (loses all range and it's ability) unil it takes a hit", 13)
  let zombie = new Ability("Zombie", "onBuff", zombieEffect, "When buffed, converts all units into zombies. Gains +1 strength and health per converted", 14)
  let archer = new Ability("sniper", "onAttack", archerEffect, "Does full damage to all units.", 15)
  let nerfAllUnits = new Ability("nice zombie ;)", "onBattleStart", nerfAllUnitsEffect, "Before battle, caps both players health stats at 20.", 16)
  let buffAllOnBuff = new Ability("strength chain", "onBuff", buffAllOnBuffEffect, "On buff,  lose that buff but buff all units without this ability with 1 strength", 17)
  let summoner = new Ability("summoner", "onDeath", summonerEffect, "On death, summons a copy of the opponent with 15 health in the 5th column", 18)
  let offensiveBuffer = new Ability("monkey bootleg", "onTurnEnd", offensiveBufferEffect, "On turn end, give the unit ahead +2/1 strength and speed if it has <15/<30 of that stat respectively", 19)
  let doubleStats = new Ability("big boi", "stats", doubleStatsEffect, "has 2x the stats it normally would have", 20)
  let vampire = new Ability("vampire", "onAttack", vampireEffect, "Before attacking gain 3 health then become a bat.", 21)

  var shopAbilities = [speedBuffOnBuy, strengthDebuffOnDeathS1, debuffImmunity, debuffOnOutsped, copyStatsFromBehind, stealStatsOnKO, swapOnBattleStart, healthBuffAllOnTurnEnd, reactivateOnBuysOnSell, yoinkRangeOnBuy, doubleBuffs, generalBuffs, stealBuffs, stunOnDeath, zombie, archer, nerfAllUnits, buffAllOnBuff, summoner, offensiveBuffer, doubleStats]


  //Other Abilities
  var noAbility = new Ability ("Already Sold","never", doNothing, "does nothing", shopAbilities.length)
  let strengthDebuffOnDeathS2 = new Ability("no more strength", "onDeath", strengthDebuffOnDeathEffectS2, "\n- Has 1 health \n- On Death, debuffs all enemy strength stats by 25%", shopAbilities.length + 1)
  let stunned = new Ability("stunned :(", "onHurt", stunnedEffect, "Stunned: has a range of 0 until hit.", shopAbilities.length + 2)
  let doubleStatsFake = new Ability("big boi", "never", doNothing, "has 2x the stats it normally would have", shopAbilities.length + 3)
  let bat = new Ability("bat", "onAttack", batEffect, "Before attacking deal 1 damage to all units then become a vampire.", shopAbilities.length + 4)
let otherAbilities = [noAbility, strengthDebuffOnDeathS2, stunned, doubleStatsFake]
let abilities = shopAbilities.concat(otherAbilities)

var p1Shop = new Shop(shopAbilities, "a1:e1", 1)
var p2Shop = new Shop(shopAbilities, "f1:j1", 2)

//filler stuff
var fakeBuyFunction = (a, b, c) => 1
var fillerUnit = new UnitType (0, 0, 0, 0, noAbility)
function doNothing() {
  //ui.alert("This Does Nothing")
}


//Ability Functions
function speedBuffEffect(unit) {
  unit.update("yay")
  var player = unit.player
  for (let otherUnit of player.units) {
    if (unit != otherUnit) {
      otherUnit.buff("speed", 3)
    }
  }
  field.getRange("a1").getValues()
}
function strengthDebuffOnDeathEffectS1(unitType) {
  unitType.baseHealth = 1
  unitType.ability = strengthDebuffOnDeathS2
}
function strengthDebuffOnDeathEffectS2(unit) {
  var units = game.players[unit.player.number % 2].units
  for (let unit of units) {
    unit.buff("damage", -unit.damage/4)
  }
  field.getRange("a1").getValue()
  stopwatch.sleep(0.5)
}
function disableDebuff() {
  return true
}
function debuffOnOutspedEffect(unit) {
  var otherUnit = game.players[unit.player.number % 2].units[0]
  if (unit.speed >= otherUnit.speed) {
    return
  }
  field.getRange("a1").getValue()
  stopwatch.sleep(0.5)
  unit.buff("damage", 2)
  otherUnit.buff("speed", - otherUnit.speed)
  field.getRange("a1").getValue()
}
function copyStatsFromBehindEffect(unit) {
  let units = unit.player.units
  let behindId = units.indexOf(unit) + 1
  if (behindId >= units.length) {
    return
  }
  let unitBehind = units[behindId]
  if (unitBehind.speed > unit.speed){
    unit.speed = unitBehind.speed
  }
  if (unitBehind.range > unit.range){
    unit.range = unitBehind.range
  }
  if (unitBehind.damage > unit.damage){
    unit.damage = unitBehind.damage
  }
}
function stealStatsOnKOEffect (unit, target) {
  unit.buff("damage",target.damage/2)
  unit.buff("speed",target.speed/2)
  field.getRange("a1").getValue()
}
function statYoinkEffect(unit) {
  let player = unit.player
  let otherPlayer = game.players[player.number % 2]
  /*if (unit.temporaryDamage == 12345) {
    return
  }*/
  let otherUnit = otherPlayer.findUnit(5 - (unit.column - 1) % 5 + (5 * (otherPlayer.number - 1)))
  if (otherUnit) {
    var unit2 = Unit.constructFromArray(otherUnit.toArray())
    unit2.column = unit.column
    unit2.player = player

   /* let idx = otherPlayer.units.indexOf(otherUnit)
    let otherColumn = otherUnit.column
    otherUnit = Unit.constructFromArray(unit.toArray())
    otherUnit.column = otherColumn
    otherUnit.player = otherPlayer
    otherUnit.temporaryDamage = 12345
    otherPlayer.units[idx] = otherUnit*/

    player.units[player.units.indexOf(unit)] = unit2
  }
}
function healthBuffAllEffect (unit) {
  let player = unit.player
  for (let otherUnit of player.units) {
    if (otherUnit.ability != healthBuffAllOnTurnEnd){
      otherUnit.buff("health", 2)
    }
  }
}
function reactivateOnBuysOnSellEffect (unit) {
  for (let otherUnit of unit.player.units) {
    if (otherUnit.ability.when == "onBuy") {
      otherUnit.ability.effect(otherUnit)
    }
  }
}
function yoinkRangeOnBuyEffect (unit) {
  let player = unit.player
  let yoinked = 0
  for (let otherUnit of player.units) {
    yoinked += otherUnit.range - 1
    otherUnit.buff("range", -otherUnit.range + 1)
  }
  unit.buff("damage", yoinked)
}
function doubleBuffsEffect(stat, amount, unit) {
  amount = Math.floor(amount)
  switch (stat) {
    case "health":
      unit.health += amount
      break
    case "damage":
      unit.damage += amount
      break
    case "range":
      unit.range += amount
      break
    case "speed":
      unit.speed += amount
      break
    default:
      return 
  }
}
function generalBuffsEffect(unit) {
  unit.update("yay")
  var player = unit.player
  for (let otherUnit of player.units) {
    if (unit != otherUnit) {
      otherUnit.buff("speed", 1)
      otherUnit.buff("range", 1)
      otherUnit.buff("health", 1)
      otherUnit.buff("damage", 1)
    }
  }
  field.getRange("a1").getValues()
}
function stealBuffsEffect (stat, amount, otherUnit, unit) {
  if (stat == "health") {
    return
  }
  let multiplier = 1
  for (let unit2 of unit.player.units) {
    if (unit2.ability == doubleBuffs) {
      multiplier += 1
    }
  }
  amount /= 2
  if (otherUnit.ability != unit.ability){
    otherUnit.buff(stat, - amount * multiplier)
    unit.buff(stat, amount)
  }
}
function stunOnDeathEffect (unit) {
  var otherUnit = game.players[unit.player.number % 2].units[0]
  let name = otherUnit.ability.id.toString() + "*" + otherUnit.range.toString()

  otherUnit.ability = stunned
  otherUnit.ability.name = name
  otherUnit.buff("range", -otherUnit.range)
  field.getRange("a1").getValue()
}
function stunnedEffect(unit) {
  let name = unit.ability.name.split("*")
  unit.ability = abilities[parseInt(name[0])]
  unit.buff("range", parseInt(name[1]))
}
function zombieEffect(a, b, unit) {
  let player = unit.player
  let summoned = 0
  for (let unitIdx in player.units) {
    if (player.units[unitIdx] != unit){
      let otherUnit = player.units[unitIdx]
      if (otherUnit.ability != unit.ability && otherUnit.ability != noAbility && otherUnit.ability != disableDebuff){
        summoned += 1
        let column = otherUnit.column
        player.units[unitIdx] = new Unit("zombie", 1, 1, 1, 1, noAbility, column, player)
      }
      if (otherUnit.ability == disableDebuff) {
        summoned += 1
      }
    }
  }
  if (summoned > 0){
    for (let unit2 of player.units) {
      if (unit2.ability == unit.ability) {
        unit2.health += summoned
        unit2.damage += summoned
      }
    }
  }
}
function archerEffect(unit, targets) {
  //Deals full damage - the amount each unit would normally take
  let temporaryDamage = unit.damage
  for (let target of targets) {

    //Math.floor because take damage uses the ceil
    target.health -= Math.floor(unit.damage - temporaryDamage)
    temporaryDamage /= 2
  }
}
function nerfAllUnitsEffect () {
  for (let player of game.players) {
    for (let unit of player.units) {
      if (unit.health > 20) {
        unit.health = 20
      }
    }
  }
}
function buffAllOnBuffEffect (stat, amount, unit) {
  var player = unit.player
  for (let otherUnit of player.units) {
    if (unit.ability != otherUnit.ability) {
      otherUnit.buff("damage", 1)
    }
  }
  unit.buff(stat, - amount)
  field.getRange("a1").getValues()
}
function summonerEffect(unit) {
  let player = unit.player 
  if (player.number == 1) {
    var column = 1
  } else {
    var column = 10
  }
  let opponent = game.players[unit.player.number % 2].units[0]
  let newUnit = new Unit("you", 15, opponent.damage, opponent.speed, opponent.range, opponent.ability, column, player)
  if (newUnit.ability == summoner) {
    newUnit.ability = noAbility
  }
  player.units.push(newUnit)
  unit.ability = noAbility
  unit.die()
  player.advanceAllUnits()
}
function offensiveBufferEffect(unit) {
  let units = unit.player.units
  let inFrontId = units.indexOf(unit) - 1
  if (inFrontId < 0) {
    return
  }
  let unitAhead = units[inFrontId]
  if (unitAhead.speed < 15) {
    unitAhead.buff("speed", 2)
  } else if (unitAhead.speed < 30){
    unitAhead.buff("speed", 1)
  }
  if (unitAhead.damage < 15) {
    unitAhead.buff("damage", 2)
  } else if (unitAhead.damage < 30){
    unitAhead.buff("damage", 1)
  }
  unitAhead.update("buffed:)")
}

function doubleStatsEffect(unitType) {
  unitType.baseHealth = unitType.baseHealth * 2
  unitType.baseAttack = unitType.baseAttack * 2
  unitType.baseSpeed = unitType.baseSpeed * 2
  unitType.baseRange = unitType.baseRange * 2
  unitType.ability = doubleStatsFake
}
function vampireEffect(unit) {
  unit.buff("health", 3)
  unit.ability = bat
  unit.name = "bat"
}
function batEffect(unit) {
  for (let player of game.players){
    for (let unit of player.units) {
      unit.takeDamage(1)
    }
  }
  unit.ability = vampire
  unit.name = "vampire"
}


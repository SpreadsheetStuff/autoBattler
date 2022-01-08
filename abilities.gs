//Ability class
class Ability {
  constructor(name, when, effect, text, id) {
    this.when = when
    this.effect = effect
    this.text = text
    this.id = id
    this.name = name
  }
}
// Ability objects
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
  let extraBuffs = new Ability("hmmmmmmm", "onOtherBuff" , extraBuffsEffect, "When a unit is buffed give +1 of the stat it was buffed in.", 10)
  let generalBuffs = new Ability("free range :)", "onBuy", generalBuffsEffect, "On buy, buff all other units by one of each stat.", 11)
  let stealBuffs = new Ability("hmm part 2", "onOtherBuff", stealBuffsEffect, "When another team member is buffed in a stat other than health steal half of that buff.", 12)
  let stunOnDeath = new Ability("setup", "onDeath", stunOnDeathEffect, "On death, the attacker is stunned (loses all range and it's ability) unil it takes a hit", 13)
  let zombie = new Ability("Zombie", "onBuff", zombieEffect, "When buffed, converts all units into zombies. Gains +1 strength and health per converted", 14)
  let archer = new Ability("sniper", "onAttack", archerEffect, "Does full damage to all units.", 15)
  let niceZombie = new Ability("nice zombie ;)", "onBattleStart", niceZombieEffect, "Before battle, has a strength stat equal to half the health of your opponents highest health unit.", 16)
  let buffAllOnBuff = new Ability("strength chain", "onBuff", buffAllOnBuffEffect, "On buff,  lose that buff but buff all units without this ability with 1 strength", 17)
  let summoner = new Ability("summoner", "onDeath", summonerEffect, "On death, summons a copy of the opponent with 15 health in the 5th column", 18)
  let offensiveBuffer = new Ability("monkey bootleg", "onTurnEnd", offensiveBufferEffect, "On turn end, give the unit ahead +2/1 strength and speed if it has <15/<30 of that stat respectively", 19)
  let doubleStats = new Ability("big boi", "stats", doubleStatsEffect, "has 2x the stats it normally would have", 20)
  let vampire = new Ability("vampire", "onAttack", vampireEffect, "Before attacking gain 3 health then become a bat.", 21)
  //List of all abilities that can be found in the shop
  var shopAbilities = [speedBuffOnBuy, strengthDebuffOnDeathS1, debuffImmunity, debuffOnOutsped, copyStatsFromBehind, stealStatsOnKO, swapOnBattleStart, healthBuffAllOnTurnEnd, reactivateOnBuysOnSell, yoinkRangeOnBuy, extraBuffs, generalBuffs, stealBuffs, stunOnDeath, zombie, archer, niceZombie, buffAllOnBuff, summoner, offensiveBuffer, doubleStats, vampire]
  //Other Abilities 
  var noAbility = new Ability ("Already Sold","never", doNothing, "does nothing", shopAbilities.length)
  let strengthDebuffOnDeathS2 = new Ability("no more strength", "onDeath", strengthDebuffOnDeathEffectS2, "\n- Has 1 health \n- On Death, debuffs all enemy strength stats by 25%", shopAbilities.length + 1)
  let stunned = new Ability("stunned :(", "onHurt", stunnedEffect, "Stunned: has a range of 0 until hit.", shopAbilities.length + 2)
  let doubleStatsFake = new Ability("big boi", "never", doNothing, "has 2x the stats it normally would have", shopAbilities.length + 3)
  let bat = new Ability("bat", "onAttack", batEffect, "Before attacking deal 1 damage to all units then become a vampire.", shopAbilities.length + 4)
let otherAbilities = [noAbility, strengthDebuffOnDeathS2, stunned, doubleStatsFake, bat]
let abilities = shopAbilities.concat(otherAbilities)

//All ability functions
function doNothing() {
  //ui.alert("This Does Nothing")
}
//Id: 0
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
  for (let unit of units) {
    unit.update()
  }
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
//Id:5
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
//Id: 10
function extraBuffsEffect(stat, amount, unit) {
  switch (stat) {
    case "health":
      unit.health += 1
      break
    case "damage":
      unit.damage += 1
      break
    case "range":
      unit.range += 1
      break
    case "speed":
      unit.speed += 1
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
    if (unit2.ability == extraBuffs) {
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
  if (game.players[unit.player.number % 2].units.length == 0) {
    return
  }
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
//Id: 15
function archerEffect(unit, targets) {
  //Deals full damage - the amount each unit would normally take
  let temporaryDamage = unit.damage
  for (let target of targets) {

    //Math.floor because take damage uses the ceil
    target.health -= Math.floor(unit.damage - temporaryDamage)
    temporaryDamage /= 2
  }
}
function niceZombieEffect () {
  let opponent = game.players[unit.player.number % 2]
  if (opponent.units.length == 0) {
    return
  }
  let highestHealthUnit = opponent.units[0]
  for (let unit of opponent.units) {
    if (unit.health > highestHealthUnit.health) {
      highestHealthUnit = unit
    }
  }
  unit.buff("damage", (highestHealthUnit.health/2 - unit.damage))
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
  if (player.findUnit(column)) {
    return
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
//Id:20
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


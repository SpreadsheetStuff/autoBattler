class Player {
  constructor (sheet, number, shop) {
    this.activeSheet = sheet
    this.number = number
    this.availibleUnits = 0
    this.ready = false
    this.units = []
    this.shop = shop
  }
  //
  buy(unitType) {
    if (unitType.baseHealth == 0) {
      return
    }
    saveOrLoadPlayersReady(false)
    if (this.ready) {
      ui.alert("Your turn is over")
      return
    }
    this.loadUnits()
    this.loadMoney()
    var refund = unitType.buyFunction(1, this, true)
    if (refund == 1) {
      return
    }
    if (this.availibleUnits >= 1) {
        unitType.buyFunction(1, this, false)
        this.availibleUnits -= 1
        this.shop.deleteItem(unitType)
        this.saveMoney()
        if (this.number == 1){
          gameInfo.getRange("f2").setValue(this.availibleUnits)
        } else {
          gameInfo.getRange("g2").setValue(this.availibleUnits)
        }
        return
      }
    ui.alert("You already have the max units for this round")
  }
  //
  createUnit(type, column) {
    var newUnit = Unit.constructFromType(type, column, this)
    this.units.push(newUnit)
    newUnit.update()
    this.saveUnits()
  }
  //
  deleteUnit(unit) {
    if (this.units.indexOf(unit) > - 1){
      this.units.splice(this.units.indexOf(unit), 1)
    }
  }
  //
  findUnit(column) {
    for (let unit of this.units) {
      if (unit.column == column) {
        return unit
      }
    }
    return false
  }
  //
  orderUnits() {
    if (this.units.length < 1) {
      return []
    }
    var outputArray = [this.units[0]]
    var thing = false
    for (let unitIdx in this.units) {
      if (unitIdx != 0) {
        var unit = this.units[unitIdx]
        thing = true
        for (var elementIdx in outputArray) {
          if (unit.column > outputArray[elementIdx].column) {
            outputArray.splice(elementIdx,0,unit)
            thing = false
            break
          }
        }
        if (thing) {
          outputArray.push(unit)
        }
      }
    }
    if (this.number == 2) {
      outputArray.reverse()
    }
    this.units = outputArray
    return outputArray
  }
  //
  advanceAllUnits() {
    this.orderUnits()
    if (this.number == 1) {
      for (var unit of this.units) {
        unit.moveTo(5)
      }
    } else {
      for (var unit of this.units) {
        unit.moveTo(6)
      }
    }
  }
  //
  //Really just here for the move selected button
  advanceAllUnitsOnceTo(column, avoid) {
    let firstUnit = this.findUnit(avoid)
    if (!firstUnit) {
      return
    } else {
      var failed = this.fancyMove(firstUnit, column)
    }
    for (var unit of failed) {
      if (unit.column > column) {
        if (!unit.move("left")) {
          failed.push(unit)
        }
      } else {
        if (!unit.move("right")) {
          failed.push(unit)
        }
      }
    } 
  }
  fancyMove(unit, column) {
    let failed = []
    if (unit.column > column) {
        if (!unit.move("left")) {
          failed.push(unit)
          failed = failed.concat(this.fancyMove(this.findUnit(unit.column - 1), column))
        }
    } else {
      if (!unit.move("right")) {
        failed.push(unit)
        failed = failed.concat(this.fancyMove(this.findUnit(unit.column + 1), column))
      }
    }  
    return failed
  }

  //persistent data 
  loadUnits() {
    //reset units array
    this.units = []
    let array = JSON.parse(properties.getProperty("player " + this.number + " units"))
    Logger.log(properties.getProperty("player " + this.number + " units") + "n: "+ this.number)

    if (array) {
      //loading units
      for (let unit of array) {
        this.units.push(Unit.constructFromArray(unit))
      }
      //reseting field to avoid weird de-sync bugs
      if (this.number == 1) {
        field.getRange("a1:e2").setValue("")
      } else {
        field.getRange("f1:j2").setValue("")
      }
      //updating so the field isn't blank
      for (let unit of this.units) {
        unit.update()
      }
      //ordering units so update order makes sense
      this.orderUnits()
    }
  }

  saveUnits() {
    var outputArray = []
    for (let unit of this.units) {
      var unitAsArray = unit.toArray()
      outputArray.push(unitAsArray)
    }
    properties.setProperty("player " + this.number + " units", JSON.stringify(outputArray))
    Logger.log(properties.getProperty("player " + this.number + " units") + "saved n: "+ this.number)
  }
  loadMoney () {
    if (!properties.getProperty("player"+this.number+" money")) {
      return
    }
    this.availibleUnits = parseInt(properties.getProperty("player"+this.number+" money"))
  }
  saveMoney () {
    properties.setProperty("player"+this.number+" money", this.availibleUnits)
  }
}

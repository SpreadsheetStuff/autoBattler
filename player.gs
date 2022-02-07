/**
 * Player Class
 */
class Player {
  /**
   * ---
   * Creates a new instance of the player class
   * @param {SpreadsheetApp.SheetType} sheet The sheet that displays the ui for this player (Used to check which player's sheet the user is viewing)
   * @param {number} number The player's number/id
   * @param {Shop} shop A shop object storing this player's shop
   */
  constructor (sheet, number, shop) {
    this.activeSheet = sheet
    this.number = number
        this.shop = shop

    this.availibleUnits = 0
    this.ready = false
    this.units = []
  }

  /**
   * Buys a unit and places it in the cell the user is selecting
   * @param {UnitType} unitType The `UnitType` object with the stats and ability of the unit you want to buy
   */
  buy(unitType) {
    //Already sold units have 0 health and this will prevent them from being bought
    if (unitType.baseHealth == 0) {
      return
    }
    //Makes sure you haven't ended your turn
    saveOrLoadPlayersReady(false)
    if (this.ready) {
      ui.alert("Your turn is over")
      return
    }
  
    this.loadUnits()
    this.loadMoney()

    const selection = SpreadsheetApp.getActiveSpreadsheet().getSelection()
    const selectedCell = selection.getCurrentCell()
    //CHecks you aren't tyring to buy a unit where there is already a unit
    if (this.findUnit(getFieldColumn(this.number, selectedCell.getColumn()))) {
      ui.alert("there is already a unit there")
      return
    }
    // Checks that the user is trying to place a unit in a place that isn't where units are allowed to be
    if (selectionValid(selectedCell) == false) {
      ui.alert("Invalid Location","Select a cell to place a unit there",ui.ButtonSet.OK)
      return
    }
    // Checks that you can afford buying a unit
    if (this.availibleUnits == 0) {
      ui.alert("You already have the max units for this round")
      return
    }
    this.createUnit(unitType, getFieldColumn(this.number, selectedCell.getColumn()))
    this.availibleUnits -= 1
    this.shop.deleteItem(unitType)
    this.saveMoney()
    //Updates how much money you have inside the ui
    if (this.number == 1){
      gameInfo.getRange("f2").setValue(this.availibleUnits)
    } else {
      gameInfo.getRange("g2").setValue(this.availibleUnits)
    }
    //Updates all units
    for (let unit of this.units) {
      unit.update()
    }
    //Redraws
    field.getRange("a1").getValue()
  }

  /**
   * ---
   * Buys a unit and places it in a columns given whatever calls it.
   * @param {UnitType} unitType The `UnitType` object with the stats and ability of the unit you want to buy.
   * @param {number} column The column to place the unit in.
   */
  buyForBots(unitType, column) {
    let cell = this.activeSheet.getRange(1,column)
    if (unitType.baseHealth == 0) {
      return
    }
    this.loadUnits()
    this.loadMoney()
    if (this.findUnit(getFieldColumn(this.number, cell.getColumn()))) {
      return
    }
    // Checks that the user is trying to place a unit in a place that isn't where units are allowed to be
    if (selectionValid(cell) == false) {
      return
    }
    // Checks that you can afford buying a unit
    if (this.availibleUnits == 0) {
      return
    }
    this.createUnit(unitType, getFieldColumn(this.number, cell.getColumn()))
    this.availibleUnits -= 1
    this.shop.deleteItem(unitType)
    this.saveMoney()
    //Updates how much money you have inside the ui
    if (this.number == 1){
      gameInfo.getRange("f2").setValue(this.availibleUnits)
    } else {
      gameInfo.getRange("g2").setValue(this.availibleUnits)
    }
    //Updates all units
    for (let unit of this.units) {
      unit.update()
    }
    //Redraws
    field.getRange("a1").getValue()
  }

  /**
   * ---
   * Creates a new unit from a `UnitType` object
   * @param {UnitType} type The `UnitType` object of the new unit
   * @param {number} column The column to place the unit in
   */
  createUnit(type, column) {
    let newUnit = Unit.constructFromType(type, column, this)
    this.units.push(newUnit)
    
    newUnit.update()
    this.saveUnits()
  }
  
  /**
   * Deletes a unit from this player's list of units
   * @param {Unit} unit The unit you want to delete.
   */
  deleteUnit(unit) {
    //Removing the unit from the units list
    if (this.units.indexOf(unit) > - 1){
      this.units.splice(this.units.indexOf(unit), 1)
    }
    //Updating and redrawing
    for (let unit of this.units) {
      unit.update()
    }
    field.getRange("a1").getValue()
  }

  /**
   * Returns either the unit in a column or false if there is no unit in that column
   * @param {number} column The column you want to know if there is a unit in.
   * @returns {Unit|boolean}
   */
  findUnit(column) {
    for (let unit of this.units) {
      if (unit.column == column) {
        return unit
      }
    }
    return false
  }
  
  /**
   * Orders the units in this players units array by their proximity to the center columns\
   * Returs this player's units array
   * @returns {Array<Unit>}
   */
  orderUnits() {
    //If there are no units or 1 unit, you can't order them
    if (this.units.length < 2) {
      return this.units
    }
    
    let outputArray = [this.units[0]]
    for (let unitIdx in this.units) {
      //Needs more than one unit to order them
      if (unitIdx != 0) {

        let unit = this.units[unitIdx]

        let addLater = true
        for (let elementIdx in outputArray) {
          if (unit.column > outputArray[elementIdx].column) {
            //If `unit` has a higher column number than the element being cycled through, the unit is inserted before the cycled element.

            //The elements being cycled though are already ordered so if a unit, x, has a higher column number then the second element in     
            //the output array it also has a higher column number than the third element.
            //That means that if we go through the array and compare unit x to each element of the array, the first unit that has a column less
            //than unit x will be the unit that unit x needs to be to the left of.
            outputArray.splice(elementIdx,0,unit)
            addLater = false
            break
          }
        }
        //If the column of the unit is not greater then the rest of the units then it should be behind the other units
        if (addLater) {
          outputArray.push(unit)
        }
      }
    }
    //Since the sorted array is just by highest to least column number, if we want it to be sorted by proximity to the center we need to  reverse  
    //the array if the units are past the center which is only true for player 2
    if (this.number == 2) {
      outputArray.reverse()
    }

    this.units = outputArray
    return outputArray
  }
  /**
   * Moves all units this player owns as far as possible towards the center.
   */
  advanceAllUnits() {
    //Moves each unit in order of their proximity to the center because then nohing that blocks each unit will move
    this.orderUnits()
    if (this.number == 1) {
      for (let unit of this.units) {
        unit.moveTo(5)
      }
    } else {
      for (let unit of this.units) {
        unit.moveTo(6)
      }
    }
  }
  /**
   * Advances all units towards a column till the avoid column is empty.
   * Mostly useful for the `moveCustomFunction()`
   * @param {number} column The column this should prioritize moving units to
   * @param {number} avoid The column this should try to get units to get out of the way of
   */
  
  advanceAllUnitsOnceTo(column, avoid) {
    let firstUnit = this.findUnit(avoid)
    if (!firstUnit) {
      return
    }
    //Moves each unit once; if it finds another unit blocking the unit then moves that blocking unit
    //Afterwards this moves all the blocked units again
    let failed = this.fancyMove(firstUnit, column)
    for (let unit of failed) {
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
  /**
   * Moves a unit once towards a column; if another unit is blocking it, this then moves that unit
   * Returns a list of every unit that was blocked
   * @param {Unit} unit The unit you want to move
   * @param {number} column The column you want the unit to move to
   * @returns {Array<Unit>} 
   */
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

  /**
   * Updates this players units array to match what `PropertiesService` has stored
   */
  loadUnits() {
    //Empties this player's units array
    this.units = []
    //Array of each unit stored as an array
    let array = JSON.parse(properties.getProperty("player " + this.number + " units"))

    Logger.log(properties.getProperty("player " + this.number + " units") + "n: "+ this.number)

    if (array) {
      //Adding each unit to this player's units array
      for (let unit of array) {
        this.units.push(Unit.constructFromArray(unit))
      }
      //Reseting field to avoid weird de-sync bugs
      if (this.number == 1) {
        field.getRange("a1:e2").setValue("")
      } else {
        field.getRange("f1:j2").setValue("")
      }
      //Updating so the field isn't blank
      for (let unit of this.units) {
        unit.update()
      }
      //Ordering units so update order makes sense
      this.orderUnits()
    }
  }

  /**
   * Saves what units this player owns, and their stats to `PropertiesService`
   */
  saveUnits() {
    let outputArray = this.units.map(unit => unit.toArray())

    properties.setProperty("player " + this.number + " units", JSON.stringify(outputArray))
    Logger.log(properties.getProperty("player " + this.number + " units") + "saved n: "+ this.number)
  }
  /**
   * Updates this players money to match what `PropertiesService` has stored
   */
  loadMoney () {
    if (!properties.getProperty("player"+this.number+" money")) {
      return
    }
    this.availibleUnits = parseInt(properties.getProperty("player"+this.number+" money"))
  }
  /**
   * Saves this players money to properties service
   */
  saveMoney () {
    properties.setProperty("player"+this.number+" money", this.availibleUnits)
  }
}

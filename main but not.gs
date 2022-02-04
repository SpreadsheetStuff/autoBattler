/**
 * Sheet that displays the ui for p1
 * @type {SpreadsheetApp.SheetType}
 */
let player1ActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Player 1/Red")
/**
 * Sheet that displays the ui for p2
 * @type {SpreadsheetApp.SheetType}
 */
let player2ActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Player 2/Blue")
/**
 * Sheet that the ui sheets use to figure out where to draw units (using formulas)\
 * This program can't directly draw to the ui because of weird stuff with google permissions
 * @type {SpreadsheetApp.SheetType}
 */
let field = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Field Thing")
/**
 * Sheet that the ui sheets use to figure out misc. info about the game (using formulas)\
 * This program can't directly draw to the ui because of weird stuff with google permissions
 * @type {SpreadsheetApp.SheetType}
 */
let gameInfo = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Misc Game Info")
/**
 * Google's ui class thing
 * @type {Ui}
 */
let ui = SpreadsheetApp.getUi()

/**
 * Instance of the Stopwatch variable
 * @type {Stopwatch}
 */
let stopwatch = new Stopwatch ()

/**
 * Player 1's shop (Using two shops because they will then save separately and there are as a result, less de-sync erroers)
 * @type {Shop}
 */
let p1Shop = new Shop(shopAbilities, "a1:e1", 1)
/**
 * Player 1's shop (Using two shops because they will then save separately and there are as a result, less de-sync erroers)
 * @type {Shop}
 */
let p2Shop = new Shop(shopAbilities, "f1:j1", 2)
/**
 * Player 1 object (Duh)
 * @type {Player}
 */
let player1 = new Player(player1ActiveSheet, 1, p1Shop)
/**
 * Player 2 object (Duh)
 * @type {Player}
 */
let player2 = new Player(player2ActiveSheet, 2, p2Shop)
/**
 * List of both players 
 * @type {Array<Player>}
 */
let players = [player1, player2]
/**
 * Game object
 * @type {Game}
 */
let game = new Game(players, [p1Shop, p2Shop])

/**
 * Buy function that replaces the standard unit type buy function that will always return that the user is unable to buy the unit with the function
 */
const fakeBuyFunction = (a, b, c) => 1
/**
 * Fake unit type used for the 'Already Sold' Units in the shop
 * @type {UnitType}
 */
let fillerUnit = new UnitType (0, 0, 0, 0, noAbility)

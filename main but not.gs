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

var p1Shop = new Shop(shopAbilities, "a1:e1", 1)
var p2Shop = new Shop(shopAbilities, "f1:j1", 2)
//Players
var player1 = new Player(player1ActiveSheet, 1, p1Shop)
var player2 = new Player(player2ActiveSheet, 2, p2Shop)
var players = [player1, player2]

var game = new Game(players, [p1Shop, p2Shop])

//filler stuff
var fakeBuyFunction = (a, b, c) => 1
var fillerUnit = new UnitType (0, 0, 0, 0, noAbility)

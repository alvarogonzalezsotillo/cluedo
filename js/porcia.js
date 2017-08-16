if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    log = common.log;
    CPManager = cp.CPManager;
}

var CP = new CPManager();

var retratoEnOro = CP.Boolean("enOro");
var retratoEnPlata = CP.Boolean("enPlata");
var retratoEnPlomo = CP.Boolean("enPlomo");

var inscripcionOro = CP.Boolean("El retrato está en el cofre oro");
var inscripcionPlata = CP.Boolean("El retrato no está en el cofre plata");
var inscripcionPlomo = CP.Boolean("El retrato no está en el cofre oro");




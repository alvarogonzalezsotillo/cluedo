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
var inscripciones = [inscripcionOro,inscripcionPlata,inscripcionPlomo];


CP.IfThen( inscripcionOro, retratoEnOro ).remove(false);
CP.IfThen( inscripcionPlata, CP.Not(retratoEnPlata) ).remove(false);
CP.IfThen( inscripcionPlomo, CP.Not(retratoEnOro ) ).remove(false);

var soloUnRetrato = CP.SomeTrue([retratoEnOro,retratoEnPlata,retratoEnPlomo],1);
soloUnRetrato.remove(false);
var comoMuchoUnaInscripcionVerdad =   CP.Or( [CP.SomeTrue(inscripciones,1), CP.SomeTrue(inscripciones,0)] );
comoMuchoUnaInscripcionVerdad.remove(false);

retratoEnPlata.remove(false);
CP.describe();


var println = function(s){console.log("** " + s )};
retratoEnOro.describe(println);
retratoEnPlata.describe(println);
retratoEnPlomo.describe(println);
comoMuchoUnaInscripcionVerdad.describe(println);















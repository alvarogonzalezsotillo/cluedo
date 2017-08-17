if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    var cpb = require("./cp.backtrack.js");
    log = common.log;
    CPManager = cp.CPManager;
    CPBacktrack = cpb.CPBacktrack;
}

var CP = new CPManager();

var retratoEnOro = CP.Boolean("enOro");
var retratoEnPlata = CP.Boolean("enPlata");
var retratoEnPlomo = CP.Boolean("enPlomo");

var inscripcionOro = CP.Boolean("Está en ORO");
var inscripcionPlata = CP.Boolean("No está en PLATA");
var inscripcionPlomo = CP.Boolean("No está en ORO");

var inscripciones = [
    inscripcionOro,inscripcionPlata,inscripcionPlomo
];

var impliciacionesInscripciones = [
    CP.IfThen( inscripcionOro, retratoEnOro ).rename("La inscripcion oro es verdad"),
    CP.IfThen( inscripcionPlata, CP.Not(retratoEnPlata) ).rename("La inscripción plata es verdad"),
    CP.IfThen( inscripcionPlomo, CP.Not(retratoEnOro ) ).rename("La inscripción oro es verdad")
];

var soloUnRetrato = CP.SomeTrue([retratoEnOro,retratoEnPlata,retratoEnPlomo],1).
    rename("Solo un retrato en total").
    asTrue();


var comoMuchoUnaInscripcionVerdad =  CP.Or( [CP.SomeTrue(impliciacionesInscripciones,1), CP.SomeTrue(impliciacionesInscripciones,0)]).
    rename( "Como mucho una inscripcion verdad" ).
    asTrue();



CPBacktrack([retratoEnPlata,retratoEnPlomo,retratoEnOro], function(cps){
    //CP.describe();
    var println = function(s){console.log("** " + s )};
    println( "************************************");
    retratoEnOro.describe(println);
    retratoEnPlata.describe(println);
    retratoEnPlomo.describe(println);
});
















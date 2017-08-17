if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    var cpb = require("./cp.backtrack.js");
    log = common.log;
    CPManager = cp.CPManager;
    CPBacktrack = cpb.CPBacktrack;
}

function porciaI(){
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

    CP.Iff( inscripcionOro, retratoEnOro ).asTrue().rename("La inscripcion oro es verdad");
    CP.Iff( inscripcionPlata, CP.Not(retratoEnPlata) ).asTrue().rename("La inscripción plata es verdad");
    CP.Iff( inscripcionPlomo, CP.Not(retratoEnOro ) ).asTrue().rename("La inscripción plomo es verdad");


    var soloUnRetrato = CP.SomeTrue([retratoEnOro,retratoEnPlata,retratoEnPlomo],1).
        rename("Solo un retrato en total").
        asTrue();


    var comoMuchoUnaInscripcionVerdad =  CP.SomeTrue(inscripciones,0,1).
        rename( "Como mucho una inscripcion verdad" ).
        asTrue();


    var cps = [retratoEnOro,retratoEnPlata,retratoEnPlomo];
    CPBacktrack(cps, function(cps){
        assert(retratoEnPlata.isTrue());
        var println = function(s){console.log("** " + s )};
        println( "************************************");
        for( var i = 0 ; i < cps.length ; i++ ){
            println( cps[i].toString() );
        }
    });
}


function porciaII(){
    var CP = new CPManager();

    var retratoEnOro = CP.Boolean("enOro");
    var retratoEnPlata = CP.Boolean("enPlata");
    var retratoEnPlomo = CP.Boolean("enPlomo");

    var inscripcionOro = CP.Boolean("No está en plata");
    var inscripcionPlata = CP.Boolean("No está en plata");
    var inscripcionPlomo = CP.Boolean("Está en plomo");

    var inscripciones = [
        inscripcionOro,inscripcionPlata,inscripcionPlomo
    ];

    CP.Iff( CP.Not(retratoEnPlata), inscripcionOro ).asTrue().rename("La inscripcion oro es verdad");
    CP.Iff( CP.Not(retratoEnPlata), inscripcionPlata ).asTrue().rename("La inscripción plata es verdad");
    CP.Iff( retratoEnPlomo, inscripcionPlomo ).asTrue().rename("La inscripción plomo es verdad");

    var soloUnRetrato = CP.SomeTrue([retratoEnOro,retratoEnPlata,retratoEnPlomo],1).
        rename("Solo un retrato en total").
        asTrue();


    var almenosUnaVerdadYUnaMentira =  CP.SomeTrue(inscripciones,1,2).
        rename( "Al menos una inscripción verdad y otra mentria" ).
        asTrue();


    var cps = [retratoEnOro,retratoEnPlata,retratoEnPlomo];//.concat(inscripciones);
    CPBacktrack(cps, function(cps){
        assert(retratoEnOro.isTrue());
        var println = function(s){console.log("** " + s )};
        println( "************************************");

        //cps = CP.cps();
        for( var i = 0 ; i < cps.length ; i++ ){
            println( cps[i].toString() );
        }
    });
}


function porciaIII(){
    var CP = new CPManager();

    var retratoEnOro = CP.Boolean("enOro");
    var retratoEnPlata = CP.Boolean("enPlata");
    var retratoEnPlomo = CP.Boolean("enPlomo");

    var inscripcionOro1 = CP.Boolean("No está en oro");
    var inscripcionOro2 = CP.Boolean("Es veneciano");
    var inscripcionPlata1 = CP.Boolean("No está en oro");
    var inscripcionPlata2 = CP.Boolean("Es florentino");
    var inscripcionPlomo1 = CP.Boolean("No está en plomo");
    var inscripcionPlomo2 = CP.Boolean("Está en plata");

    var inscripciones = [
        inscripcionOro1, inscripcionOro2,
        inscripcionPlata1,inscripcionPlata2,
        inscripcionPlomo1, inscripcionPlomo2
    ];

    CP.Or([inscripcionOro1,inscripcionOro2]).asTrue().rename("Al menos una frase verdadera en oro");
    CP.Or([inscripcionPlata1,inscripcionPlata2]).asTrue().rename("Al menos una frase verdadera en plata");
    CP.Or([inscripcionPlomo1,inscripcionPlomo2]).asTrue().rename("Al menos una frase verdadera en plomo");

    var orihundo = [inscripcionPlata2,inscripcionOro2];
    CP.SomeTrue(orihundo,0,1).asTrue().rename( "Orihundo de solo un sitio" );
          


    CP.Iff( CP.Not(retratoEnOro), inscripcionOro1 ).asTrue().rename("La inscripcion oro1 es verdad");
    CP.Iff( CP.Not(retratoEnOro), inscripcionPlata1 ).asTrue().rename("La inscripción plata1 es verdad");
    CP.Iff( CP.Not(retratoEnPlomo), inscripcionPlomo1 ).asTrue().rename("La inscripción plomo1 es verdad");
    CP.Iff( retratoEnPlata, inscripcionPlomo2 ).asTrue().rename("La inscripción plomo2 es verdad");


    CP.SomeTrue([retratoEnOro,retratoEnPlata,retratoEnPlomo],1).
        rename("Solo un retrato en total").
        asTrue();


    var cps = [retratoEnOro,retratoEnPlata,retratoEnPlomo];
    CPBacktrack(cps, function(cps){
        assert(retratoEnPlata.isTrue());
        
        var println = function(s){console.log("** " + s )};
        println( "************************************");

        //cps = CP.cps();
        for( var i = 0 ; i < cps.length ; i++ ){
            println( cps[i].toString() );
        }
    });
}

porciaI();
porciaII();
porciaIII();












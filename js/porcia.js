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

function porciaIV(){

    function unaCajaDos_unaCajaUna_unaCajaNinguna(cajaOro,cajaPlata,cajaOro){
    
        function cero_una_dos(cp1,cp2,cp3){
            return CP.And( [
                CP.SomeTrue(cp1,0),
                CP.SomeTrue(cp2,1),
                CP.SomeTrue(cp3,2)] );
        }
        
        
        CP.SomeTrue([
            cero_una_dos(cajaOro,cajaPlata,cajaPlomo),
            cero_una_dos(cajaOro,cajaPlomo,cajaPlata),
            cero_una_dos(cajaPlata,cajaOro,cajaPlomo),
            cero_una_dos(cajaPlata,cajaPlomo,cajaOro),
            cero_una_dos(cajaPlomo,cajaOro,cajaPlata),
            cero_una_dos(cajaPlomo,cajaPlata,cajaOro)], 1).asTrue().rename("Una caja dos una caja una una caja ninguna");
    }

    var CP = new CPManager();

    var retratoEnOro = CP.Boolean("enOro");
    var retratoEnPlata = CP.Boolean("enPlata");
    var retratoEnPlomo = CP.Boolean("enPlomo");
    CP.SomeTrue([retratoEnOro,retratoEnPlata,retratoEnPlomo],1).
        rename("Solo un retrato en total").
        asTrue();

    var inscripcionOro1 = CP.Boolean("No está en oro");
    var inscripcionOro2 = CP.Boolean("Está en plata");
    var inscripcionPlata1 = CP.Boolean("No está en oro");
    var inscripcionPlata2 = CP.Boolean("Está en plomo");
    var inscripcionPlomo1 = CP.Boolean("No está en plomo");
    var inscripcionPlomo2 = CP.Boolean("Está en oro");

    var cajaOro = [inscripcionOro1,inscripcionOro2];
    var cajaPlata = [inscripcionPlata1,inscripcionPlata2];
    var cajaPlomo = [inscripcionPlomo1,inscripcionPlomo2];
    unaCajaDos_unaCajaUna_unaCajaNinguna(cajaOro,cajaPlata,cajaOro);


    CP.Iff( CP.Not(retratoEnOro), inscripcionOro1 ).asTrue().rename("La inscripcion oro1 es verdad");
    CP.Iff( retratoEnPlata, inscripcionOro2 ).asTrue().rename("La inscripcion oro2 es verdad");
    CP.Iff( CP.Not(retratoEnOro), inscripcionPlata1 ).asTrue().rename("La inscripción plata1 es verdad");
    CP.Iff( retratoEnPlomo, inscripcionPlata2 ).asTrue().rename("La inscripción plata2 es verdad");
    CP.Iff( CP.Not(retratoEnPlomo), inscripcionPlomo1 ).asTrue().rename("La inscripción plomo1 es verdad");
    CP.Iff( retratoEnOro, inscripcionPlomo2 ).asTrue().rename("La inscripción plomo2 es verdad");

    var cps = [retratoEnOro,retratoEnPlata,retratoEnPlomo];
    CPBacktrack(cps, function(cps){
        assert(retratoEnPlomo.isTrue());
        var println = function(s){console.log("** " + s )};
        println( "************************************");

        //cps = CP.cps();
        for( var i = 0 ; i < cps.length ; i++ ){
            println( cps[i].toString() );
        }
    });

}

function porciaV(){
    var CP = new CPManager();

    var dagaEnOro = CP.Boolean("enOro");
    var dagaEnPlata = CP.Boolean("enPlata");
    var dagaEnPlomo = CP.Boolean("enPlomo");


    var belliniHizoOro = CP.Boolean("BelliniHizoOro");
    var belliniHizoPlata = CP.Boolean("BelliniHizoPlata");
    var belliniHizoPlomo = CP.Boolean("BelliniHizoPlomo");

    var inscripcionPlomo = CP.SomeTrue([belliniHizoOro,belliniHizoPlata,belliniHizoPlomo],0,1).rename("Todo lo más uno es de Bellini");

    CP.Iff( belliniHizoOro, dagaEnOro ).asTrue();
    CP.Iff( belliniHizoPlata, CP.Not(dagaEnPlata) ).asTrue();
    CP.Iff( belliniHizoPlomo, inscripcionPlomo).asTrue();

    CP.SomeTrue([dagaEnOro,dagaEnPlata,dagaEnPlomo],1).
        rename("Solo un daga en total").
        asTrue();


    let cps = [dagaEnOro,dagaEnPlata,dagaEnPlomo,inscripcionPlomo];
    CPBacktrack(cps, function(cps){

        
        var println = function(s){console.log("** " + s )};
        println( "************************************");

        var cps = CP.cps();
        for( var i = 0 ; i < cps.length ; i++ ){
            println( cps[i].toString() );
        }
    });
}

//porciaI();
//porciaII();
//porciaIII();
//porciaIV();
porciaV();












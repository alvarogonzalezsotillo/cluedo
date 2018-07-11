if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    var cpb = require("./cp.backtrack.js");
    log = common.log;
    CPManager = cp.CPManager;
    CPBacktrack = cpb.CPBacktrack;
}


class Cofre{
    constructor(CP,nombre){
        this._nombre = nombre;
        this._diceLaVerdad = CP.Boolean("El cofre " + this._nombre + " dice la verdad");
        this._cofreLleno = CP.Boolean( "El cofre " + this._nombre + " está lleno" );
    }

    get nombre(){
        return this._nombre;
    }

    set inscripcion(i){
        if( typeof this._inscripcion != "undefined" ){
            throw new Error("No se puede cambiar la inscripción de un cofre");
        }
        this._inscripcion = i;
        this._implicacion = this.CP.Iff( this.diceLaVerdad, this._inscripcion ).asTrue();
    }

    get inscripcion(){
        return this._inscripcion;
    }
    

    get implicacion(){
        return this._implicacion;
    }

    get diceLaVerdad(){
        return this._diceLaVerdad;
    }

    get cofreLleno(){
        return this._cofreLleno;
    }

    get CP(){
        return this.diceLaVerdad.manager();
    }

    static soloUnCofreLleno(cofres){
        var llenos = cofres.map( c => c.cofreLleno );
        let CP = cofres[0].CP;
        var soloUnoLleno = CP.SomeTrue(llenos,1).
            rename("Solo un cofre lleno en total").
            asTrue();
        return soloUnoLleno;
    }

    static creaCofres(CP,nombres){
        var ret = nombres.map( n => new Cofre(CP,n) );
        Cofre.soloUnCofreLleno(ret);
        return ret;
    }

}

function porciaI_cofre(){
    let CP = new CPManager();
    let cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    let [cofreOro,cofrePlata,cofrePlomo] = cofres;

    cofreOro.inscripcion = cofreOro.cofreLleno;
    cofrePlata.inscripcion = CP.Not(cofrePlata.cofreLleno);
    cofrePlomo.inscripcion = CP.Not(cofreOro.cofreLleno);

    CP.SomeTrue(cofres.map(c=>c.inscripcion),0,1).
        rename( "Como mucho una inscripcion es cierta").
        asTrue();

    var cps = cofres.map(c=>c.cofreLleno);
    CPBacktrack(cps, function(cps){
        var println = function(s){console.log("** " + s )};
        println( "************************************");
        for( var i = 0 ; i < cps.length ; i++ ){
            println( cps[i].toString() );
        }
    });

    
}

function porciaI(){
    /*
      En El mercader de Venecia, de Shakespeare, Porcia tenia tres cofres —uno de oro, otro de plata y otro de plomo—, dentro de uno de los cuales estaba el retrato de Porcia. El pretendiente tenía que elegir uno de los cofres y si tenía suerte (o inteligencia) elegiría el que tenía el retrato, pudiendo así pedir a Porcia por esposa. En la tapa de cada cofre había una inscripción para ayudar al pretendiente a elegir sabiamente.

      Pero supongamos que Porcia quisiera elegir marido, no por su bondad, sino por su inteligencia. Tendría las siguientes inscripciones en los cofres:

      Oro

      EL RETRATO ESTÁ EN ESTE COFRE

      Plata

      EL RETRATO NO ESTÁ AQUÍ

      Plomo

      EL RETRATO NO ESTÁ EN EL COFRE DE ORO

      Porcia explicó al pretendiente que de los tres enunciados, a lo sumo uno era verdad. ¿Cuál cofre debe de elegir el pretendiente?


     */
    var CP = new CPManager();

    var retratoEnOro = CP.Boolean("enOro");
    var retratoEnPlata = CP.Boolean("enPlata");
    var retratoEnPlomo = CP.Boolean("enPlomo");

    var inscripcionOro = CP.Boolean("EL RETRATO ESTÁ EN ESTE COFRE");
    var inscripcionPlata = CP.Boolean("EL RETRATO NO ESTÁ AQUÍ");
    var inscripcionPlomo = CP.Boolean("EL RETRATO NO ESTÁ EN EL COFRE DE ORO");

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

    var inscripcionPlomo = CP.SomeTrue([belliniHizoOro,belliniHizoPlata,belliniHizoPlomo],0,1).
        rename("Todo lo más uno es de Bellini");

    CP.Iff( belliniHizoOro, dagaEnOro ).asTrue();
    CP.Iff( belliniHizoPlata, CP.Not(dagaEnPlata) ).asTrue();
    CP.Iff( belliniHizoPlomo, inscripcionPlomo).asTrue();

    CP.SomeTrue([dagaEnOro,dagaEnPlata,dagaEnPlomo],1).
        rename("Solo un daga en total").
        asTrue();

    var abrirOro = CP.Or([dagaEnPlata,dagaEnPlomo]).rename("abrirOro");
    var abrirPlata = CP.Or([dagaEnOro,dagaEnPlomo]).rename("abrirPlata");
    var abrirPlomo = CP.Or([dagaEnOro,dagaEnPlata]).rename("abrirPlomo");

    let cps = [belliniHizoOro,belliniHizoPlata,belliniHizoPlomo];



    var abrirSiempreOro = CP.ForAll(cps,abrirOro).rename("Abrir siempre oro");
    var abrirSiemprePlomo = CP.ForAll(cps,abrirPlomo).rename("Abrir siempre plomo");
    var abrirSiemprePlata = CP.ForAll(cps,abrirPlata).rename("Abrir siempre plata");

    console.log( abrirSiempreOro.toString() );
    console.log( abrirSiemprePlata.toString() );
    console.log( abrirSiemprePlomo.toString() );
    
}


function porciaVI(){
    var CP = new CPManager();

    var retratoEnOro = CP.Boolean("enOro");
    var retratoEnPlata = CP.Boolean("enPlata");


    var belliniHizoOro = CP.Boolean("BelliniHizoOro");
    var belliniHizoPlata = CP.Boolean("BelliniHizoPlata");

    var inscripcionPlata = CP.SomeTrue([belliniHizoOro,belliniHizoPlata],1).
        rename("Uno y solo uno es de Bellini");

    CP.Iff( belliniHizoOro, retratoEnPlata ).asTrue();
    CP.Iff( belliniHizoPlata, inscripcionPlata).asTrue();

    CP.SomeTrue([retratoEnOro,retratoEnPlata],1).
        rename("Solo un daga en total").
        asTrue();

    let cps = [belliniHizoOro,belliniHizoPlata];



    var abrirSiempreOro = CP.ForAll(cps,retratoEnOro).rename("Abrir siempre oro");
    var abrirSiemprePlata = CP.ForAll(cps,retratoEnPlata).rename("Abrir siempre plata");


    console.log( abrirSiempreOro.toString() );
    console.log( abrirSiemprePlata.toString() );
    
}


function porciaVII(){
    var CP = new CPManager();

    var retratoEnOro = CP.Boolean("enOro");
    var retratoEnPlata = CP.Boolean("enPlata");
    var retratoEnPlomo = CP.Boolean("enPlomo");


    var belliniHizoOro = CP.Boolean("BelliniHizoOro");
    var belliniHizoPlata = CP.Boolean("BelliniHizoPlata");
    var belliniHizoPlomo = CP.Boolean("BelliniHizoPlomo");

    var inscripcionOro = retratoEnOro;
    var inscripcionPlata = retratoEnPlata;
    var inscripcionPlomo = CP.SomeTrue( [belliniHizoOro,belliniHizoPlata,belliniHizoPlomo], 0, 1).
        rename("Por lo menos dos cofres son de Cellini");

    CP.Iff( belliniHizoOro, inscripcionOro ).asTrue();
    CP.Iff( belliniHizoPlata, inscripcionPlata).asTrue();
    CP.Iff( belliniHizoPlomo, inscripcionPlomo).asTrue();

    CP.SomeTrue([retratoEnOro,retratoEnPlata,retratoEnPlomo],1).
        rename("Solo un daga en total").
        asTrue();

    let bellinis = [belliniHizoOro,belliniHizoPlata,belliniHizoPlomo];
    
    let siempreEnOro = CP.ForAll( bellinis, retratoEnOro ).rename("Está en oro");
    let siempreEnPlata = CP.ForAll( bellinis, retratoEnPlata ).rename( "Está en plata");
    let siempreEnPlomo = CP.ForAll( bellinis, retratoEnPlomo ).rename("Está en plomo");

    CP.SomeTrue( [siempreEnOro,siempreEnPlata,siempreEnPlomo], 1 );

    console.log( siempreEnOro.toString() );
    console.log( siempreEnPlata.toString() );
    console.log( siempreEnPlomo.toString() );
    
}

let print = function(s){console.log("===== " + s + " =====")};
print( "PORCIA-I");
porciaI();
print( "PORCIA-II");
porciaII();
print( "PORCIA-III");
porciaIII();
print( "PORCIA-IV");
porciaIV();
print( "PORCIA-V");
porciaV();
print( "PORCIA-VI");
porciaVI();
print( "PORCIA-VII");
porciaVII();












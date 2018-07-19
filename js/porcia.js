if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    var cpb = require("./cp.backtrack.js");
    log = common.log;
    CPManager = cp.CPManager;
    CPBacktrack = cpb.CPBacktrack;
    CPAllPosibilities = cp.CPAllPosibilities;
}


class Cofre{
    constructor(manager,nombre){
        this._manager = manager;
        this._nombre = nombre;
        this._cofreLleno = manager.Boolean( "El cofre " + this._nombre + " está lleno" );
    }

    get nombre(){
        return this._nombre;
    }

    set inscripciones(ins){
        if( typeof this._inscripciones != "undefined" ){
            throw new Error("No se pueden cambiar las inscripciones de un cofre");
        }


        
        this._inscripciones = ins.slice(0);

        this._diceLaVerdad = [];
        this._implicaciones = [];
        for( let i = 0 ; i < ins.length ; i++ ){
            this._diceLaVerdad.push( this.manager.Boolean("La inscripción " + i + " del cofre " + this._nombre + " dice la verdad") );
            this._implicaciones.push( this.manager.Iff( this._diceLaVerdad[i], ins[i] ).asTrue() );
        }
    }

    get inscripciones(){
        return this._inscripciones.slice(0);
    }
    

    get implicaciones(){
        return this._implicaciones.slice(0);
    }

    get cofreLleno(){
        return this._cofreLleno;
    }

    get manager(){
        return this._manager;
    }

    static soloUnCofreLleno(cofres){
        var llenos = cofres.map( c => c.cofreLleno );
        let manager = cofres[0].manager;
        var soloUnoLleno = manager.SomeTrue(llenos,1).
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

function listVariables(cps){
    var println = function(s){console.log("** " + s )};
    println( "************************************");
    for( var i = 0 ; i < cps.length ; i++ ){
        println( cps[i].toString() );
    }
}


function porcia(cofres,buscarCofreLleno){
    const CP = cofres[0].manager;
    const inscripciones = cofres.
          map(c=>c.inscripciones).
          reduce( (accum,value) => accum.concat(value) );

    const llenos = cofres.map( c=> c.cofreLleno);

    const eleccion = cofres.map( c=> CP.Boolean("Elección cofre " + c.nombre ) );

    const llenoSiempre = cofres.map(
        c => CP.ForAll(inscripciones,c.cofreLleno)
    );


    const posibilidadesLlenos = CPAllPosibilities(llenos);
    if( posibilidadesLlenos.length == 1 ){
        const indice = posibilidadesLlenos[0].indexOf(buscarCofreLleno);
        if( indice < 0 ){
            throw new Error("No se encuentra el cofre en la única combinación posible");
        }
        console.log( "1:" + cofres[indice] );
        return cofres[indice];
    }

    const posibilidadesInscripciones = CPAllPosibilities(inscripciones,llenos);
    if( posibilidadesInscripciones.length < 1 ){
        throw new Error("No hay ninguna posibilidad en las inscripciones");
    }
    for( let indice = 0 ; indice < cofres.length ; indice++ ){
        const lleno = posibilidadesInscripciones.map( p => p[indice] );
        if( lleno.every( b => b == buscarCofreLleno ) ){
            return cofres[indice];
            console.log( "2:" + cofres[indice] );
        }
    }
    throw new Error("No hay ninguna posibilidad válida en las inscripciones");
}


function porciaI_general(){
    let CP = new CPManager();
    let cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    let [cofreOro,cofrePlata,cofrePlomo] = cofres;

    cofreOro.inscripciones = [cofreOro.cofreLleno];
    cofrePlata.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlomo.inscripciones = [CP.Not(cofreOro.cofreLleno)];

    CP.SomeTrue(cofres.map(c=>c.inscripciones[0]),0,1).
        rename( "Como mucho una inscripcion es cierta").
        asTrue();

    const solucion = porcia(cofres,true);
    console.log("Se debe elegir el cofre:" + solucion.nombre);
}

function porciaI_cofre(){
    let CP = new CPManager();
    let cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    let [cofreOro,cofrePlata,cofrePlomo] = cofres;

    cofreOro.inscripciones = [cofreOro.cofreLleno];
    cofrePlata.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlomo.inscripciones = [CP.Not(cofreOro.cofreLleno)];

    CP.SomeTrue(cofres.map(c=>c.inscripciones[0]),0,1).
        rename( "Como mucho una inscripcion es cierta").
        asTrue();

    var cps = cofres.map(c=>c.cofreLleno);
    CPBacktrack(cps, listVariables );
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

function porciaIII_cofre(){
    let CP = new CPManager();
    let cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    let [cofreOro,cofrePlata,cofrePlomo] = cofres;

    let veneciano = CP.Boolean( "El autor es veneciano");
    
    cofreOro.inscripciones = [CP.Not(cofreOro.cofreLleno), veneciano];
    cofrePlata.inscripciones = [CP.Not(cofreOro.cofreLleno), CP.Not(veneciano)];
    cofrePlomo.inscripciones = [CP.Not(cofrePlomo.cofreLleno), cofrePlata.cofreLleno];

    CP.Or(cofreOro.inscripciones).asTrue().rename("Al menos una frase verdadera en oro");
    CP.Or(cofrePlata.inscripciones).asTrue().rename("Al menos una frase verdadera en plata");
    CP.Or(cofrePlomo.inscripciones).asTrue().rename("Al menos una frase verdadera en plomo");

    var cps = cofres.map(c=>c.cofreLleno);
    CPBacktrack(cps, listVariables );
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


function permutaciones(array){
    if( !array.length ){
        return [];
    }
    if( array.length == 1 ){
        return [array];
    }
    const head = array[0];
    const tail = array.slice(1);

    const subpermutaciones = permutaciones(tail);
    
    const ret = [];
    for( let i = 0 ; i < subpermutaciones.length ; i += 1 ){
        const subpermutacion = subpermutaciones[i];
        for( let p = 0 ; p < array.length ; p += 1 ){
            const nuevaPermutacion =
                  subpermutacion.slice(0,p).
                  concat([head]).
                  concat(subpermutacion.slice(p))
            ret.push(nuevaPermutacion)
        }
    }

    return ret;
}


function porciaIV_general(){
    const CP = new CPManager();
    const cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    const [cofreOro,cofrePlata,cofrePlomo] = cofres;

    
    cofreOro.inscripciones = [CP.Not(cofreOro.cofreLleno), cofrePlata.cofreLleno];
    cofrePlata.inscripciones = [CP.Not(cofreOro.cofreLleno), cofrePlomo.cofreLleno];
    cofrePlomo.inscripciones = [CP.Not(cofrePlomo.cofreLleno), cofreOro.cofreLleno];


    const posibilidades = permutaciones([
        cofreOro.inscripciones,
        cofrePlata.inscripciones,
        cofrePlomo.inscripciones
    ]).map(p => CP.And([
        CP.SomeTrue(p[0],0),
        CP.SomeTrue(p[1],1),
        CP.SomeTrue(p[2],2)
    ]));

    CP.SomeTrue(posibilidades,1).asTrue().rename("Una caja cierta, otra caja falsa, y otra caja a medias");
    
    const solucion = porcia(cofres,true);
    console.log("Se debe elegir el cofre:" + solucion.nombre);
}


function porciaIV_cofre(){
    const CP = new CPManager();
    const cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    const [cofreOro,cofrePlata,cofrePlomo] = cofres;

    
    cofreOro.inscripciones = [CP.Not(cofreOro.cofreLleno), cofrePlata.cofreLleno];
    cofrePlata.inscripciones = [CP.Not(cofreOro.cofreLleno), cofrePlomo.cofreLleno];
    cofrePlomo.inscripciones = [CP.Not(cofrePlomo.cofreLleno), cofreOro.cofreLleno];


    const posibilidades = permutaciones([
        cofreOro.inscripciones,
        cofrePlata.inscripciones,
        cofrePlomo.inscripciones
    ]).map(p => CP.And([
        CP.SomeTrue(p[0],0),
        CP.SomeTrue(p[1],1),
        CP.SomeTrue(p[2],2)
    ]));

    CP.SomeTrue(posibilidades,1).asTrue().rename("Una caja cierta, otra caja falsa, y otra caja a medias");
    

    const cps = cofres.map(c=>c.cofreLleno);
    CPBacktrack(cps, listVariables );
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


function porciaV_general(){
    const CP = new CPManager();
    const cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    const [cofreOro,cofrePlata,cofrePlomo] = cofres;


    const comoMuchoUnCofreDiceLaVerdad = CP.Boolean("Como mucho un cofre lo hizo Bellini");
    cofreOro.inscripciones = [cofreOro.cofreLleno];
    cofrePlata.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlomo.inscripciones = [comoMuchoUnCofreDiceLaVerdad];

    const inscripciones =
          cofreOro.inscripciones.
          concat(cofrePlata.inscripciones).
          concat(cofrePlomo.inscripciones);

    CP.Bind(
        comoMuchoUnCofreDiceLaVerdad,
        CP.SomeTrue(inscripciones,0,1)
    );

    const solucion = porcia(cofres,false);
    console.log( "Se debe abrir el cofre:" + solucion.nombre );

}


function porciaV_cofre(){
    const CP = new CPManager();
    const cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    const [cofreOro,cofrePlata,cofrePlomo] = cofres;


    const comoMuchoUnCofreDiceLaVerdad = CP.Boolean("Como mucho un cofre lo hizo Bellini");
    cofreOro.inscripciones = [cofreOro.cofreLleno];
    cofrePlata.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlomo.inscripciones = [comoMuchoUnCofreDiceLaVerdad];

    const inscripciones =
          cofreOro.inscripciones.
          concat(cofrePlata.inscripciones).
          concat(cofrePlomo.inscripciones);

    CP.Bind(
        comoMuchoUnCofreDiceLaVerdad,
        CP.SomeTrue(inscripciones,0,1)
    );


    const abrirSiempreOro = CP.ForAll(inscripciones,CP.Not(cofreOro.cofreLleno)).rename("Abrir siempre oro");
    const abrirSiemprePlata = CP.ForAll(inscripciones,CP.Not(cofrePlata.cofreLleno)).rename("Abrir siempre plata");
    const abrirSiemprePlomo = CP.ForAll(inscripciones,CP.Not(cofrePlomo.cofreLleno)).rename("Abrir siempre plomo");

    console.log( abrirSiempreOro.toString() );
    console.log( abrirSiemprePlata.toString() );
    console.log( abrirSiemprePlomo.toString() );
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

    var abrirOro = CP.Not(dagaEnOro).rename("abrirOro");
    var abrirPlata = CP.Not(dagaEnPlata).rename("abrirPlata");
    var abrirPlomo = CP.Not(dagaEnPlomo).rename("abrirPlomo");

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
print( "PORCIA-I GENERAL");
porciaI_general();
print( "PORCIA-I COFRE");
porciaI_cofre();
print( "PORCIA-I");
porciaI();


print( "PORCIA-II");
porciaII();

print( "PORCIA-III COFRE")
porciaIII_cofre();
print( "PORCIA-III");
porciaIII();

print( "PORCIA-IV GENERAL");
porciaIV_general();
print( "PORCIA-IV COFRE");
porciaIV_cofre();
print( "PORCIA-IV");
porciaIV();

print( "PORCIA-V GENERAL");
porciaV_general();
print( "PORCIA-V COFRE");
porciaV_cofre();
print( "PORCIA-V");
porciaV();

//print( "PORCIA-VI");
//porciaVI();
//print( "PORCIA-VII");
//porciaVII();












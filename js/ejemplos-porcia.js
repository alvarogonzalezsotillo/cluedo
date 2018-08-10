if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    var cpb = require("./cp.backtrack.js");
    var p = require("./porcia.js");

    log = common.log;
    CPManager = cp.CPManager;
    CPBacktrack = cpb.CPBacktrack;
    CPAllPosibilities = CPManager.CPAllPosibilities;
    porcia = p.porcia;
    Cofre = p.Cofre;
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

function porciaII_general(){
    var CP = new CPManager();

    let cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    let [cofreOro,cofrePlata,cofrePlomo] = cofres;

    cofreOro.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlata.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlomo.inscripciones = [cofrePlomo.cofreLleno];


    CP.SomeTrue(cofres.map(c=>c.inscripciones[0]),1,2).
        rename( "Al menos una inscripción verdad y otra mentria" ).
        asTrue();

    const solucion = porcia(cofres,true);
    console.log("Se debe elegir el cofre:" + solucion.nombre);
    
}

function porciaIII_general(){
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

    const solucion = porcia(cofres,true);
    console.log("Se debe elegir el cofre:" + solucion.nombre);
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

function porciaVI_general(){
    var CP = new CPManager();

    const cofres = Cofre.creaCofres(CP,["Oro","Plata"]);
    const [cofreOro,cofrePlata] = cofres;

    const unoYSoloUnoEsDeBellini = CP.Boolean("Un cofre y solo uno es de Bellini");
    
    cofreOro.inscripciones = [ cofrePlata.cofreLleno ];
    cofrePlata.inscripciones = [ unoYSoloUnoEsDeBellini ];

    const todasLasInsripciones = cofreOro.inscripciones.concat(cofrePlata.inscripciones);
    
    CP.Bind( unoYSoloUnoEsDeBellini, CP.SomeTrue(todasLasInsripciones,1) );

    const solucion = porcia(cofres,true);
    console.log( "Se debe abrir el cofre:" + solucion.nombre );

    
}


function porciaVII_general(){
    var CP = new CPManager();
    const cofres = Cofre.creaCofres(CP,["Oro","Plata", "Plomo"]);
    const [cofreOro,cofrePlata,cofrePlomo] = cofres;

    const alMenosDosCofresDeCellini = CP.Boolean( "Por lo menos dos cofres son de Cellini");

    cofreOro.inscripciones = [ cofreOro.cofreLleno ];
    cofrePlata.inscripciones = [ cofrePlata.cofreLleno ];
    cofrePlomo.inscripciones = [ alMenosDosCofresDeCellini ];

    const inscripciones = cofreOro.inscripciones.concat( cofrePlata.inscripciones ).concat(cofrePlomo.inscripciones);
    CP.Bind( alMenosDosCofresDeCellini, CP.SomeTrue(inscripciones,0,1));

    const solucion = porcia(cofres,true);
    console.log( "Se debe abrir el cofre:" + solucion.nombre );

}

let print = function(s){console.log("===== " + s + " =====")};
print( "PORCIA-I GENERAL");
porciaI_general();

print( "PORCIA-II GENERAL");
porciaII_general();

print( "PORCIA-III GENERAL")
porciaIII_general();

print( "PORCIA-IV GENERAL");
porciaIV_general();

print( "PORCIA-V GENERAL");
porciaV_general();

print( "PORCIA-VI GENERAL");
porciaVI_general();

print( "PORCIA-VII GENERAL");
porciaVII_general();













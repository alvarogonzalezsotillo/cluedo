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

/*
En /El mercader de Venecia/, de Shakespeare, Porcia tenia tres cofres
---uno de oro, otro de plata y otro de plomo---, dentro de uno de los
cuales estaba el retrato de Porcia. El pretendiente tenía que elegir uno
de los cofres y si tenía suerte (o inteligencia) elegiría el que tenía
el retrato, pudiendo así pedir a Porcia por esposa. En la tapa de cada
cofre había una inscripción para ayudar al pretendiente a elegir
sabiamente.

Pero supongamos que Porcia quisiera elegir marido, no por su bondad,
sino por su inteligencia. Tendría las siguientes inscripciones en los
cofres:

#+BEGIN_QUOTE
  Oro

  EL RETRATO ESTÁ EN ESTE COFRE

  Plata

  EL RETRATO NO ESTÁ AQUÍ

  Plomo

  EL RETRATO NO ESTÁ EN EL COFRE DE ORO
#+END_QUOTE

Porcia explicó al pretendiente que de los tres enunciados, a lo sumo uno
era verdad. ¿Cuál cofre debe de elegir el pretendiente?
*/
function porciaI(){
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
    console.log("Se debe elegir el cofre:" + solucion.cofre.nombre);
}

/*
El pretendiente eligió correctamente, así que se casaron y vivieron
bastante felices... por lo menos durante algún tiempo. Pero un día
Porcia pensó: «Aunque mi marido demostró una cierta inteligencia al
elegir el cofre bueno, en realidad el problema no era tan difícil. Sin
duda podía haber puesto un problema más difícil y haber conseguido un
marido realmente inteligente.» Así pues se divorció inmediatamente de su
marido decidida a casarse con otro más listo.

Esta vez en los tres consabidos cofres aparecían las siguientes
inscripciones:

#+BEGIN_QUOTE
  Oro

  EL RETRATO NO ESTÁ EN EL COFRE DE PLATA

  Plata

  EL RETRATO NO ESTÁ EN ESTE COFRE

  Plomo

  EL RETRATO ESTÁ EN ESTE COFRE
#+END_QUOTE

Porcia explicó al pretendiente que por lo menos uno de los tres
enunciados era verdadero y que por lo menos otro era falso.

¿En cuál de los cofres está el retrato?
*/
function porciaII(){
    var CP = new CPManager();

    let cofres = Cofre.creaCofres(CP,["Oro","Plata","Plomo"]);
    let [cofreOro,cofrePlata,cofrePlomo] = cofres;

    cofreOro.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlata.inscripciones = [CP.Not(cofrePlata.cofreLleno)];
    cofrePlomo.inscripciones = [cofrePlomo.cofreLleno];


    CP.SomeTrue(cofres.map(c=>c.inscripciones[0]),1,2).
        rename( "Al menos una inscripción verdad y otra mentira" ).
        asTrue();

    const solucion = porcia(cofres,true);
    console.log("Se debe elegir el cofre:" + solucion.cofre.nombre);
    
}

/*
En ésta las tapas de los cofres tenían dos enunciados, y Porcia explicó
que ninguna de ellas tenía más que un enunciado falso.

#+BEGIN_QUOTE
  Oro

  (1) EL RETRATO NO ESTÁ AQUÍ

  (2) EL ARTISTA QUE HIZO EL RETRATO ES VENECIANO

  Plata

  (1) EL RETRATO NO ESTÁ EN EL DE ORO

  (2) EL ARTISTA QUE HIZO EL RETRATO SÍ ES FLORENTINO

  Plomo

  (1) EL RETRATO NO ESTÁ AQUÍ

  (2) EL RETRATO SÍ QUE ESTÁ EN EL COFRE DE PLATA
#+END_QUOTE

¿En qué cofre está el retrato?
*/
function porciaIII(){
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
    console.log("Se debe elegir el cofre:" + solucion.cofre.nombre);
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


/*
Si el pretendiente pasaba la primera prueba era conducido a otra
habitación en la cual había otros tres cofres, que también tenían dos
inscripciones en la tapa. Porcia explicó que en una de las tapas los dos
enunciados eran verdaderos; en otra ambos eran falsos, y en la tercera
uno era verdadero y otro falso:

#+BEGIN_QUOTE
  Oro

  (1) EL RETRATO NO ESTÁ EN ESTE COFRE

  (2) ESTÁ EN EL DE PLATA

  Plata

  (1) EL RETRATO NO ESTÁ EN EL DE ORO

  (2) ESTÁ EN EL DE PLOMO

  Plomo

  (1) EL RETRATO NO ESTÁ EN ESTE COFRE

  (2) ESTÁ EN EL DE ORO
#+END_QUOTE

¿En qué cofre estaba el retrato?
*/
function porciaIV(){
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
    console.log("Se debe elegir el cofre:" + solucion.cofre.nombre);
}



/*
El pretendiente del cuento anterior pasó ambas pruebas y, muy contento,
pidió a Porcia por esposa. Se casaron, vivieron felices y tuvieron una
bellísima hija. Porcia III, a la que de aquí en adelante llamaremos
simplemente Porcia. Ésta creció hasta convertirse en una bella e
inteligente jovencita, exactamente igual que su mamá y que su abuelita,
y que también decidió elegir marido por el método del cofre. ¡El
enamorado tendría que pasar tres pruebas para conseguir su mano! Las
tales pruebas eran bastante ingeniosas. Volvió a la técnica de su abuela
de poner una sola inscripción en cada cofre, pero añadió un nuevo truco:
explicaba al pretendiente que cada uno de los cofres lo había hecho uno
de dos afamados artistas florentinos ---o Cellini o Bellini. Todos los
cofres de Cellini tenían inscripción falsa mientras que Bellini siempre
les ponía una inscripción verdadera.

***** 69A. PRIMERA PRUEBA

En esta original prueba, el pretendiente (si contestaba a ciegas)
tendría dos posibilidades sobre tres de acertar, en vez de una sobre
tres. En vez de un retrato, Porcia metía una daga en uno de los cofres y
dejaba los otros dos vacíos. Si el pretendiente conseguía evitar el
cofre de la daga, podía pasar a la prueba siguiente. Las inscripciones
rezaban así:

#+BEGIN_QUOTE
  Oro

  LA DAGA ESTÁ AQUÍ

  Plata

  ESTE COFRE ESTÁ VACÍO

  Plomo

  TODO LO MÁS UNO DE ESTOS\\
  COFRES LO HIZO BELLINI
#+END_QUOTE

¿Qué cofre tenía que elegir?

*/
function porciaV(){
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
    console.log( "Se debe abrir el cofre:" + solucion.cofre.nombre );
}

/*
En ésta el pretendiente (si contestara sin pensar) tendría un cincuenta
por ciento de posibilidades de acertar. Porcia le ponía sólo dos cofres,
el de oro y el de plata; uno de ellos contenía su retrato (en esta
prueba no utilizaba daga). Los cofres eran obra o de Cellini o de
Bellini y en ellos se leía:

#+BEGIN_QUOTE
  Oro

  EL RETRATO NO ESTÁ AQUÍ

  Plata

  UNO Y NADA MÁS QUE UNO DE ESTOS\\
  DOS COFRES ES OBRA DE BELLINI
#+END_QUOTE

¿Cuál tenía que elegir el pretendiente para hallar el retrato?
*/
function porciaVI(){
    var CP = new CPManager();

    const cofres = Cofre.creaCofres(CP,["Oro","Plata"]);
    const [cofreOro,cofrePlata] = cofres;

    const unoYSoloUnoEsDeBellini = CP.Boolean("Un cofre y solo uno es de Bellini");
    
    cofreOro.inscripciones = [ cofrePlata.cofreLleno ];
    cofrePlata.inscripciones = [ unoYSoloUnoEsDeBellini ];

    const todasLasInscripciones = cofreOro.inscripciones.concat(cofrePlata.inscripciones);
    
    CP.Bind( unoYSoloUnoEsDeBellini, CP.SomeTrue(todasLasInscripciones,1) );

    const solucion = porcia(cofres,true);
    console.log( "Se debe abrir el cofre:" + solucion.cofre.nombre );
}


/*
Suponiendo que el pretendiente pasara las dos primeras pruebas, se le
conducía a otra habitación en la que había de nuevo tres cofres, uno de
oro, otro de plata y otro de plomo, hechos también o por Bellini o por
Cellini. En esta prueba las oportunidades de acertar del pretendiente
(en caso de que contestara a ciegas) eran una de cada tres. Porcia
colocaba su retrato en uno de los tres y el pretendiente había de (1)
elegir el cofre que tuviera el retrato y (2) adivinar el autor de cada
uno de los cofres. Las inscripciones decían:

#+BEGIN_QUOTE
  Oro

  EL RETRATO ESTÁ AQUÍ

  Plata

  EL RETRATO ESTÁ AQUÍ

  Plomo

  POR LO MENOS DOS DE ESTOS TRES\\
  COFRES SON OBRA DE CELLINI
#+END_QUOTE

¿Cuál es la solución?
*/
function porciaVII(){
    var CP = new CPManager();
    const cofres = Cofre.creaCofres(CP,["Oro","Plata", "Plomo"]);
    const [cofreOro,cofrePlata,cofrePlomo] = cofres;

    const alMenosDosCofresDeCellini = CP.Boolean( "Por lo menos dos cofres son de Cellini");

    cofreOro.inscripciones = [ cofreOro.cofreLleno ];
    cofrePlata.inscripciones = [ cofrePlata.cofreLleno ];
    cofrePlomo.inscripciones = [ alMenosDosCofresDeCellini ];

    const inscripciones = cofreOro.inscripciones.
          concat( cofrePlata.inscripciones ).
          concat(cofrePlomo.inscripciones);
    CP.Bind( alMenosDosCofresDeCellini, CP.SomeTrue(inscripciones,0,1));

    const solucion = porcia(cofres,true);
    console.log( "Se debe abrir el cofre:" + solucion.cofre.nombre );
}

let print = function(s){console.log("===== " + s + " =====")};
print( "PORCIA-I GENERAL");
porciaI();

print( "PORCIA-II GENERAL");
porciaII();

print( "PORCIA-III GENERAL")
porciaIII();

print( "PORCIA-IV GENERAL");
porciaIV();

print( "PORCIA-V GENERAL");
porciaV();

print( "PORCIA-VI GENERAL");
porciaVI();

print( "PORCIA-VII GENERAL");
porciaVII();













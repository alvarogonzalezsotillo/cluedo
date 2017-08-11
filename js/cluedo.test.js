
// NECESARIO PARA NODE.JS, INNECESARIO EN UN NAVEGADOR
if( typeof require != "undefined"){
    var cp = require("./cp");
    var common = require("./common");
    var cluedo = require("./cluedo");
    CP = cp.CP;
    assert = common.assert;
    Cluedo = cluedo.Cluedo;
    PlayersFact = cluedo.PlayersFact;
    PlayerHasSomeFact = cluedo.PlayerHasSomeFact;
    PlayerDoesntHaveAnyFact = cluedo.PlayerDoesntHaveAnyFact;
    EnvelopeDoesntHaveFact = cluedo.EnvelopeDoesntHaveFact;
    CluedoFlavors = cluedo.CluedoFlavors;
}




var flavor = CluedoFlavors.test;
var characterNames = flavor.characterNames;
var toolNames = flavor.toolNames;
var placeNames = flavor.placeNames;


var facts = [
    new PlayersFact( CluedoFlavors.defaultPlayerCardsForFlavor(3,flavor)),
    
    new PlayerHasSomeFact(0,[characterNames[0]]),
    new PlayerHasSomeFact(1,[characterNames[0],characterNames[1],characterNames[2]]),
    new PlayerDoesntHaveAnyFact(1,[characterNames[1]]),


    new PlayerHasSomeFact(1,[toolNames[0]]),

    new PlayerDoesntHaveAnyFact(0,[placeNames[0]]),
    new PlayerDoesntHaveAnyFact(1,[placeNames[0]]),
    new PlayerDoesntHaveAnyFact(2,[placeNames[0]]),

    new EnvelopeDoesntHaveFact([characterNames[1],toolNames[1],placeNames[0]])
];

var factsA = [
    new PlayersFact( [6,6,6] ),
    new PlayerHasSomeFact(0,["Herramienta"]),
    new PlayerHasSomeFact(0,["Sala de billar"]),
    new PlayerHasSomeFact(0,["Rubio"]),
    new PlayerHasSomeFact(0,["Cocina"]),
    new PlayerHasSomeFact(0,["Vestíbulo"]),
    new PlayerHasSomeFact(0,["Candelabro"]),
    new PlayerHasSomeFact(1,["Rubio","Herramienta","Estudio"]),
    new PlayerDoesntHaveAnyFact(2,["Vestíbulo","Rubio","Candelabro"]),

    new PlayerHasSomeFact(0,["Amapola","Cuerda","Vestíbulo"]),

    new PlayerHasSomeFact(1,["Estudio"]),
    new PlayerHasSomeFact(1,["Pistola"]),
    new PlayerHasSomeFact(2,["Sala de baile"]),
    new PlayerHasSomeFact(2, ["Vestíbulo","Celeste","Puñal"] ),
    new PlayerHasSomeFact(1,["Biblioteca","Orquídea","Pistola"]),
    new PlayerHasSomeFact(1,["Orquídea"]),
    new PlayerHasSomeFact(1,["Prado"]),
    new PlayerHasSomeFact(2,["Comedor","Rubio","Candelabro"]),

    new PlayerHasSomeFact(2,["Puñal"]),

    new PlayerDoesntHaveAnyFact(1, ["Mora","Cocina","Cuerda"]),
    
    new PlayerDoesntHaveAnyFact(1, ["Mora","Cocina","Cuerda"]),

    new PlayerHasSomeFact(2,["Mora"]),

    new PlayerHasSomeFact( 1, ["Cuerda","Prado","Invernadero"] ),

    // new PlayerHasSomeFact( 1, ["Amapola","Tubería"] ), // pregunté también por estudio, que fue lo que enseñó

    new PlayerHasSomeFact( 2, ["Salón","Pistola", "Prado"] ),

    // CON ESTO NO SALE LA BIBLIOTECA, NO SÉ POR QUÉ, NO FUNCIONAN EL NÚMERO DE CARTAS
    new PlayerDoesntHaveAnyFact(1,["Biblioteca","Rubio","Herramienta"]),
    new PlayerDoesntHaveAnyFact(2,["Biblioteca","Rubio","Herramienta"]),
    //new PlayerDoesntHaveAnyFact(0,["Tubería","Cuerda","Biblioteca","Invernadero","Amapola","Celeste"]),


    new PlayerDoesntHaveAnyFact(2, ["Invernadero","Candelabro","Celeste"] ),

    new PlayerHasSomeFact(1,["Prado","Tubería","Biblioteca"]),

    new PlayerHasSomeFact(1,["Amapola"]),

    // CON ESTO SALIÓ
    new PlayerHasSomeFact(2,["Invernadero","Tubería","Celeste"]),

];

for( var i = 1 ; i <= facts.length ; i++ ){

    var f = facts[i-1];
    console.log("\n-----------------------------------------------------------------");
    console.log( "Nueva pista:" + f.toString() );
    var fs = facts.slice(0,i);

    var c = new Cluedo(flavor,fs);

    c.printCards(c.cards());
    
    var improved = c.improveWithTrial();
    if( improved.length ){
        console.log( "Hechos deducidos:" + JSON.stringify(improved));
        c.printCards(c.cards());

    }
    

}


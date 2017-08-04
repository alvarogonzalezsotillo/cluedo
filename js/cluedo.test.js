

if( require ){
    var cp = require("./cp");
    var common = require("./common");
    var cluedo = require("./cluedo");
    CP = cp.CP;
    assert = common.assert;
    Cluedo = cluedo.Cluedo;
    PlayersFact = cluedo.PlayersFact;
    PlayerHasSomeFact = cluedo.PlayerHasSomeFact;
    PlayerDoesntHaveAnyFact = cluedo.PlayerDoesntHaveAnyFact;
    CluedoFlavors = cluedo.CluedoFlavors;
}

function pad(s,n){
    if( !n ){
        n = 20;
    }
    s = "" + s;
    
    while(s.length < n){
        s = s + " ";
    }
    return s;
}

function println(s){
    console.log(s);
}

function printCards(playerCards,envelopeCards){
    var nPlayers = playerCards.length;
    var nCards = playerCards[0].allCards.length;

    var s = pad("");
    for( var p = 0 ; p < nPlayers ; p++ ){
        s += pad("Player " + p);
    }
    s += pad("Envelope");
    println(s);

    
    for( var c = 0 ; c < nCards ; c++ ){
        var s = pad(playerCards[0].allCards[c].name);
        for( var p = 0 ; p < nPlayers ; p++ ){
            s += pad(playerCards[p].allCards[c].value);
        }
        s += pad(envelopeCards.allCards[c].value);
        println(s);
    }

}


var flavor = CluedoFlavors.test;
var characterNames = flavor.characterNames;
var toolNames = flavor.toolNames;
var placeNames = flavor.placeNames;

var facts = [
    new PlayersFact([2,2,2]),
    
    new PlayerHasSomeFact(0,[characterNames[0]]),
    new PlayerHasSomeFact(1,[characterNames[0],characterNames[1],characterNames[2]]),
    new PlayerDoesntHaveAnyFact(1,[characterNames[1]]),

    new PlayerDoesntHaveAnyFact(0,[toolNames[1],placeNames[1],characterNames[1]]),
    new PlayerDoesntHaveAnyFact(1,[toolNames[1],placeNames[1],characterNames[1]]),
    //new PlayerDoesntHaveAnyFact(2,[toolNames[1],placeNames[1],characterNames[1]]),
    
];


var c = new Cluedo(flavor,facts);

var playerCards = c.playerCards();
var envelopeCards = c.envelopeCards();

console.log(envelopeCards);

printCards(playerCards,envelopeCards);

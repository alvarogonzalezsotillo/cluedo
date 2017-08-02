

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



var pf = new PlayersFact([2,2,2]);

var c = new Cluedo(CluedoFlavors.test,[pf]);

var playerCards = c.playerCards();
var envelopeCards = c.envelopeCards();

console.log(envelopeCards);

printCards(playerCards,envelopeCards);

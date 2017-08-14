if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
    CPManager = cp.CPManager;
}


function Fact(factType){
    this._factType = factType;
}

MixIn(Fact.prototype,{
    factType : function(){
        return this._factType;
    },

    toString : function(){
        return "Falta hacer el toString";
    }
});


function PlayersFact(numberOfCardsOrEachPlayer){
    Fact.call(this,this.thisType);
    this.numberOfCardsOrEachPlayer = numberOfCardsOrEachPlayer;
}

MixIn(PlayersFact.prototype,Fact.prototype);
MixIn(PlayersFact.prototype,{

    thisType : "PlayersFact",
    
    toString : function(){
        var ret =  "Hay " + this.numberOfCardsOrEachPlayer.length + " jugadores. Su número de cartas es:" + JSON.stringify(this.numberOfCardsOrEachPlayer);
        return ret;
    }
});

function EnvelopeDoesntHaveFact(cards){
    Fact.call(this,this.thisType);
    this._cards = cards;
}

MixIn(EnvelopeDoesntHaveFact.prototype,Fact.prototype);
MixIn(EnvelopeDoesntHaveFact.prototype,{
    thisType : "EnvelopeDoesntHaveFact",
    cards : function(){
        return this._cards;
    },
    toString : function(){
        var ret =  "El sobre no tiene estas cartas: " + JSON.stringify(this.cards());
        return ret;
    }

    
});


function EnvelopeHasFact(cards){
    Fact.call(this,this.thisType);
    this._cards = cards;
}

MixIn(EnvelopeHasFact.prototype,Fact.prototype);
MixIn(EnvelopeHasFact.prototype,{
    thisType : "EnvelopeHasFact",
    cards : function(){
        return this._cards;
    },
    toString : function(){
        var ret =  "El sobre tiene estas cartas: " + JSON.stringify(this.cards());
        return ret;
    }

    
});


function CardsFact(factType,player,cards){
    Fact.call(this,factType);
    this._player = player;
    this._cards = cards;
}

MixIn(CardsFact.prototype,Fact.prototype);
MixIn(CardsFact.prototype,{
    cards : function(){
        return this._cards;
    },
    player: function(){
        return this._player;
    }
});


function PlayerHasSomeFact(player, cards ){
    CardsFact.call(this,this.thisType,player,cards);
}
MixIn(PlayerHasSomeFact.prototype,CardsFact.prototype);
MixIn(PlayerHasSomeFact.prototype,{
    thisType : "PlayerHasSomeFact",

    toString : function(){
        var ret =  "El jugador " + this.player() + " tiene alguna de estas cartas: " + JSON.stringify(this.cards());
        return ret;
    }
});


function PlayerDoesntHaveAnyFact(player, cards ){
    CardsFact.call(this,this.thisType,player,cards);
}
MixIn(PlayerDoesntHaveAnyFact.prototype,CardsFact.prototype);
MixIn(PlayerDoesntHaveAnyFact.prototype,{
    thisType : "PlayerDoesntHaveAnyFact",
    toString : function(){
        var ret =  "El jugador " + this.player() + " no tiene ninguna de estas cartas: " + JSON.stringify(this.cards());
        return ret;
    }
});


function copyArray(a){
    return a.slice(0);
}

var CluedoFlavors = {

    test: {
        flavorName : "Para probar",
        characterNames : ["Orquídea","Pepa","Juan"],
        toolNames : ["Herramienta","Cuerda","Pistola"],
        placeNames : ["Sala de billar","Invernadero","Cocina"]
    },

    cluedoConOrquidea : {
        flavorName : "El gran juego de detectives (con Orquídea)",
        characterNames : ["Amapola", "Celeste", "Orquídea", "Prado", "Mora", "Rubio"],
        toolNames : ["Candelabro", "Tubería", "Cuerda", "Puñal", "Pistola", "Herramienta"],
        placeNames : ["Sala de billar", "Salón", "Estudio", "Comedor", "Sala de baile", "Cocina", "Biblioteca", "Invernadero", "Vestíbulo"]
    },

    flavors: function(){
        return [this.test, this.cluedoConOrquidea];
    },

    defaultPlayerCardsForFlavor : function(players,flavor){
        var cards = this.allCards(flavor).length;
        var pc = cards - 3;
        var c = pc / players;
        var ret = [];
        for( var i = 0 ; i < players ; i++ ){
            ret.push(c);
        }

        for( var i = 0 ; i < pc - c*players ; i++ ){
            ret[i] += 1;
        }

        return ret;
    },
    
    indexOf : function(s,array){
        for( var i = 0 ; i < array.length ; i++ ){
            if( array[i] == s ){
                return i;
            }
        }
        return -1;

    },

    allCards : function(flavor){
        var allCards = flavor.toolNames.concat(flavor.placeNames).concat(flavor.characterNames);
        return allCards;
    },

    allCardNumber : function(flavor,a){
        return this.indexOf(a,this.allCards(flavor));
    },

    toolNumber : function(flavor,t){
        return this.indexOf(t,flavor.toolNames);
    },

    characterNumber : function(flavor,c){
        return this.indexOf(c,flavor.characterNames);
    },
    
    placeNumber : function(flavor,p){
        return this.indexOf(p,flavor.placeNames);
    },

    isCharacter : function(flavor,s){
        return this.characterNumber(flavor,s) >= 0;
    },

    isTool : function(flavor,s){
        return this.toolNumber(flavor,s) >= 0;
    },

    isPlace : function(flavor,s){
        return this.placeNumber(flavor,s) >= 0;
    }


};

/**
 numberOfCards: Array of number of cards of each player
 */
function Cluedo(flavor,facts){
    this._flavor = flavor;
    this._characterNames = copyArray(flavor.characterNames);
    this._toolNames = copyArray(flavor.toolNames);
    this._placesNames = copyArray(flavor.placeNames);
    this._facts = facts;
    this.deduce();
}

Cluedo.prototype = {
    characterNames : function(){
        return this._characterNames;
    },

    toolNames : function(){
        return this._toolNames;
    },
    
    placesNames : function(){
        return this._placesNames;
    },

    facts : function(){
        return this._facts;
    },


    toolFound : function(){
        var envelope = this.envelopeCards();
        var tools = envelope.tools;
        var found = true;
        for( var i = 0 ; i < tools && found ; i++ ){
            found = found && tools[i].isDefined();
        }
        return found;
    },

    characterFound : function(){
        var envelope = this.envelopeCards();
        var characters = envelope.characters;
        var found = true;
        for( var i = 0 ; i < characters && found ; i++ ){
            found = found && characters[i].isDefined();
        }
        return found;
    },

    placeFound : function(){
        var envelope = this.envelopeCards();
        var places = envelope.places;
        var found = true;
        for( var i = 0 ; i < places && found ; i++ ){
            found = found && places[i].isDefined();
        }
        return found;
    },
    
    solutionFound : function(){
        return this.placeFound() && this.characterFound() && this.toolFound();
    },

    playerCards : function(){
        var playersCP = this._playerCardsCP;
        var ret = [];
        for( var p = 0 ; p <  playersCP.length ; p++ ){
            ret.push(this.cardsOf(playersCP[p]));
        }
        return ret;
    },

    valuesOfCards : ["V","x","."],

    cardsOf : function(playerOrEnvelopeCP){
        var flavor = this._flavor;
        var ifTrue = this.valuesOfCards[0];
        var ifFalse = this.valuesOfCards[1];
        var ifNone = this.valuesOfCards[2];

        var t = [];
        for( var i = 0 ; i < playerOrEnvelopeCP.tools.length ; i ++){
            t.push({
                name : ""+flavor.toolNames[i],
                value: playerOrEnvelopeCP.tools[i].valueAsString(ifTrue,ifFalse,ifNone)
            });
        }

        var p = [];
        for( var i = 0 ; i < playerOrEnvelopeCP.places.length ; i ++){
            p.push({
                name : ""+flavor.placeNames[i],
                value: playerOrEnvelopeCP.places[i].valueAsString(ifTrue,ifFalse,ifNone)
            });
        }

        var c = [];
        for( var i = 0 ; i < playerOrEnvelopeCP.characters.length ; i ++){
            c.push({
                name : ""+flavor.characterNames[i],
                value: playerOrEnvelopeCP.characters[i].valueAsString(ifTrue,ifFalse,ifNone)
            });
        }

        
        return {
            tools: t,
            places: p,
            characters: c,
            allCards : t.concat(p).concat(c)
        };
    },
    
    envelopeCards : function(){

        var envelopeCP = this._envelopeCardsCP;
        return this.cardsOf(envelopeCP);
    },

    cards : function(){
        return {
            playerCards : this.playerCards(),
            envelopeCards : this.envelopeCards()
        };
    },

    playersFact : function(){
        var fs = this.facts();
        for( var i = 0 ; i < fs.length ; i++ ){
            if( fs[i].factType() == PlayersFact.prototype.thisType ){
                return fs[i];
            }
        }
        return undefined;
    },

    deduce: function(){
        var CP = new CPManager();
        var playersF = this.playersFact();
        assert(playersF);
        var numberOfPlayers = playersF.numberOfCardsOrEachPlayer.length;
        var flavor = this._flavor;
        var allCards = CluedoFlavors.allCards(flavor);

        var totalCardsInGame = 3;
        for( var i = 0 ; i < playersF.numberOfCardsOrEachPlayer.length ; i++ ){
            totalCardsInGame += playersF.numberOfCardsOrEachPlayer[i];
        }

        assert(allCards.length == totalCardsInGame)

        function createArrayOfBooleans( prefix, nameArray ){
            var ret = [];
            for( var i = 0 ; i < nameArray.length ; i++ ){
                var cp = CP.Boolean(prefix + nameArray[i]);
                ret.push(cp);
            }
            return ret;
        }

        function createPlayerCards( prefix ){
            var t = createArrayOfBooleans(prefix,flavor.toolNames);
            var p = createArrayOfBooleans(prefix,flavor.placeNames);
            var c = createArrayOfBooleans(prefix,flavor.characterNames);
            return {
                tools : t,
                places : p,
                characters: c,
                allCards : t.concat(p).concat(c)
            };
        }

        // CARDS FOR PLAYERS AND ENVELOPE
        this._playerCardsCP = [];
        var restrictions = [];
        for( var p = 0 ; p < numberOfPlayers ; p++ ){
            var prefix = "p" + p + "-";
            this._playerCardsCP.push(createPlayerCards(prefix));
        }
        this._envelopeCardsCP = createPlayerCards("envelope-");

        // EACH PLAYER HAS HIS NUMBER OF CARDS
        for( var p = 0 ; p < numberOfPlayers ; p++ ){
            var cp = CP.SomeTrue(this._playerCardsCP[p].allCards,playersF.numberOfCardsOrEachPlayer[p]);
            cp.remove(false);
            restrictions.push(cp);
        }

        // EACH CARD CAN BE ONLY IN ONE PLACE
        for( var i = 0 ; i < allCards.length ; i++ ){
            var cpsOfCard = [];
            for( var p = 0 ; p < numberOfPlayers ; p++ ){
                cpsOfCard.push(this._playerCardsCP[p].allCards[i]);
            }
            cpsOfCard.push(this._envelopeCardsCP.allCards[i]);
            var thisCardInOnePlace = CP.SomeTrue(cpsOfCard,1);
            thisCardInOnePlace.remove(false);
            restrictions.push(thisCardInOnePlace);
        }

        // ENVELOPE HAS ONE CHARACTER, ONE TOOL AND ONE PLACE
        var that = this;
        (function(){
            var cp = CP.SomeTrue(that._envelopeCardsCP.tools,1);
            cp.remove(false);
            restrictions.push(cp);
            cp = CP.SomeTrue(that._envelopeCardsCP.characters,1);
            cp.remove(false);
            restrictions.push(cp);
            cp = CP.SomeTrue(that._envelopeCardsCP.places,1);
            cp.remove(false);
            restrictions.push(cp);
        })();

        // HAS SOME OR DOESNT HAVE ANY
        for( var i = 0 ; i < this.facts().length ; i++ ){
            var f = this.facts()[i];
            if( f.factType() == PlayerHasSomeFact.prototype.thisType ){
                var cps = this.cpArrayFor(f.player(),f.cards());
                var cp = CP.Or(cps);
                cp.remove(false);
                restrictions.push(cp);

            }
            if( f.factType() == PlayerDoesntHaveAnyFact.prototype.thisType ){
                var cps = this.cpArrayFor(f.player(),f.cards());
                var cp = CP.Not(CP.Or(cps));
                cp.remove(false);
                restrictions.push(cp);
            }
            if( f.factType() == EnvelopeDoesntHaveFact.prototype.thisType ){
                var cps = this.cpArrayForEnvelope(f.cards());
                var cp = CP.Not(CP.And(cps));
                cp.remove(false);
                restrictions.push(cp);
            }
            if( f.factType() == EnvelopeHasFact.prototype.thisType ){
                var cps = this.cpArrayForEnvelope(f.cards());
                var cp = CP.And(cps);
                cp.remove(false);
                restrictions.push(cp);
            }
        }

        this._cps = restrictions;
        this._cpManager = CP;

    },

    improveWithTrial : function(){
/*
   0 1 2 e
a  x . . x  
b  x . . x
c  . . . x
d  v x x x
e  x v x x
f  x x v x
   . . . .

wether a1 or a2, c0 is true

*/

        var self = this;
        var ifTrue = this.valuesOfCards[0];
        var ifFalse = this.valuesOfCards[1];
        var ifNone = this.valuesOfCards[2];
        var allCards = CluedoFlavors.allCards(this._flavor);
        var println = function(){};
        
        
        function createBooleansArray(){
            var playersF = self.playersFact();
            assert(playersF);
            var numberOfPlayers = playersF.numberOfCardsOrEachPlayer.length;

            var ret = [];
            for( var c = 0 ; c < allCards.length ; c++ ){
                var booleansOfThisCard = [];
                for( var p = 0 ; p < numberOfPlayers ; p++ ){
                    booleansOfThisCard.push(self._playerCardsCP[p].allCards[c]);
                }
                booleansOfThisCard.push(self._envelopeCardsCP.allCards[c]);
                ret.push(booleansOfThisCard);
            }
            return ret;
        }



        function removeDefinedCardsOfState(s){
            for( var p = 0 ; p < s.playerCards.length ; p++ ){
                for( var c = 0 ; c < s.playerCards[p].allCards.length ; c++ ){
                    if( s.playerCards[p].allCards[c].value != ifNone ){
                        s.playerCards[p].allCards[c].value = undefined;
                    }
                }
            }
            for( var c = 0 ; c < s.envelopeCards.allCards.length ; c++ ){
                if( s.envelopeCards.allCards[c].value != ifNone ){
                    s.envelopeCards.allCards[c].value = undefined;
                }
            }
        }

        function removeDiferrentOfState(src,dst){
            for( var p = 0 ; p < src.playerCards.length ; p++ ){
                for( var c = 0 ; c < src.playerCards[p].allCards.length ; c++ ){
                    if( src.playerCards[p].allCards[c].value != dst.playerCards[p].allCards[c].value ){
                        dst.playerCards[p].allCards[c].value = undefined;
                    }
                }
            }
            for( var c = 0 ; c < src.envelopeCards.allCards.length ; c++ ){
                if( src.envelopeCards.allCards[c].value != dst.envelopeCards.allCards[c].value ){
                    dst.envelopeCards.allCards[c].value = undefined;
                }
            }
        }

        function fixBooleansInEveryScenario(state){
            var ret = [];
            for( var p = 0 ; p < state.playerCards.length ; p++ ){
                for( var c = 0 ; c < state.playerCards[p].allCards.length ; c++ ){
                    var value = state.playerCards[p].allCards[c].value; 
                    if( value == ifTrue || value == ifFalse ){
                        console.log("Found boolean in every state:" + state.playerCards[p].allCards[c].name + " :" + value );
                        if( value == ifTrue ){
                            this._playerCardsCP[p].allCards[c].remove(false);
                            ret.push( new PlayerDoesntHaveAnyFact(p,allCards[c]));
                        }
                        if( value == ifFalse ){
                            this._playerCardsCP[p].allCards[c].remove(true);
                            ret.push( new PlayerHasSomeFact(p,allCards[c]));
                        }
                    }
                }
            }
            for( var c = 0 ; c < state.envelopeCards.allCards.length ; c++ ){
                var value = state.envelopeCards.allCards[c].value; 

                if( value == ifTrue || value == ifFalse ){
                    console.log("Found boolean in every state:" + state.envelopeCards.allCards[c].name + " :" + value );
                        if( value == ifTrue ){
                            this._envelopeCardsCP.allCards[c].remove(false);
                            ret.push( new EnvelopeDoesntHaveFact(allCards[c]));
                        }
                        if( value == ifFalse ){
                            this._envelopeCardsCP.allCards[c].remove(true);
                            ret.push( new EnvelopeHasFact(p,allCards[c]));
                        }
                }
            }
            return ret;
            
        }

        var booleansOfCards = createBooleansArray();

        println( "ORIGINAL STATE");
        this.printCards(this.cards(),println);

        var CP = this._cpManager;
        var failed = false;

        var impossibleHandler = function(cp){
            println("************* IMPOSSIBLE: " + cp.name() );
            failed = true;
        };

        var ret = [];
        
        CP.setEmptyDomainHandler(impossibleHandler);
        
        for( var c = 0 ; c < booleansOfCards.length ; c++ ){
            var state = undefined;


            var boolsOfCard = booleansOfCards[c];
            for( b = 0 ; b < boolsOfCard.length ; b++ ){

                failed = false;
                
                if( !boolsOfCard[b].defined() ){


                    if( typeof state == "undefined" ){
                        // STATE IS LAZY
                        state = this.cards();
                        removeDefinedCardsOfState(state);

                        println( "ORIGINAL STATE WITHOUT DEFINED FOR CARD:" + state.envelopeCards.allCards[c].name);
                        this.printCards(state,println);
                    }
                    
                    CP.pushScenario();
                    boolsOfCard[b].remove(false);
                    var newState = this.cards();
                    CP.popScenario();

                    if( failed ){
                        println( "DETECTED IMPOSSIBILITY:" + boolsOfCard[b].name() );
                        var newCP;
                        if( b < boolsOfCard.length-1 ){
                            newCP = new PlayerDoesntHaveAnyFact(b,[allCards[c]]);
                        }
                        else{
                            newCP =  new EnvelopeDoesntHaveFact([allCards[c]]);
                        }
                        println( newCP );
                        boolsOfCard[b].remove(true);
                        ret.push( newCP );
                        this.printCards(this.cards(), function(s){ println("    " + s ); });
                    }

                    

                    println( "NEW STATE");
                    this.printCards(newState,println);
                    
                    removeDiferrentOfState(state,newState);
                    state = newState;

                    println( "NEW STATE WITH DIFFERRENTS REMOVED");
                    this.printCards(state,println);
                }
            }

            if( typeof state != "undefined" ){
                ret.concat( fixBooleansInEveryScenario(state) );
            }
        }

        return ret;
        
    },

    printCards : function (cards,println){

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

        if( !println ){
            println = function(s){
                console.log(s);
            };
        }

        var playerCards = cards.playerCards;
        var envelopeCards = cards.envelopeCards;
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

    },

    
    cpFor : function(player,cardName){
        var flavor = this._flavor;
        var i = CluedoFlavors.allCardNumber(flavor,cardName);
        return this._playerCardsCP[player].allCards[i];
    },

    cpForEnvelope : function(cardName){
        var flavor = this._flavor;
        var i = CluedoFlavors.allCardNumber(flavor,cardName);
        return this._envelopeCardsCP.allCards[i];
    },

    cpArrayFor : function(player,cardNames){
        var ret = [];
        for( var i = 0 ; i < cardNames.length ; i++ ){
            ret.push(this.cpFor(player,cardNames[i]));
        }
        return ret;
    },

    cpArrayForEnvelope : function(cardNames){
        var ret = [];
        for( var i = 0 ; i < cardNames.length ; i++ ){
            ret.push(this.cpForEnvelope(cardNames[i]));
        }
        return ret;
    }

};



if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    Cluedo : Cluedo,
    PlayersFact : PlayersFact,
    PlayerHasSomeFact : PlayerHasSomeFact,
    PlayerDoesntHaveAnyFact : PlayerDoesntHaveAnyFact,
    EnvelopeDoesntHaveFact : EnvelopeDoesntHaveFact,
    CluedoFlavors : CluedoFlavors
};


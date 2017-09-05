if( typeof require != "undefined"){
    var common = require("./common");
    var cp = require("./cp");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
    CP = cp.CP;
}


function Fact(factType){
    this._factType = factType;
}

MixIn(Fact.prototype,{
    factType : function(){
        return this._factType;
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
        var ret =  this.numberOfCardsOrEachPlayer.length + " players (cards:";
        for( var i = 0 ; i < this.numberOfCardsOrEachPlayer.length ; i++ ){
            ret += this.numberOfCardsOrEachPlayer[i] + " ";
        }
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
});


function PlayerDoesntHaveAnyFact(player, cards ){
    CardsFact.call(this,this.thisType,player,cards);
}
MixIn(PlayerDoesntHaveAnyFact.prototype,CardsFact.prototype);
MixIn(PlayerDoesntHaveAnyFact.prototype,{
    thisType : "PlayerDoesntHaveAnyFact",
});


function copyArray(a){
    return a.slice(0);
}

CluedoFlavors = {

    test: {
        flavorName : "Para probar",
        characterNames : ["Orquídea","Pepa","Juan"],
        toolNames : ["Herramienta","Cuerda","Pistola"],
        placeNames : ["Sala de billar","Invernadero","Cocina"]
    },

    flavors: function(){
        return [this.test];
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
                name : flavor.toolNames[i],
                value: playerOrEnvelopeCP.tools[i].valueAsString(ifTrue,ifFalse,ifNone)
            });
        }

        var p = [];
        for( var i = 0 ; i < playerOrEnvelopeCP.places.length ; i ++){
            p.push({
                name : flavor.placeNames[i],
                value: playerOrEnvelopeCP.places[i].valueAsString(ifTrue,ifFalse,ifNone)
            });
        }

        var c = [];
        for( var i = 0 ; i < playerOrEnvelopeCP.characters.length ; i ++){
            c.push({
                name : flavor.characterNames[i],
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

        var createArrayOfBooleans = function( prefix, nameArray ){
            var ret = [];
            for( var i = 0 ; i < nameArray.length ; i++ ){
                var cp = CP.Boolean(prefix + nameArray[i]);
                ret.push(cp);
            }
            return ret;
        }

        var createPlayerCards = function( prefix ){
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
        for( var p = 0 ; p < numberOfPlayers ; p++ ){
            var prefix = "p" + p + "-";
            this._playerCardsCP.push(createPlayerCards(prefix));
        }
        this._envelopeCardsCP = createPlayerCards("envelope-");

        // EACH CARD CAN BE ONLY IN ONE PLACE
        var restrictions = [];
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
        }

        this._cps = restrictions;

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


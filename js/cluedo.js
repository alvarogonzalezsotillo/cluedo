if( require ){
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

function CardsFact(factType,player,cards){
    Fact.call(this,factType);
    this._player = player;
    this._cards = cards;
}

MixIn(CardsFact.prototype,Fact.prototype);


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

var CluedoFlavors = {

    test: {
        characterNames : ["Orquídea","Pepa","Juan"],
        toolNames : ["Herramienta","Cuerda","Pistola"],
        placeNames : ["Sala de billar","Invernadero","Cocina"];
    },

    indexOf : function(s,array){
        for( var i = 0 ; i < array.length ; i++ ){
            if( array[i] == s ){
                return i;
            }
        }
        return -1;

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
    this._placesNames = copyArray(flavor.placesNames);
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
        // array con las cartas inferidas
        // [jugador].tools
        //          .places
        //          .characters[index]
    },

    envelopeCards: function(){
        // .tools
        // .places
        // .characters[index]
    }

    playersFact : function(){
        var fs = this.facts();
        for( var i = 0 ; i < fs.length ; i++ ){
            if( fs[i].factType() == PlayersFact.thisType ){
                return fs[i];
            }
        }
        return undefined;
    },

    deduce: function(){
        var playersF = this.playersFact();
        assert(playersF);
        var flavor = this._flavor;

        var createArrayOfBooleans = function( prefix, nameArray ){
            var ret = [];
            for( var i = 0 ; i < nameArray.length ; i++ ){
                var cp = CP.Boolean(prefix + nameArray[i]);
                ret.push(cp);
            }
            return ret;
        }

        var createPlayerCards = function( prefix ){
            return {
                tools : createArrayOfBooleans(prefix,flavor.toolNames);
                places : createArrayOfBooleans(prefix,flavor.placeNames);
                characters: createArrayOfBooleans(prefix,flavor.characterNames);
            };
        }
        
        this._playerCardsCP = [];

        for( var i = 0 ; i < playersF.length ; i++ ){
            var prefix = "Player" + i + "-";
            this._playerCardsCP.push(createPlayerCards(prefix));
        }

        this._envelopeCardsCP = createPlayerCards("envelope-");

        // EACH CARD CAN BE ONLY IN ONE PLACE
        
    }
    
};


function Fact(){
}



function PlayersFact(numberOfCardsOrEachPlayer){
    this.numberOfCardsOrEachPlayer = numberOfCardsOrEachPlayer;
}

function PlayerHasSomeFact(player, cards ){
    // player es el número de jugador
    // cards es una array de las cartas de las que hablamos
}

function PlayerDoesntHaveAnyFact(player, cards){
    // player es el número de jugador
    // cards es una array de las cartas de las que hablamos
}

/**
 numberOfCards: Array of number of cards of each player
 */
function Cluedo(facts){
    this._characterNames = ["","",""];
    this._toolNames = ["","",""];
    this._placesNames = ["","",""];
    this._facts = facts;
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
        // lista de hechos
        return this.facts();
    },


    toolFound : function(){
        var envelope = this.envelopeCards();
        var tools = envelope.tools;
        var found = true;
        for( var i = 0 ; i < this.toolNames && found ; i++ ){
            found = found && tools[i].isDefined();
        }
        return found;
    },

    characterFound : function(){
        var envelope = this.envelopeCards();
        var characters = envelope.characters;
        var found = true;
        for( var i = 0 ; i < this.characterNames && found ; i++ ){
            found = found && characters[i].isDefined();
        }
        return found;
    },

    placeFound : function(){
        var envelope = this.envelopeCards();
        var places = envelope.places;
        var found = true;
        for( var i = 0 ; i < this.placeNames && found ; i++ ){
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


    init: function(players){
        this._players = players;

        this._cards = [];

        for( var i = 0 ; i <= players ; i++ ){
            this._cards.push({
                
            });
        }
    }
    
};



function Fact(player, hasSome, cards ){
    // player es el número de jugador
    // hasSome es true si tiene alguna carta, o false si no tiene ninguna carta
    // cards es una array de las cartas de las que hablamos
}

function Cluedo(players){
    this._players = players;
    this._characterNames = ["","",""];
    this._toolNames = ["","",""];
    this._placesNames = ["","",""];
}

Cluedo.__prototype__ = {
    characterNames : function(){
        return this._characterNames;
    };

    toolNames : function(){
        return this._toolNames;
    };
    
    placesNames : function(){
        return this._placesNames;
    };

    addFact : function( fact ){
    };

    facts : function(){
        // lista de hechos
    };

    inferredCards : function(){
        // array con las cartas inferidas
        // [jugador].tools
        //          .places
        //          .characters[index]
        // posicion 0: cartas del sobre
    };

    var toolFound : function(){
        var envelope = this.inferredCards()[0];
        var tools = envelope.tools;
        var found = true;
        for( var i = 0 ; i < this.toolNames && found ; i++ ){
            found = found && tools[i].isDefined();
        }
        return found;
    };

    var characterFound : function(){
        var envelope = this.inferredCards()[0];
        var characters = envelope.characters;
        var found = true;
        for( var i = 0 ; i < this.characterNames && found ; i++ ){
            found = found && characters[i].isDefined();
        }
        return found;
    };

    var placeFound : function(){
        var envelope = this.inferredCards()[0];
        var places = envelope.places;
        var found = true;
        for( var i = 0 ; i < this.placeNames && found ; i++ ){
            found = found && places[i].isDefined();
        }
        return found;
    };
    
    solutionFound : function(){
        return this.placeFound() && this.characterFound() && this.toolFound();
    }
    
};

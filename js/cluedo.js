
function CPBoolean(name){
    this._name = name;
    this._canBeTrue = true;
    this._canBeFalse = true;
}

CPBoolean.__prototype__ = {

    name: function(){
        return this._name;
    }
    
    defined: function(){
        return this.canBeTrue() ^ this.canBeFalse();
    };

    impossible: function(){
        return !this.canBeTrue() && !this.canBeFalse();
    };

    canBeTrue: function(){
        return this._canBeTrue;
    };

    canBeFalse: function(){
        return this._canBeFalse;
    };

    isFalse: function(){
        return this.isDefined() && this.canBeFalse();
    }

    isTrue: function(){
        return this.isDefined() && this.canBeTrue();
    }

    
    remove: function(value){
        if( value ){
            this._canBeTrue = false;
        }
        else{
            this._canBeFalse = false;
        }
    };

    propagate: function(){
    };
};

function CPNot(cp){
    this._cp = cp;
}

CPNot.__prototype__ = {
    name: function(){
        return "Not " + this._cp.name();
    }
    
    defined: function(){
        return this._cp.defined();
    };

    impossible: function(){
        return !this.canBeTrue() && !this.canBeFalse();
    };

    canBeTrue: function(){
        return this._cp.canBeFalse();
    };

    canBeFalse: function(){
        return this._cp.canBeTrue();
    };

    isFalse: function(){
        return this.isDefined() && this.canBeFalse();
    }

    isTrue: function(){
        return this.isDefined() && this.canBeTrue();
    }

    remove: function(value){
        this._cp.remove(!value);
    };

    propagate: function(){
    };
};

function CPAnd(cps){
    assert(cps.length > 0);
    this._cps = cps;
    this._canBeTrue = true;
    this._canBeFalse = true;
}

CPAnd.__prototype__ = {
    name: function(){
        var ret = "And("
        for( var i = 0 ; i < this._cps.length ; i++ ){
            ret += this._cps[i].name() + ",";
        }
        return ret + ")";
    }
    
    defined: function(){
        return this.canBeTrue() ^ this.canBeFalse();
    };

    impossible: function(){
        return !this.canBeTrue() && !this.canBeFalse();
    };

    canBeTrue: function(){
        return this._canBeTrue;
    };

    canBeFalse: function(){
        return this._canBeFalse;
    };
    
    remove: function(value){
        if( value ){
            this._canBeTrue = false;
        }
        else{
            this._canBeFalse = false;
        }
    }; 

    propagate: function(){
        var anyFalse = false;
        for( var i = 0 ; i < this._cps.length ; i++ ){
            if( this._cps[i].isFalse() ){
                anyFalse = true;
            }
        }
    };
}


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

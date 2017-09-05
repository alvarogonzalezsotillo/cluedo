if( typeof require != "undefined"){
    var common = require("./common");
    MixIn = common.MixIn;
    log = common.log;
}



function CPBase(name, observed ){

    this._name =name;
    this._containers = [];
    this._observed = [];
    if( observed ){
        this._observed = observed;
    }

    for( var  i = 0 ; i < this._observed.length ; i++ ){
        this._observed[i].addContainer(this);
    }
}



CPBase.prototype = {

    addContainer : function(d){
        this._containers.push(d);
    },

    notifyContainers : function(){
        log( this.name() + ": notifyContainers ");
        for( var i = 0 ; i < this._containers.length ; i++ ){
            var cp = this._containers[i];
            log( "  " + this.name() + ": notifyContainers: " + cp.name() );
            cp.notified();
        }
    },

    notified: function(){
        this.reduceOwnDomain();
        this.reduceObservedDomain();
        this.notifyContainers();
    },

    notifyIfEmptyDomain : function(){
        if( this.impossible() ){
            var error = new Error(this.name() + " has empty domain");
            error.cp = this;
            throw error;
        }
    },

    describe : function(level){

        var log = console.log;
        if( !level ){
            level = 0;
            log( "DESCRIBE: " + this.name() );
        }
        
        var s = "";
        for( var i = 0 ; i < level ; i++ ){
            s += "  ";
        }
        log( s + this.toString() );

        for( var i = 0; i < this.observed().length ; i++ ){
            this.observed()[i].describe(level+1);
        }
    },

    observed : function(){
        return this._observed;
    },
    
    toString: function(){
        return this.name() + ":[" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_") + "]";
    },

    valueAsString : function(ifTrue,ifFalse,ifNone){
        if( this.isTrue() ){
            return ifTrue;
        }
        else if( this.isFalse() ){
            return ifFalse;
        }
        else{
            return ifNone;
        }
    },

    defined: function(){
        return (this.canBeTrue() && !this.canBeFalse()) || (!this.canBeTrue() && this.canBeFalse());
    },
    
    name: function(){
        return this._name;
    },

    impossible: function(){
        return !this.canBeTrue() && !this.canBeFalse();
    },

    canBeTrue: function(){
        return this._canBeTrue;
    },

    canBeFalse: function(){
        return this._canBeFalse;
    },

    isFalse: function(){
        return this.defined() && this.canBeFalse();
    },

    isTrue: function(){
        return this.defined() && this.canBeTrue();
    },

    reduceOwnDomain: function(){
        return false;
    },

    reduceObservedDomain: function(){
        return false;
    }


};

function CPBoolean(name,observed){
    CPBase.call(this,name,observed);
    this._canBeTrue = true;
    this._canBeFalse = true;
    this.notified();
}


MixIn(CPBoolean.prototype,CPBase.prototype);
MixIn(CPBoolean.prototype,{
    remove: function(value){
        log( this.name() + ": remove:" + value );
        if( value && this._canBeTrue ){
            log( "  " + this.name() + ": remove: removed true");
            this._canBeTrue = false;
            this.reduceObservedDomain();
            this.notifyContainers();
            this.notifyIfEmptyDomain();
            return true;
        }
        
        if( !value && this._canBeFalse ){
            log( "  " + this.name() + ":  remove: removed false");
            this._canBeFalse = false;
            this.reduceObservedDomain();
            this.notifyContainers();
            this.notifyIfEmptyDomain();
            return true;
        }
        
        return false;
    },
});

function CPNumberTrue(cps,number){
    this._number = number;
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        names += " " + cps[i].name();
    }
    CPBoolean.call(this,"AreTrue(" + number + ")(" + names + ")", cps );
    this.reduceOwnDomain();
    this.reduceObservedDomain();
}

MixIn(CPNumberTrue.prototype,CPBoolean.prototype);
MixIn(CPNumberTrue.prototype, {

    number : function(){
        return this._number;
    },

    status : function(){
        var cps = this.observed();

        var ret = {
            falses : [],
            trues : [],
            undefineds : []
        }

        for( var i = 0 ; i < cps.length ; i++ ){
            if( cps[i].isFalse() ){
                ret.falses.push(cps[i]);
            }
            if( cps[i].isTrue() ){
                ret.trues.push(cps[i]);
            }
            if( !cps[i].defined() ){
                ret.undefineds.push(cps[i]);
            }
        }
        
        return ret;
    },
    
    reduceOwnDomain: function(){
        var cps = this.observed();

        //var log = function(s){ console.log(s); };

        
        var s = this.status();
        
        log( this.name() + ": reduceOwndomain" );

        var ret = false;
        
        if( s.trues.length > this.number() ){
            log( "  " + this.name() + ": trueNumber:" + s.trues.length + ": more true than expected");
            ret |= this.remove(true);
        }
        else if( s.falses.length > cps.length - this.number() ){
            log( "  " + this.name() + ": falses.length:" + s.falses.length + ": more false than expected" );
            ret |= this.remove(true);
        }
        else if( s.falses.length  + s.trues.length == cps.length ){
            log( "  " + this.name() + ": all defined and number correct" );
            ret |= this.remove(false);
        }
        return ret;
    },

    reduceObservedDomain: function(){
        var log = function(s){/*console.log(s);*/};

        var s = this.status();
        var remainingTrues = this.number() - s.trues.length;
        var possibleTruesOrFalses = s.undefineds.length;

        log(this.name());
        log(s)
        log( "  remainigTrues:" + remainingTrues + "  possibleTruesorfalses:" + possibleTruesOrFalses );
        
        if( this.isTrue() ){
            assert( s.trues.length <= this.number() );
            if( remainingTrues == possibleTruesOrFalses ){
                log( this.name() + ": needed some more trues, the same as undefined");
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(false);
                }
                return true;
            }

            var cps = this.observed();
            
            if( s.trues.length == this.number()  ){
                log( this.name() + ": all needed trues defined, the rest are falses" );
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(true);
                }
                return true;
            }
        }

        if( this.isFalse() ){

            if( s.trues.length == this.number()-1 && possibleTruesOrFalses == 1 ){
                log( this.name() + ": since I am false, at least one of my possible trues can not be true");
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(true);
                }
                return true;
            }
        }

        return false;
    }
});


function CPNot(cp){
    CPBase.call(this,"Not(" + cp.name() + ")", [cp] ); 
    this._cp = cp;
    this.reduceOwnDomain();
    this.reduceObservedDomain();
}

MixIn(CPNot.prototype,CPBase.prototype);
MixIn(CPNot.prototype, {
    
    defined: function(){
        return this._cp.defined();
    },

    canBeTrue: function(){
        return this._cp.canBeFalse();
    },

    canBeFalse: function(){
        return this._cp.canBeTrue();
    },

    remove: function(value){
        var changed = this._cp.remove(!value);
        if( changed ){
            this.notifyContainers();
        }
        return changed;
    },

    reduceOwnDomain: function(){
        var ret = this._cp.reduceOwnDomain();
        if( ret ){
            this.notifyContainers();
        }
    },

    notified: function(){
        this.notifyContainers();
    },

    reduceObservedDomain: function(){
        return this._cp.reduceObservedDomain();
    },

});


var CP = {
    Boolean : function(name){
        return new CPBoolean(name);
    },
    And : function(cps,number){
        var ret =  new CPNumberTrue(cps,cps.length)
        var names = "";
        for( var i = 0 ; i < cps.length ; i++ ){
            names += cps[i].name() + " ";
        }
        ret.name = function(){ return "And(" + names + ")"; };
        return ret;
    },
    Not : function(cp){
        return new CPNot(cp);
    },
    SomeTrue : function(cps,number){
        return new CPNumberTrue(cps,number);
    },
    Or : function(cps){
        var negatedCPS = [];
        var names = "";
        for( var i = 0 ; i < cps.length ; i++ ){
            negatedCPS.push( CP.Not(cps[i]) );
            names += cps[i].name() + " ";
        }
        var ret =  CP.Not( CP.And(negatedCPS) );
        ret.name = function(){ return "Or(" + names + ")"; };
        return ret;
    },
};


if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    CP: CP,
};


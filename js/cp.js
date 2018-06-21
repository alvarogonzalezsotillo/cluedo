if( typeof require != "undefined" ){
    var common = require("./common");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
}


function CPManager(){
    this._cps = [];
    var self = this;
    this._stackIndex = 0;
    this.setEmptyDomainHandler( this.defaultEmptyDomainHandler );
}

MixIn(CPManager.prototype, {

    checkIfFailed : function(){
        for( var i = 0 ; i < this.cps().length ; i++ ){
            if( this.cps()[i].impossible() ){
                return true;
            }
        }
        return false;
    },
    
    cps: function(){
        return this._cps;
    },

    defaultEmptyDomainHandler : function(cp){
        var error = new Error(cp.name() + " has empty domain");
        error.cp = cp;
        throw error;
    },

    setEmptyDomainHandler : function(h){
        this._emptyDomainHandler = h;
    },

    notifyEmptyDomain : function(cp){
        log( "------ emptyDomain:" + cp.toString() );
        this._emptyDomainHandler(cp);
    },

    pushScenario : function(){
        for( var i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].pushDomain();
        }
        this._stackIndex += 1;
    },

    popScenario : function(){
        assert(this._stackIndex>0);
        for( var i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].popDomain();
        }
        this._stackIndex -= 1;
    },

    stackIndex : function(){
        return this._stackIndex;
    },
    
    concatenateNames : function(cps){
        var names = "";
        for( var i = 0 ; i < cps.length ; i++ ){
            names += cps[i].name() + " ";
        }
        return names;
    },

    addCP : function(cp){
        this._cps.push(cp);
    },
    
    Boolean : function(name){
        return new CPBoolean(this,name);
    },
    And : function(cps){
        var ret =  this.SomeTrue(cps,cps.length);
        var names = this.concatenateNames(cps);
        return this.Rename(ret,"And(" + names + ")");
    },
    Not : function(cp){
        return new CPNot(this,cp);
    },
    Rename : function(cp,name){
        return this.Identity(cp,name); 
    },
    Identity : function(cp,name){
        return new CPIdentity(this,cp,name);
    },
    SomeTrue : function(cps,numberMin,numberMax){
        numberMax = numberMax || numberMin;
        if( numberMax == numberMin ){
            return new CPNumberTrue(this,cps,numberMin);
        }
        else{
            var rets = [];
            for( var i = numberMin ; i <= numberMax ; i++ ){
                rets.push( new CPNumberTrue(this,cps,i) );
            }
            return new CPNumberTrue(this,rets,1);
        }
    },
    Or : function(cps){
        var negatedCPS = [];
        var names = this.concatenateNames(cps);
        for( var i = 0 ; i < cps.length ; i++ ){
            negatedCPS.push( this.Not(cps[i]) );
        }
        var ret =  this.Not( this.And(negatedCPS) );
        return this.Rename(ret,"Or(" + names + ")" );
    },
    IfThen : function(cpIf, cpThen){
        // if    then
        // f     f    t
        // f     t    t
        // t     f    f
        // t     t    t

        var ret = this.Or( [this.Not(cpIf), cpThen] );
        return this.Rename(ret,"If(" + cpIf.name() + ")Then(" + cpThen.name() + ")");
    },
    Iff : function(lhs,rhs){
        var ret = this.And( [this.IfThen(lhs,rhs),this.IfThen(rhs,lhs)]);
        return this.Rename(ret,"Iff(" + lhs.name() + ", " + rhs.name() + ")");
    },

    describe : function(println){
        for( var i = 0 ; i < this._cps.length ; i++ ){
            var cp = this._cps[i];
            cp.describe(println);
        }

    }
});



function CPBase(manager,name, observed ){
    this._manager = manager;
    this._name =name;
    this._containers = [];
    this._observed = [];
    if( observed ){
        this._observed = observed;
    }

    for( var  i = 0 ; i < this._observed.length ; i++ ){
        this._observed[i].addContainer(this);
    }

    manager.addCP(this);
}



CPBase.prototype = {

    asTrue : function(){
        this.remove(false);
        return this;
    },
    
    rename : function(name){
        return this.manager().Rename(this,name);
    },


    pushDomain : function(){
    },

    popDomain : function(){
    },

    manager : function(){
        return this._manager;
    },
    
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
        var own = this.reduceOwnDomain();
        var obs = this.reduceObservedDomain();
        log( "obs:" + obs +  "  own:" + own + "  --- " + this.name() );
        if( own ){
            this.notifyContainers();
        }
    },

    notifyIfEmptyDomain : function(){
        if( this.impossible() ){
            this.manager().notifyEmptyDomain(this);
        }
    },

    describe : function(println,level){

        if( !println ){
            println = console.log;
        }
        
        if( !level ){
            level = 0;
        }
        
        var s = "";
        for( var i = 0 ; i < level ; i++ ){
            s += "  ";
        }
        println( s + this.toString() );

        for( var i = 0; i < this.observed().length ; i++ ){
            this.observed()[i].describe(println,level+1);
        }
    },

    observed : function(){
        return this._observed;
    },
    
    toString: function(){
        return "[" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_") + "]:" + this.name();
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
        assert(false);
    },

    canBeFalse: function(){
        assert(false);
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

function CPBoolean(manager,name,observed){
    CPBase.call(this,manager,name,observed);
    this._canBeTrue = [true];
    this._canBeFalse = [true];
    this.notified();
}


MixIn(CPBoolean.prototype,CPBase.prototype);
MixIn(CPBoolean.prototype,{

    pushDomain : function(){
        this._canBeTrue.push(this.canBeTrue());
        this._canBeFalse.push(this.canBeFalse());
    },

    popDomain : function(){
        assert(this._canBeTrue.length > 1);
        this._canBeTrue.pop();
        this._canBeFalse.pop();
    },

    canBeTrue: function(){
        return this._canBeTrue[this.manager().stackIndex()];
    },

    canBeFalse: function(){
        return this._canBeFalse[this.manager().stackIndex()];
    },

    remove: function(value){
        log( this.name() + ": remove:" + value );
        if( value && this.canBeTrue() ){
            log( "  " + this.name() + ": remove: removed true");
            this._canBeTrue[this.manager().stackIndex()] = false;
            this.notifyIfEmptyDomain();
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }
        
        if( !value && this.canBeFalse() ){
            log( "  " + this.name() + ":  remove: removed false");
            this._canBeFalse[this.manager().stackIndex()] = false;
            this.notifyIfEmptyDomain();
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }

        return false;
    },
});

function CPNumberTrue(manager,cps,number){
    this._number = number;
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        names += " " + cps[i].name();
    }
    CPBoolean.call(this,manager,"AreTrue(" + number + ")(" + names + ")", cps );
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
            ret = ret || this.remove(true);
            log( ret + "  " + this.name() + ": trueNumber:" + s.trues.length + ": more true than expected");

        }
        else if( s.falses.length > cps.length - this.number() ){
            ret = ret || this.remove(true);
            log( ret + "  " + this.name() + ": falses.length:" + s.falses.length + ": more false than expected" );
        }
        else if( s.falses.length  + s.trues.length == cps.length ){
            ret = ret || this.remove(false);
            log( ret + "  " + this.name() + ": all defined and number correct" );

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
            //assert( s.trues.length <= this.number() );
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

            if( s.trues.length == this.number() && possibleTruesOrFalses == 1 ){
                log( this.name() + ": since I am false, at least one of my possible trues is true");
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(false);
                }
                return true;
            }
 
        }

        return false;
    }
});

function CPIdentity(manager,cp,name){
    name = name || "Identity(" + cp.name() + ")";
    CPBase.call(this,manager,name, [cp] ); 
    this._cp = cp;
    this.reduceOwnDomain();
    this.reduceObservedDomain();
}

MixIn(CPIdentity.prototype,CPBase.prototype);
MixIn(CPIdentity.prototype, {
    
    defined: function(){
        return this._cp.defined();
    },

    canBeTrue: function(){
        return this._cp.canBeTrue();
    },

    canBeFalse: function(){
        return this._cp.canBeFalse();
    },

    remove: function(value){
        var changed = this._cp.remove(value);
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
        return ret;
    },

    notified: function(){
        this.notifyContainers();
    },

    reduceObservedDomain: function(){
        return this._cp.reduceObservedDomain();
    },

});

function CPNot(manager,cp){
    CPBase.call(this,manager,"Not(" + cp.name() + ")", [cp] ); 
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
        return ret;
    },

    notified: function(){
        this.notifyContainers();
    },

    reduceObservedDomain: function(){
        return this._cp.reduceObservedDomain();
    },

});




if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    CPManager: CPManager,
};


if( typeof require != "undefined" ){
    var common = require("./common");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
}


class CPManager {
    constructor() {
        this._cps = [];
        var self = this;
        this._stackIndex = 0;
        this.setEmptyDomainHandler(CPManager.defaultEmptyDomainHandler);
        this.booleans = {};
    }


    checkIfFailed(){
        for( var i = 0 ; i < this.cps().length ; i++ ){
            if( this.cps()[i].impossible() ){
                return true;
            }
        }
        return false;
    }
    
    cps(){
        return this._cps;
    }

    static defaultEmptyDomainHandler(cp){
        console.log( cp.name() + " has empty domain. Contained in " + cp._containers.length + " containers:" )
        for( let i = 0 ; i < cp._containers.length ; i++ ){
            console.log( "  " + cp._containers[i].name() );
        }

        console.log( "All cps:" );
        cp.manager().describe(console.log);
        
        var error = new Error(cp.name() + " has empty domain");
        error.cp = cp;
        throw error;
    }

    setEmptyDomainHandler(h){
        this._emptyDomainHandler = h;
    }

    notifyEmptyDomain(cp){
        log( "------ emptyDomain:" + cp.toString() );
        this._emptyDomainHandler(cp);
    }

    pushScenario(){
        for( var i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].pushDomain();
        }
        this._stackIndex += 1;
    }

    popScenario(){
        assert(this._stackIndex>0);
        for( var i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].popDomain();
        }
        this._stackIndex -= 1;
    }

    stackIndex(){
        return this._stackIndex;
    }
    
    static concatenateNames(cps){
        var names = "";
        for( var i = 0 ; i < cps.length ; i++ ){
            names += cps[i].name() + " ";
        }
        return names;
    }

    addCP(cp){
        this._cps.push(cp);
    }
    
    Boolean(name){
        let ret = this.booleans[name];
        if( !ret ){
            ret = new CPBoolean(this,name);
            this.booleans[name] = ret;
        }
        return ret;
    }

    And(cps){
        var ret =  this.SomeTrue(cps,cps.length);
        var names = CPManager.concatenateNames(cps);
        return this.Rename(ret,"And(" + names + ")");
    }



    Not(cp){
        if( cp instanceof CPNot ){
            return cp.negatedCP();
        }
        else{
            return new CPNot(this,cp);
        }
    }

    Rename(cp,name){
        return cp.rename(name); 
    }


    SomeTrue(cps,numberMin,numberMax){
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
    }

    Or(cps){
        var negatedCPS = [];
        var names = CPManager.concatenateNames(cps);
        for( var i = 0 ; i < cps.length ; i++ ){
            negatedCPS.push( this.Not(cps[i]) );
        }
        var ret =  this.Not( this.And(negatedCPS) );
        return this.Rename(ret,"Or(" + names + ")" );
    }

    IfThen(cpIf, cpThen){
        // if    then
        // f     f    t
        // f     t    t
        // t     f    f
        // t     t    t

        var ret = this.Or( [this.Not(cpIf), cpThen] );
        return this.Rename(ret,"If(" + cpIf.name() + ")Then(" + cpThen.name() + ")");
    }

    ForAll(cps,cpThen){
        const binaryDigit = function(number,size,digit){
            let bin = (number>>>0).toString(2);
            while( bin.length < size ){
                bin = "0"+bin;
            }
            let ret = bin.substr(digit,1)
            return Number(ret);
        }

        let cpsNot = [];
        for( let i = 0 ; i < cps.length ; i += 1 ){
            cpsNot.push( this.Not(cps[i]));
        }
        
        let ifthens = [];
        for( let i = 0 ; i < (2 << cps.length) ; i += 1 ){
            let combination = [];
            for( let j = 0 ; j < cps.length ; j += 1 ){
                let bit = binaryDigit(i,j);
                let c = cps[j];
                if( !bit ){
                    c = cpsNot[j];
                }
                combination.push(c);
            }
            ifthens.push( this.IfThen( this.And(combination) ,cpThen));
        }

        let ret =  this.And(ifthens);
        return ret.rename( "ForAll(" + CPManager.concatenateNames(cps) + ")Then(" + cpThen.name() + ")");
    }

    Iff(lhs,rhs){
        var ret = this.And( [this.IfThen(lhs,rhs),this.IfThen(rhs,lhs)]);
        return this.Rename(ret,"Iff(" + lhs.name() + ", " + rhs.name() + ")");
    }

    
    describe(println){
        if( !println ) println = console.log;
        for( var i = 0 ; i < this._cps.length ; i++ ){
            var cp = this._cps[i];
            if( cp._containers.length == 0 ){
                cp.describe(println);
            }
        }

    }
}



class CPBase {
    constructor(manager, id, observed) {
        this._manager = manager;
        this._id = id;
        this._name = id;
        this._containers = [];
        this._observed = [];
        if (observed) {
            this._observed = observed;
        }
        for (var i = 0; i < this._observed.length; i++) {
            this._observed[i].addContainer(this);
        }
        manager.addCP(this);
    }
    asTrue(){
        this.remove(false);
        return this;
    }
    
    rename(name){
        this._name=name;
        return this;
    }

    pushDomain(){
        // Abstract method, to be overriden
    }

    popDomain(){
        // Abstract method, to be overriden
    }

    manager(){
        return this._manager;
    }
    
    addContainer(d){
        this._containers.push(d);
    }

    notifyContainers(){
        log( this.name() + ": notifyContainers ");
        for( var i = 0 ; i < this._containers.length ; i++ ){
            var cp = this._containers[i];
            log( "  " + this.name() + ": notifyContainers: " + cp.name() );
            cp.notified();
        }
    }

    notified(){
        var own = this.reduceOwnDomain();
        var obs = this.reduceObservedDomain();
        log( "obs:" + obs +  "  own:" + own + "  --- " + this.name() );
        if( own ){
            this.notifyContainers();
        }
    }

    notifyIfEmptyDomain(){
        if( this.impossible() ){
            this.manager().notifyEmptyDomain(this);
        }
    }

    describe(println,level){

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
        println( s + this.toString() + " (" + this._containers.length + " containers)" );

        for( var i = 0; i < this.observed().length ; i++ ){
            this.observed()[i].describe(println,level+1);
        }
    }

    observed(){
        return this._observed;
    }
    
    toString(){
        let id = "";
        if( this.id() != this.name() ){
            id = "(id:" + this.id() + ")";
        }
        
        return "[" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_") + "]:" + this.name();
    }

    valueAsString(ifTrue,ifFalse,ifNone){
        if( this.isTrue() ){
            return ifTrue;
        }
        else if( this.isFalse() ){
            return ifFalse;
        }
        else{
            return ifNone;
        }
    }

    defined(){
        return (this.canBeTrue() && !this.canBeFalse()) || (!this.canBeTrue() && this.canBeFalse());
    }
    
    name(){
        return this._name;
    }

    id(){
        return this._id;
    }

    impossible(){
        return !this.canBeTrue() && !this.canBeFalse();
    }

    canBeTrue(){
        // Abstract method, to be overriden
        assert(false);
    }

    canBeFalse(){
        // Abstract method, to be overriden
        assert(false);
    }

    isFalse(){
        return this.defined() && this.canBeFalse();
    }

    isTrue(){
        return this.defined() && this.canBeTrue();
    }

    reduceOwnDomain(){
        // Abstract method, to be overriden
        return false;
    }

    reduceObservedDomain(){
        // Abstract method, to be overriden
        return false;
    }


};

class CPBoolean extends CPBase{
    constructor(manager, name, observed) {
        super(manager, name, observed);
        this._canBeTrue = [true];
        this._canBeFalse = [true];
        this.notified();
    }

    pushDomain(){
        this._canBeTrue.push(this.canBeTrue());
        this._canBeFalse.push(this.canBeFalse());
    }

    popDomain(){
        assert(this._canBeTrue.length > 1);
        this._canBeTrue.pop();
        this._canBeFalse.pop();
    }

    canBeTrue(){
        return this._canBeTrue[this.manager().stackIndex()];
    }

    canBeFalse(){
        return this._canBeFalse[this.manager().stackIndex()];
    }

    rename(name){
        this._name=name;
        return this;
    }


    remove(value){
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
    }
}

class CPForAll extends CPBoolean{
    constructor(manager, cps, cpThen ){
        super( manager, "ForAll(" + CPManager.concatenateNames(cps) + ")Then(" + cpThen.name() + ")", cps.concat(cpThen) );
        this._cps = cps;
        this._cpThen = cpThen;
        this.reduceOwnDomain();
    }

    reduceOwnDomain(){
        let backtrack = new CPContinuableBacktrack(this._cps, [cpThen]);
        let solutions = 0;
        while( backtrack.nextSolution() ){
            solutions += 1;
        }
        
    }
}

class CPNumberTrue extends CPBoolean{

    constructor(manager, cps, number) {
        super( manager, "AreTrue(" + number + ")(" + CPManager.concatenateNames(cps) + ")", cps);
        this._number = number;
        this.reduceOwnDomain();
        this.reduceObservedDomain();
    }

    number(){
        return this._number;
    }

    status(){
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
    }
    
    reduceOwnDomain(){
        var cps = this.observed();

        //var log = function(s){ console.log(s); };

        
        var s = this.status();
        
        log( this.name() + ": reduceOwndomain" );

        var ret = false;
        
        if( s.trues.length > this.number() ){
            log( this.name() + ": trueNumber:" + s.trues.length + ": more true than expected");
            ret = ret || this.remove(true);
        }
        else if( s.falses.length > cps.length - this.number() ){
            log( this.name() + ": falses.length:" + s.falses.length + ": more false than expected" );
            ret = ret || this.remove(true);
        }
        else if( s.falses.length  + s.trues.length == cps.length && s.trues.length == this.number() ){
            log( this.name() + ": all defined and number correct" );
            ret = ret || this.remove(false);
        }
        log( "reduceOwnDomain ends: " + ret );
        return ret;
    }

    reduceObservedDomain(){
        //var log = function(s){/*console.log(s);*/};

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
}


class CPNot extends CPBase{
    constructor(manager, cp) {
        super(manager,"Not(" + cp.name() + ")", [cp]);
        this._cp = cp;
        this.reduceOwnDomain();
        this.reduceObservedDomain();
    }

    negatedCP(){
        return this._cp;
    }
    
    defined(){
        return this._cp.defined();
    }

    canBeTrue(){
        return this._cp.canBeFalse();
    }

    canBeFalse(){
        return this._cp.canBeTrue();
    }

    remove(value){
        var changed = this._cp.remove(!value);
        if( changed ){
            this.notifyContainers();
        }
        return changed;
    }

    reduceOwnDomain(){
        var ret = this._cp.reduceOwnDomain();
        if( ret ){
            this.notifyContainers();
        }
        return ret;
    }

    notified(){
        this.notifyContainers();
    }

    reduceObservedDomain(){
        return this._cp.reduceObservedDomain();
    }

}




if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    CPManager: CPManager,
};


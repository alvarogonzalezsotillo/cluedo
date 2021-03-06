if( typeof require != "undefined" ){
    let common = require("./common");
    let backtrack = require("./cp.backtrack");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
    CPContinuableBacktrack = backtrack.CPContinuableBacktrack;
}

const USE_EVENTS = false;

class PropagateEvent{
    constructor(cp){
        this._cp = cp;
    }

    get cp(){
        return this._cp;
    }
    
    execute(){
        throw new Error("Should be override");
    }

    toString(){
        return this.constructor.name + ":" + this.cp.id();
    }
}

class NotifiedEvent extends PropagateEvent{
    constructor(cp){
        super(cp);
    }

    execute(){
        this.cp.doNotified();
    }
}

class ReduceOwnDomainEvent extends PropagateEvent{
    constructor(cp){
        super(cp);
    }

    execute(){
        if( this.cp.reduceOwnDomain() ){
            const m = this.cp.manager;
            this.cp._containers.forEach(
                c =>
                    m.addPropagateEvents([
                        new ReduceObservedDomainEvent(c),
                        , new ReduceOwnDomainEvent(c)
                    ])
            );
        }
    }
}

class ReduceObservedDomainEvent extends PropagateEvent{
    constructor(cp){
        super(cp);
    }

    execute(){
        this.cp.reduceObservedDomain();
    }
}

class EventQueue{
    constructor(){
        this._queue = [];
    }

    contains(event){
        return this._queue.find( e => e.toString() == event.toString() );
    }
    
    add(e){
        if( !this.contains(e) ){
            log("add:" + e );
            this._queue.push(e);
            return true;
        }
        return false;
    }

    size(){
        return this._queue.length;
    }

    empty(){
        return this.size() == 0;
    }
    
    pop(){
        if( this.empty() ){
            return undefined;
        }
        const next = this._queue[0];
        this._queue = this._queue.slice(1);
        return next;
    }

    dump(log){
        log = log || console.log;
        log( "propagate: " + this.size() );
        this._queue.forEach( e => log( "  " + e.toString() ));
    }
}


class CPManager {
    constructor() {
        this._cps = [];
        this._stackIndex = 0;
        this._emptyDomainHandlers = [];
        this.pushEmptyDomainHandler(CPManager.defaultEmptyDomainHandler);
        this._propagateQueue = new EventQueue();
        this._propagating = false;
        this.booleans = {};
        this._serial = 0;
    }

    propagate(){
        if( this._propagating ){
            log( "Aún propagando. Salgo.");
            return;
        }
        try{
            log( "Empieza propagate");
            this._propagating = true;
            while( !this._propagateQueue.empty() ){
                //this._propagateQueue.dump(log);
                const nextEvent = this._propagateQueue.pop();
                nextEvent.execute();
            }
        }
        finally{
            this._propagating = false;
        }
        log( "Se acabó propagate " );
    }

    addPropagateEvents(events){
        var added = 0;
        events.forEach( e => this._propagateQueue.add(e) && added++ );
        if( added ){
            this.propagate();
        }
    }

    checkIfFailed(){
        for( let i = 0 ; i < this.cps().length ; i++ ){
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
        console.log( cp.name() + " has empty domain. Contained in " + cp._containers.length + " containers:" );
        for( let i = 0 ; i < cp._containers.length ; i++ ){
            console.log( "  " + cp._containers[i].name() );
        }

        console.log( "All cps:" );
        cp.manager.describe(console.log);
        
        let error = new Error(cp.name() + " has empty domain");
        error.cp = cp;
        throw error;
    }

    pushEmptyDomainHandler(h){
        this._emptyDomainHandlers.push(h);
    }

    popEmptyDomainHandler(){
        this._emptyDomainHandlers.pop();
    }

    notifyEmptyDomain(cp){
        log( "------ emptyDomain:" + cp.toString() );
        this._emptyDomainHandlers[this._emptyDomainHandlers.length-1](cp);
    }

    pushScenario(){
        for( let i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].pushDomain();
        }
        this._stackIndex += 1;
    }

    popScenario(){
        if( this._stackIndex<=0 ){
            throw new Error("Stack empty");
        }
        for( let i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].popDomain();
        }
        this._stackIndex -= 1;
    }

    stackIndex(){
        return this._stackIndex;
    }
    
    static concatenateNames(cps){
        let names = "";
        for( let i = 0 ; i < cps.length ; i++ ){
            names += cps[i].name() + " ";
        }
        return names;
    }

    addCP(cp){
        this._cps.push(cp);
    }
    
    Boolean(name){
        this._serial += 1;
        name = name || "booleano sin nombre " + this._serial;
        let ret = this.booleans[name];
        if( !ret ){
            ret = new CPBoolean(this,name);
            this.booleans[name] = ret;
        }
        return ret;
    }

    And(cps){
        let ret =  this.SomeTrue(cps,cps.length);
        let names = CPManager.concatenateNames(cps);
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
            let rets = [];
            for( let i = numberMin ; i <= numberMax ; i++ ){
                rets.push( new CPNumberTrue(this,cps,i) );
            }
            return new CPNumberTrue(this,rets,1);
        }
    }

    Or(cps){
        let negatedCPS = [];
        let names = CPManager.concatenateNames(cps);
        for( let i = 0 ; i < cps.length ; i++ ){
            negatedCPS.push( this.Not(cps[i]) );
        }
        let ret =  this.Not( this.And(negatedCPS) );
        return this.Rename(ret,"Or(" + names + ")" );
    }

    IfThen(cpIf, cpThen){
        assert(cpThen);
        // if    then
        // f     f    t
        // f     t    t
        // t     f    f
        // t     t    t

        let ret = this.Or( [this.Not(cpIf), cpThen] );
        return this.Rename(ret,"If(" + cpIf.name() + ")Then(" + cpThen.name() + ")");
    }

    ForAll(cps,cpThen){
        return new CPForAll(this,cps,cpThen);
    }

    Iff(lhs,rhs){
        let ret = this.And( [this.IfThen(lhs,rhs),this.IfThen(rhs,lhs)]);
        return this.Rename(ret,"Iff(" + lhs.name() + ", " + rhs.name() + ")");
    }

    Bind(a,b){
        return this.Iff(a,b).asTrue();
    }

    
    describe(println){
        if( !println ) println = console.log;
        for( let i = 0 ; i < this._cps.length ; i++ ){
            let cp = this._cps[i];
            if( cp._containers.length == 0 ){
                cp.describe(println);
            }
        }

    }
}


class CPLike{

    constructor(id,name){
        this._name = id;
        this._id = id;
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

    rename(name){
        this._name=name;
        return this;
    }

    toString(){
        let id = "";
        if( this.id() != this.name() ){
            id = "(id:" + this.id() + ")";
        }
        
        return "[" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_") + "]:" + this.name();
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

}

class CPBase extends CPLike{
    constructor(manager, id, observed) {
        super(id);
        this._manager = manager;
        this._containers = [];
        this._observed = [];
        if (observed) {
            this._observed = observed;
        }
        for (let i = 0; i < this._observed.length; i++) {
            this._observed[i].addContainer(this);
        }
        manager.addCP(this);
    }

    abstractMethod(){
        throw new Error("Abstract method, to be overriden:" + this.constructor.name );
    }
    
    remove(value){
        this.abstractMethod();
    }

    
    asTrue(){
        this.remove(false);
        return this;
    }
    

    pushDomain(){
        this.abstractMethod();
    }

    popDomain(){
        this.abstractMethod();
    }

    get manager(){
        return this._manager;
    }
    
    addContainer(d){
        this._containers.push(d);
    }

    notifyContainers(){
        log( this.name() + ": notifyContainers ");
        for( let i = 0 ; i < this._containers.length ; i++ ){
            let cp = this._containers[i];
            log( "  " + this.name() + ": notifyContainers: " + cp.name() );
            cp.notified();
        }
    }

    notified(){
        if( USE_EVENTS ){
            this.manager.addPropagateEvents([
                new NotifiedEvent(this)
            ]);
        }
        else{
            this.doNotified();
        }
    }

    doNotified(){
        let own = this.reduceOwnDomain();
        let obs = this.reduceObservedDomain();
        log( "obs:" + obs +  "  own:" + own + "  --- " + this.name() );
        if( own ){
            this.notifyContainers();
        }
    }

    notifyIfEmptyDomain(){
        if( this.impossible() ){
            this.manager.notifyEmptyDomain(this);
        }
    }

    describe(println,level){

        if( !println ){
            println = console.log;
        }
        
        if( !level ){
            level = 0;
        }
        
        let s = "";
        for( let i = 0 ; i < level ; i++ ){
            s += "  ";
        }
        println( s + this.toString() + " (" + this._containers.length + " containers)" );

        for( let i = 0; i < this.observed().length ; i++ ){
            this.observed()[i].describe(println,level+1);
        }
    }

    observed(){
        return this._observed;
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


    reduceOwnDomain(){
        this.abstractMethod();
        return false;
    }

    reduceObservedDomain(){
        this.abstractMethod();
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
        return this._canBeTrue[this.manager.stackIndex()];
    }

    canBeFalse(){
        return this._canBeFalse[this.manager.stackIndex()];
    }

    rename(name){
        //if( this.constructor.name == CPBoolean.name ){
        //    throw new Error("No se puede cambiar el nombre de un CPBoolean");
        //}
        return super.rename(name);
    }


    remove(value){
        //log( this.name() + ": remove:" + value );
        if( value && this.canBeTrue() ){
            //log( "  " + this.name() + ": remove: removed true");
            this._canBeTrue[this.manager.stackIndex()] = false;
            this.notifyIfEmptyDomain();
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }
        
        if( !value && this.canBeFalse() ){
            //log( "  " + this.name() + ":  remove: removed false");
            this._canBeFalse[this.manager.stackIndex()] = false;
            this.notifyIfEmptyDomain();
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }

        return false;
    }

    reduceOwnDomain(){
        return false;
    }

    reduceObservedDomain(){
        return false;
    }
}

CPManager.CPAllPosibilities = function(cps,cpsReturn){
    cpsReturn = cpsReturn || cps;
    const bt = new CPContinuableBacktrack(cps);
    const posibilities = [];
    while( bt.nextSolution() ){
        const posibility = cpsReturn.map( cp => cp.isTrue() );
        posibilities.push(posibility);
    }
    bt.finalize();
    return posibilities;
}


class CPForAll extends CPLike{
    constructor(manager, cps, cpThen ){
        super("forall(" + cps + ")then(" + cpThen.id() + ")" );
        this._manager = manager;
        this._cps = cps;
        this._cpThen = cpThen;
        this._canBeTrue = true;
        this._canBeFalse = true;
        this.update();
    }

    update(){
        if( this._reducing ){
            return false;
        }
        this._reducing = true;
        let ret = undefined;
        try{
            ret = this.internalReduceOwnDomain();
        }
        finally{
            this._reducing = false;
        }
        return ret;
            
    }

    internalReduceOwnDomain(){
        if( !this._cps ){
            // STILL IN BASE CONSTRUCTOR
            return false;
        }
        if( !this.canBeFalse ){
            return false;
        }
        let backtrack = new CPContinuableBacktrack(this._cps);
        let failed = false;
        const failedCB = function(){
            failed = true;
        };
        
        this._manager.pushEmptyDomainHandler(failedCB);

        let someTrue = false;
        let someFalse = false;
        let someUndefined = false;

        //log( "cpforall.reduceOwnDomain");

        while( backtrack.nextSolution() && !failed ){

            //log( "  cpforall.reduceOwnDomain: nextSolution: " + this._cpThen );
            if( this._cpThen.isTrue() ){
                someTrue = true;
                if( someFalse ){
                    break;
                }
            }
            if( this._cpThen.isFalse() ){
                someFalse = true;
                if( someTrue ){
                    break;
                }
            }
            if( !this._cpThen.defined() ){
                someUndefined = true;
                break;
            }
        }
        //log( "  cpforall.reduceOwnDomain: someTrue:" + someTrue + " someFalse:" + someFalse + " someUndefined:" + someUndefined );

        backtrack.finalize();
        this._manager.popEmptyDomainHandler();

        if( !failed && !someFalse && !someUndefined ){
            this.remove(false);
            return true;
        }

        if( !failed && !someTrue && !someUndefined ){
            this.remove(true);
            return true;
        }

        return false;
    }

    remove(value){
        if( value && this._canBeTrue ){
            this._canBeTrue = false;
        }
        if( !value && this._canBeFalse ){
            this._canBeFalse = false;
        }

    }

    canBeTrue(){
        return this._canBeTrue;
    }

    canBeFalse(){
        return this._canBeFalse;
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
        let cps = this.observed();

        let ret = {
            falses : [],
            trues : [],
            undefineds : []
        };

        for( let i = 0 ; i < cps.length ; i++ ){
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
        let cps = this.observed();

        //let log = function(s){ console.log(s); };

        
        let s = this.status();
        
        log( this.name() + ": reduceOwndomain" );

        let ret = false;
        
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
        //let log = function(s){/*console.log(s);*/};

        let s = this.status();
        let remainingTrues = this.number() - s.trues.length;
        let possibleTruesOrFalses = s.undefineds.length;

        log(this.name());
        log(s)
        log( "  remainigTrues:" + remainingTrues + "  possibleTruesorfalses:" + possibleTruesOrFalses );
        
        if( this.isTrue() ){
            //assert( s.trues.length <= this.number() );
            if( remainingTrues == possibleTruesOrFalses ){
                log( this.name() + ": needed some more trues, the same as undefined");
                for( let i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(false);
                }
                return true;
            }

            let cps = this.observed();
            
            if( s.trues.length == this.number()  ){
                log( this.name() + ": all needed trues defined, the rest are falses" );
                for( let i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(true);
                }
                return true;
            }
        }

        if( this.isFalse() ){

            if( s.trues.length == this.number()-1 && possibleTruesOrFalses == 1 ){
                log( this.name() + ": since I am false, at least one of my possible trues can not be true");
                for( let i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(true);
                }
                return true;
            }

            if( s.trues.length == this.number() && possibleTruesOrFalses == 1 ){
                log( this.name() + ": since I am false, at least one of my possible trues is true");
                for( let i = 0 ; i < s.undefineds.length ; i++ ){
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
        let changed = this._cp.remove(!value);
        if( changed ){
            this.notifyContainers();
        }
        return changed;
    }

    reduceOwnDomain(){
        let ret = this._cp.reduceOwnDomain();
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

    pushDomain(){
    }

    popDomain(){
    }

}




if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    CPManager: CPManager,
};


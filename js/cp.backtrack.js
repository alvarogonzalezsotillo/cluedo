if( typeof require != "undefined" ){
    let common = require("./common");
    let cp = require("./cp");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
    CPManager = cp.CPManager;
}


function CPBacktrack(cps,foundCallback,fromIndex){
    let CP = cps[0].manager();
    CP.pushEmptyDomainHandler(failedCallback);
    let self = this;
    self._failed = false;


    function setFailed(b){
        log("setFailed:" + b );
        self._failed = b;
    };
    
    function failedCallback(cp){
        log("----------- failed:" + cp.name() );
        setFailed(true);
        log("-----------   así que failed:" + self._failed );
    }
    
    if( !fromIndex ){
        index = -1;
    }
    
    function firstUndefinedIndexFrom(j){
        if( !j ){
            j = 0;
        }
        for(  ; j < cps.length ; j++ ){
            if( !cps[j].defined() ){
                return j;
            }
        }
        return -1;
    }

    function tryRemoving(i,b){

        log( "tryRemoving:" + i + "  " + b );
        for( let j = 0 ; j < cps.length ; j++ ){
            log( cps[j].toString() );
        }
        
        let cp = cps[i];
        CP.pushScenario();
        setFailed(false);
        cp.remove(b);
        if( !self._failed ){
            if( firstUndefinedIndexFrom() == -1 ){
                foundCallback(cps);
            }
            else{
                CPBacktrack(cps, foundCallback, i);
            }
        }
        CP.popScenario();
    }

    let i = firstUndefinedIndexFrom(fromIndex);
    if( i != -1 ){
        tryRemoving(i,true);
        tryRemoving(i,false);
    }
    CP.popEmptyDomainHandler();
}

function CPContinuableBacktrack( cps, toBeDefined ){
    this._cps = cps;
    this._toBeDefined = toBeDefined || cps;
    this._CP = this._cps[0].manager();
    this.executed = false;

    let self = this;

    let nextRestCps = cps.slice(0);
    let nextCp = nextRestCps.pop();
    
    
    this._stack = [new this.State(nextCp,true,nextRestCps), new this.State(nextCp,false,nextRestCps)];
}


MixIn(CPContinuableBacktrack.prototype,{

    State : function(cp,value,restCps){
        this.executed = false;
        this.cp = cp;
        this.execute = function(){
            assert( this.executed === false );
            this.executed = true;

            if( !cp.defined() ){
                cp.remove(value);
            }

            
            let nextRestCps = restCps.slice(0);
            let nextCp = nextRestCps.pop();
            log( "nextCp: " + nextCp );
            let S = CPContinuableBacktrack.prototype.State;
            if( nextCp ){
                return [new S(nextCp,true,nextRestCps), new S(nextCp,false,nextRestCps)];
            }
            else{
                return [];
            }
        }
    },
    

    currentLevel : function(){
        return this._stack.length-1;
    },

    pushStates : function(states){
        return this._stack = this._stack.concat(states);
    },

    popState : function(){
        if( this.currentLevel() >= 0 ){
            return this._stack.pop();
        }
        return undefined;
    },

    peekState : function(){
        if( this.currentLevel() >= 0 ){
            return this._stack[this._stack.length-1];
        }
        return undefined;
    },

    allDefined : function(){
        for( let i = 0 ; i < this._toBeDefined.length ; i++ ){
            if( !this._toBeDefined[i].defined() ){
                return false;
            }
        }
        return true;
    },

    stackEmpty : function(){
        return this.currentLevel() < 0;
    },


    finalize : function(){
        while(!this.stackEmpty() ){
            this.popState();
            this._CP.popScenario();
        }
    },
    
    nextSolution : function(){

        //const log = function(msg){console.log(msg);};
        while( !this.stackEmpty() ){

            log( "Stack not empty" );
            let state = this.peekState();

            log( "  state:" + state.cp.name() + "  executed:" + state.executed );

            if( state.executed ){
                this.popState();
                this._CP.popScenario();
            }
            else{
                this._CP.pushScenario();
                let failed = false;
                this._CP.pushEmptyDomainHandler(function(cp){
                    log( "failed:" + cp )
                    failed=true;
                });
                let newStates = state.execute();
                this._CP.popEmptyDomainHandler();
                log( "Executed");
                if( !failed && this.allDefined() ){
                    log( "  Están todos definidos");
                    return true;
                }
                else if(!failed){
                    log("  newStates:" + newStates + "  level:" + this.currentLevel() );
                    this.pushStates( newStates );
                    log( "  level after push:" + this.currentLevel() );
                }
            }
        }
        
        return false;
    }
    
});



if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    CPBacktrack: CPBacktrack,
    CPContinuableBacktrack : CPContinuableBacktrack,
};







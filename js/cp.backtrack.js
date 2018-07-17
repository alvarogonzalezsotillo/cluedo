if( typeof require != "undefined" ){
    let common = require("./common");
    let cp = require("./cp");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
    CPManager = cp.CPManager;
}


function CPBacktrack(cps,foundCallback){
    const bt = new CPContinuableBacktrack(cps);
    while( bt.nextSolution() ){
        foundCallback(cps);
    }
    bt.finalize();
}


class State{
    constructor(cp,value,restCps){
        this.executed = false;
        this.cp = cp;
        this.value = value;
        this.restCps = restCps;
    }

    
    execute(){
        assert( this.executed === false );
        this.executed = true;

        if( !this.cp.defined() ){
            this.cp.remove(this.value);
        }

        return State.nextStatesFor(this.restCps);
    }

    static nextStatesFor(cps){
        const restCps = cps.slice(0);
        const nextCp = restCps.pop();
        if( nextCp ){
            return [new State(nextCp,true,restCps), new State(nextCp,false,restCps)];
        }
        else{
            return [];
        }
    }
    
}


class CPContinuableBacktrack{



    constructor( cps, toBeDefined ){
        this._cps = cps;
        this._toBeDefined = toBeDefined || cps;
        this._CP = this._cps[0].manager();
        this._stack = State.nextStatesFor(cps);
    }


    

    currentLevel(){
        return this._stack.length-1;
    }

    pushStates(states){
        return this._stack = this._stack.concat(states);
    }

    popState(){
        if( this.currentLevel() >= 0 ){
            return this._stack.pop();
        }
        return undefined;
    }

    peekState(){
        if( this.currentLevel() >= 0 ){
            return this._stack[this._stack.length-1];
        }
        return undefined;
    }

    allDefined(){
        for( let i = 0 ; i < this._toBeDefined.length ; i++ ){
            if( !this._toBeDefined[i].defined() ){
                return false;
            }
        }
        return true;
    }

    stackEmpty(){
        return this.currentLevel() < 0;
    }


    finalize(){
        while(!this.stackEmpty() ){
            this.popState();
            this._CP.popScenario();
        }
    }
    
    nextSolution(){

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
}



if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    CPBacktrack: CPBacktrack,
    CPContinuableBacktrack : CPContinuableBacktrack,
};







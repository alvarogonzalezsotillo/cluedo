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

    toString(){
        const execd = this.executed ? "(execd)" : "(not execd)";
        return "Set to " + !this.value + "  " + execd +":" + this.cp.name();
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
        this._stack = State.nextStatesFor(cps);
    }

    get manager(){
        return this._cps[0].manager;
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
        while( !this.stackEmpty() ){
            this.popState();
        }

        while( this.manager.stackIndex() > 0 ){
            this.manager.popScenario();
        }
    }

    checkStacks(){
        let executed = 0;
        this._stack.forEach( s => executed += s.executed ? 1 : 0 );
        assert( executed == this.manager.stackIndex() );
    }
    
    nextSolution(){

        //const log = function(msg){console.log(msg);};
        log( "----->" );
        while( !this.stackEmpty() ){

            log( "next loop");
            log( "  stack:" );
            this._stack.forEach( s => log( "    " + s) );

            log( "  cps:" );
            this._cps.forEach( c => log( "    " + c ));


            
            log( "  Status Stack:" + this.currentLevel() + " -- scenarios stack:" + this.manager.stackIndex() );
            this.checkStacks();

            const state = this.peekState();

            log( "  state:" + state );


            if( state.executed ){
                this.popState();
                this.manager.popScenario();
                log( "  popScenario: scenario stack:" +  this.manager.stackIndex());
            }
            else{
                this.manager.pushScenario();
                log( "  pushScenario: " + this.manager.stackIndex() );
                let failed = false;
                this.manager.pushEmptyDomainHandler(function(cp){
                    log( "failed:" + cp )
                    failed=true;
                });
                let newStates = state.execute();
                this.manager.popEmptyDomainHandler();
                log( "  Executed:" + state );
                if( !failed && this.allDefined() ){
                    log( "  Están todos definidos");
                    this._cps.forEach( c => log( "    " + c ));
                    log( "  nextSolution: true");
                    return true;
                }
                else if(!failed){
                    log("  newStates:" + newStates + "  level:" + this.currentLevel() + " -- " + this.manager.stackIndex() );
                    this.pushStates( newStates );
                    log( "  level after push:" + this.currentLevel() + " -- " + this.manager.stackIndex() );
                }
            }
        }

        log( "  nextSolution: false");
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







if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
    CPManager = cp.CPManager;
}


function CPBacktrack(cps,foundCallback,fromIndex){
    var CP = cps[0].manager();
    CP.setEmptyDomainHandler(failedCallback);
    var self = this;
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
        for( var j = 0 ; j < cps.length ; j++ ){
            log( cps[j].toString() );
        }
        
        var cp = cps[i];
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

    var i = firstUndefinedIndexFrom(fromIndex);
    if( i != -1 ){
        tryRemoving(i,true);
        tryRemoving(i,false);
    }
}

if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    CPBacktrack: CPBacktrack,
};







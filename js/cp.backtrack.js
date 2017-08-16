if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    MixIn = common.MixIn;
    assert = common.assert;
    log = common.log;
    CPManager = cp.CPManager;
}


function CPBacktrack(cps,foundCallback){
    var CP = cps[0].manager();

    function firstUndefined(){
        for( var i = 0 ; i < cps.length ; i++ ){
            if( !cps[i].defined() ){
                return cps[i];
            }
        }
        return undefined;
    }

    function tryRemoving(cp,b){
        CP.pushScenario();
        cp.remove(b);
        if( !firstUndefined() ){
            foundCallback(cps);
        }
        cp.popScenario();
    }

    for( var cp = firstUndefined() ; cp ; cp = firstUndefined() ){
        tryRemoving(cp,true);
        tryRemoving(cp,false);
    }
    
}

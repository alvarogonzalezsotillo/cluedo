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
    var failed = false;
    
    function failedCallback(){
        failed = true;
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
        var cp = cps[i];
        CP.pushScenario();
        failed = false;
        cp.remove(b);
        if( firstUndefinedIndexFrom() == -1 ){
            foundCallback(cps);
        }
        if( !failed ){
            CPBacktrack(cps, foundCallback, i);
        }
        CP.popScenario();
    }

    for( var i = firstUndefinedIndexFrom(fromIndex) ; i != -1 ; i = firstUndefinedIndexFrom(i+1) ){
        tryRemoving(i,true);
        tryRemoving(i,false);
    }
    
}

var CP = new CPManager();
var a = CP.Boolean("a");
var b = CP.Boolean("b");
var c = CP.Boolean("c");
CP.And([a,b]).remove(false);

function describeAll(cps){
    for( var i = 0 ;  i < cps.length ; i++ ){
        cps[i].describe();
    }
}

CPBacktrack( [a,b,c], function(cps){
    console.log("********** STATE FOUND")
    describeAll(cps);
});


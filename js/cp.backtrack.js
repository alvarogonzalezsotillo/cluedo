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
        console.log( "Probando a quitar:" + b + " de:" + cp.toString() );
        CP.pushScenario();
        cp.remove(b);
        if( firstUndefinedIndexFrom() == -1 ){
            console.log("callback");
            foundCallback(cps);
        }
        CPBacktrack(cps, foundCallback, i);
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

function describeAll(cps){
    for( var i = 0 ;  i < cps.length ; i++ ){
        cps[i].describe();
    }
}

CPBacktrack( [a,b,c], function(cps){
    console.log("********** STATE FOUND")
    describeAll(cps);
});


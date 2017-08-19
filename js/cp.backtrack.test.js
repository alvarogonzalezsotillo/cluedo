

if( typeof require != "undefined"){
    var cp = require("./cp");
    var common = require("./common");
    CPManager = cp.CPManager;
    assert = common.assert;

    var cpb = require("./cp.backtrack");
    CPBacktrack = cpb.CPBacktrack;
    CPContinuableBacktrack = cpb.CPContinuableBacktrack;

}





function test(){

    var tests = [
        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            CP.pushScenario();
            assert(!a.defined());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            
            CP.pushScenario();
            a.remove(true);
            assert(a.isFalse())

            CP.popScenario();
            assert(!a.defined());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var or = CP.Or([a,b,c]);

            c.remove(true);
            
            CP.pushScenario();
            or.remove(true);
            assert(a.isFalse());
            assert(b.isFalse());
            assert(c.isFalse());

            CP.popScenario();
            assert(!a.defined());
            assert(!b.defined());
            assert(c.isFalse());
        },


        function (){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            CP.And([a,b]).asTrue();
            CP.Or([c,d]).asTrue();
            var count = 0;

            function describeAll(cps){
                for( var i = 0 ;  i < cps.length ; i++ ){
                    cps[i].describe(log);
                }
            }

            CPBacktrack( [a,b,c,d], function(cps){
                log("********** STATE FOUND")
                describeAll(cps);
                count += 1;
            });

            assert(count==3);
        },

        function (){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            CP.And([a,b]).asTrue();
            CP.Or([c,d]).asTrue();
            var count = 0;

            var log = console.log;
            
            function describeAll(cps){
                for( var i = 0 ;  i < cps.length ; i++ ){
                    cps[i].describe(log);
                }
            }

            var cps = [a,b,c,d];
            var cpcb = new CPContinuableBacktrack(cps);
            while( cpcb.nextSolution() ){
                log("********** STATE FOUND")
                describeAll(cps);
                count += 1;

            }
            assert(count==3);

        },

        
    ];

    tests[tests.length-1](); return;
    
    for( var i = 0 ; i < tests.length ; i++ ){
        console.log( "----- Test " + i );
        tests[i]();
    }
    
    
}

test();



if( typeof require != "undefined"){
    var cp = require("./cp");
    var common = require("./common");
    CPManager = cp.CPManager;
    assert = common.assert;

    var cpb = require("./cp.backtrack");
    CPBacktrack = cpb.CPBacktrack;

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


        
    ];

    
    
    for( var i = 0 ; i < tests.length ; i++ ){
        console.log( "----- Test " + i );
        tests[i]();
    }
    
    
}

test();

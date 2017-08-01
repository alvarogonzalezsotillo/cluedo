

if( require ){
    var cp = require("./cp");
    var common = require("./common");
    var cluedo = require("./cluedo");
    CP = cp.CP;
    assert = common.assert;
    Cluedo = cluedo.Cluedo;
    PlayersFact = cluedo.PlayersFact;
    PlayerHasSomeFact = cluedo.PlayerHasSomeFact;
    PlayerDoesntHaveAnyFact = cluedo.PlayerDoesntHaveAnyFact;
    CluedoFlavors = cluedo.CluedoFlavors;
}

var pf = new PlayersFact([2,2,2]);

var c = new Cluedo(CluedoFlavors.test,[pf]);

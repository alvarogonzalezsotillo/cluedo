if (typeof require != "undefined") {
    var common = require("./common");
    var p = require("./porcia");
    var cp = require("./cp");
    log = common.log;
    CPManager = cp.CPManager;
    Cofre = p.Cofre;
    porcia = p.porcia;
}

class Porcia {
    constructor(cofres, restricciones) {
        this._cofres = cofres;
        this._restricciones = restricciones;
    }

    get cofres() {
        return this._cofres;
    }

    get restricciones() {
        return this._restricciones;
    }

    static creaPorcia(numCofres) {

        const CP = new CPManager();
        CP.pushEmptyDomainHandler( () => null );
        const names = [];
        for (let i = 1; i <= numCofres; i++) {
            names.push("cofre " + i);
        }
        const cofres = Cofre.creaCofres(CP, names);

        const indiceAlAzar = (max) => Math.floor(Math.random() * max);

        const indiceAlAzarDistintoDe = function(max,n){
            while(true){
                const r = indiceAlAzar(max);
                if( r != n ){
                    return r;
                }
            }
            
        } 

        const cofreAlAzar = function () {
            const i = indiceAlAzar(numCofres);
            return cofres[i];
        }

        const booleanoAlAzar = () => Math.random() > 0.5;

        const inscripcionAlAzar = function () {
            if (booleanoAlAzar()) {
                return cofreAlAzar().cofreLleno;
            }
            else {
                return CP.Not(cofreAlAzar().cofreLleno);
            }
        }

        cofres.forEach(c => c.inscripciones = [inscripcionAlAzar()]);

        const verdadesAlAzar = function () {
            let min = indiceAlAzar(numCofres);
            let max = indiceAlAzarDistintoDe(numCofres,min);
            if (min > max) {
                [min, max] = [max, min];
            }

            return [CP.SomeTrue(cofres.map(c => c.inscripciones[0]), min, max).
                rename("Hay entre " + min + " y " + max + " cofres que dicen la verdad").
                asTrue()];
        }

        const restricciones = verdadesAlAzar();

        return new Porcia(cofres, restricciones);
    }

    dump(out) {
        const o = out || console.log;
        o("Hay " + this.cofres.length + " cofres");
        this.cofres.forEach(function (c) {
            o("En el " + c.nombre + " dice: ");
            c.inscripciones.forEach(i => o("  " + i.name()))
        });

        o("Además:");
        this.restricciones.forEach(r => o("  " + r.name()));
    }
}

while (true) {
    try {
        console.log(".");
        const po = Porcia.creaPorcia(10);
        const solucion = porcia(po.cofres,true);
        console.log("***************************************");
        po.dump();
        console.log("solución:" + solucion.nombre);
    }
    catch (e) {
        //console.log( "e: " + e );
        //console.log( e.stack );
    }
}

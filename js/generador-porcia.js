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

    static indiceAlAzar(max){
        return Math.floor(Math.random() * max);
    }

    static indiceAlAzarDistintoDe(max,n){
        while(true){
            const r = Porcia.indiceAlAzar(max);
            if( r != n ){
                return r;
            }
        }
        
    }

    static booleanoAlAzar(){
        Math.random() > 0.5;
    }

    static cofreAlAzar(cofres) {
        const i = Porcia.indiceAlAzar(cofres.length);
        return cofres[i];
    }


    static inscripcionSimpleAlAzar(cofres) {
        const cofre = Porcia.cofreAlAzar(cofres);
        if (Porcia.booleanoAlAzar()) {
            return cofre.cofreLleno;
        }
        else {
            const CP = cofre.manager;
            return CP.Not(cofre.cofreLleno);
        }
    }

    static cofresVerdaderosAlAzar(cofres) {
        const numCofres = cofres.length;
        let min = Porcia.indiceAlAzar(numCofres);
        let max = Porcia.indiceAlAzarDistintoDe(numCofres,min);
        if (min > max) {
            [min, max] = [max, min];
        }

        const CP = cofres[0].manager;
        return [CP.SomeTrue(cofres.map(c => c.inscripciones[0]), min, max).
                rename("Hay entre " + min + " y " + max + " cofres que dicen la verdad").
                asTrue()];
    }


    
    static creaPorcia(numCofres) {

        const CP = new CPManager();
        CP.pushEmptyDomainHandler( () => null );
        const names = [];
        for (let i = 1; i <= numCofres; i++) {
            names.push("cofre " + i);
        }
        const cofres = Cofre.creaCofres(CP, names);
        cofres.forEach(c => c.inscripciones = [Porcia.inscripcionSimpleAlAzar(cofres)]);
        const restricciones = Porcia.cofresVerdaderosAlAzar(cofres);
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
    console.log(".");
    const po = Porcia.creaPorcia(3);
    const solucion = porcia(po.cofres,true);
    if( solucion.cofre ){
        console.log("***************************************");
        po.dump(console.log);
        console.log("solución:" + solucion.cofre.nombre);
    }
}

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
            return CP.Not(cofre.cofreLleno).rename( "El cofre " + cofre.nombre + " está vacío");
        }
    }



    static nombreDeCofre(i){
        const nombres = ["Oro","Plata","Plomo","Bronce","Platino","Tugsteno","Cobre","Acero"];
        if( i < nombres.length ){
            return nombres[i];
        }
        else{
            return "cofre " + i;
        }
    }
    
    static cofresVerdaderosAlAzar(cofres) {
        const numCofres = cofres.length;
        let min = Porcia.indiceAlAzar(numCofres+1);
        let max = Porcia.indiceAlAzar(numCofres+1);
        if (min > max) {
            [min, max] = [max, min];
        }

        const CP = cofres[0].manager;
        return [CP.SomeTrue(cofres.map(c => c.inscripciones[0]), min, max).
                rename("Hay entre " + min + " y " + max + " cofres que dicen la verdad").
                asTrue()];
    }


    
    static creaPorciaUnaInscripcion(numCofres) {

        const CP = new CPManager();
        CP.pushEmptyDomainHandler( () => null );
        const names = [];
        for (let i = 0; i < numCofres; i++) {
            names.push( Porcia.nombreDeCofre(i) );
        }
        const cofres = Cofre.creaCofres(CP, names);
        cofres.forEach(c => c.inscripciones = [Porcia.inscripcionSimpleAlAzar(cofres)]);
        const restricciones = Porcia.cofresVerdaderosAlAzar(cofres);
        return new Porcia(cofres, restricciones);
    }

    static inscripcionAutoreferenteAlAzar(cofres) {
        const cofre = Porcia.cofreAlAzar(cofres);
        const CP = cofre.manager;
        const inscripcion = CP.Boolean();

        
        if (Porcia.booleanoAlAzar()) {
            inscripcion.rename( "El cofre " + cofre.nombre + " dice la verdad" );
            CP.Bind( cofre.inscripciones[0], inscripcion );
        }
        else {
            inscripcion.rename( "El cofre " + cofre.nombre + " no dice la verdad" );
            CP.Bind( cofre.inscripciones[0], CP.Not(inscripcion) );
        }

        return inscripcion;
    }

    
    static creaPorciaUnaInscripcionAutoreferente(numCofres) {

        const CP = new CPManager();
        CP.pushEmptyDomainHandler( () => null );
        const names = [];
        for (let i = 0; i < numCofres; i++) {
            names.push( Porcia.nombreDeCofre(i) );
        }
        const cofres = Cofre.creaCofres(CP, names);
        cofres.forEach( c => c.inscripciones = [CP.Boolean()] );
        for( let ix = 0 ; ix < numCofres-1 ; ix++ ){
            const c = cofres[ix];
            const i = Porcia.inscripcionSimpleAlAzar(cofres);
            c.inscripciones[0].rename(i.name());
            CP.Bind( c.inscripciones[0], i );
        }
        const ultimoCofre = cofres[numCofres-1];
        const ultimaInscripcion = Porcia.inscripcionAutoreferenteAlAzar(cofres);
        ultimoCofre.inscripciones[0].rename( ultimaInscripcion.name() );
        CP.Bind( ultimoCofre.inscripciones[0], ultimaInscripcion);

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
    const po = Porcia.creaPorciaUnaInscripcionAutoreferente(3);
    const solucion = porcia(po.cofres,true);
    if( solucion.cofre ){
        console.log("***************************************");
        po.dump(console.log);
        console.log("solución:" + solucion.cofre.nombre);
    }
}


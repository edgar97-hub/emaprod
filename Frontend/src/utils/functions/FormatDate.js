const FormatDateTimeMYSQL = (newDate) => {
    let fecha = newDate.toISOString().split("T", 1)[0];
    let hora = newDate.toLocaleTimeString().split(" ",1)[0];
    return fecha + " " + hora;
}

const FormatDateTimeMYSQLNow = () => {
    let nowDate = new Date();
    let fecha = nowDate.toISOString().split("T", 1)[0];
    let hora = nowDate.toLocaleTimeString().split(" ",1)[0];
    return fecha + " " + hora;
}

const esBisiesto = (year) => {
    const yearValue = parseInt(year, 10);
    return (yearValue % 400 === 0) ? true :
        (yearValue % 100 === 0) ? false :
            yearValue % 4 === 0;
}

const letraAnio = (fecha) => {
    const fechaExtraida = fecha.split(" ", 1)[0].split("-");
    const anio = parseInt(fechaExtraida[0]);
    const mes = parseInt(fechaExtraida[1], 10);
    const dia = parseInt(fechaExtraida[2], 10);

    // DESESTRUCTURAMOS LA FECHA EN SUS CORRESPONDIENTES UNIDADES
    const unidades = (anio % 10);
    let letraAlfabeto = "";
    switch (unidades) {
        case 1: letraAlfabeto = "A"
            break;
        case 2: letraAlfabeto = "B"
            break;
        case 3: letraAlfabeto = "C"
            break;
        case 4: letraAlfabeto = "D"
            break;
        case 5: letraAlfabeto = "E"
            break;
        case 6: letraAlfabeto = "F"
            break;
        case 7: letraAlfabeto = "G"
            break;
        case 8: letraAlfabeto = "H"
            break;
        case 9: letraAlfabeto = "I"
            break;
        case 0: letraAlfabeto = "J"
            break;
    }
    return letraAlfabeto;
}

const DiaJuliano = (fecha) => {
    const fechaExtraida = fecha.split(" ", 1)[0].split("-");
    const anio = fechaExtraida[0];
    const mes = parseInt(fechaExtraida[1], 10);
    const dia = parseInt(fechaExtraida[2], 10);

    // Comprobamos si es año bisiesto
    let feb = 28;
    if (esBisiesto(anio)) {
        feb = 29;
    }

    const meses = [31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let diaJuliano = 0;
    for (let i = 1; i <= mes; i++) {
        if (i === mes) {
            diaJuliano += dia;
        }
        else {
            diaJuliano += meses[i - 1];
        }
    }

    const diaJulianoToString = diaJuliano.toString();

    return (
        (diaJulianoToString.length === 1)
            ? `00${diaJulianoToString}`
            : (diaJulianoToString.length === 2)
                ? `0${diaJulianoToString}`
                : `${diaJulianoToString}`);

}

export { FormatDateTimeMYSQL, FormatDateTimeMYSQLNow, DiaJuliano, letraAnio };
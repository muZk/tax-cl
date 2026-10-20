// Valor UTA en diciembre en https://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html
const UTA = {
  2018: 580236,
  2019: 595476,
  2020: 612348,
  2021: 650052,
  2022: 733884,
  2023: 770592,
  2024: 807528,
  2025: 834504,
  2026: 869280, // 2026-11 (provisorio, falta diciembre)
};

// Valor UF al 31 de diciembre en https://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html
const UF = {
  2018: 27565.79,
  2019: 28309.94,
  2020: 29070.33,
  2021: 30991.74,
  2022: 35110.98,
  2023: 36789.36,
  2024: 38416.69,
  2025: 39727.96,
  2026: 41295.46, // 2026-11-09 (provisorio, falta 31 de diciembre)
};

const RETENCION = {
  2019: 10,
  2020: 10.75,
  2021: 11.5,
  2022: 12.25,
  2023: 13,
  2024: 13.75,
  2025: 14.5,
  2026: 15.25,
  2027: 16,
  2028: 17,
};

// Artículo Segundo de la Ley 21.133 (https://www.bcn.cl/leychile/navegar?idNorma=1128420)
const COBERTURA_PARCIAL = {
  2018: 5,
  2019: 17,
  2020: 27,
  2021: 37,
  2022: 47,
  2023: 57,
  2024: 70,
  2025: 80,
  2026: 90,
  2027: 100,
  2028: 100,
};

const TOPE_IMPONIBLE_MENSUAL = {
  2018: 78.3, // https://www.spensiones.cl/portal/institucional/594/w3-article-12946.html
  2019: 79.2, // https://www.spensiones.cl/portal/institucional/594/w3-article-13553.html
  2020: 80.2, // https://www.spensiones.cl/portal/institucional/594/w3-article-13843.html
  2021: 81.6, // https://www.spensiones.cl/portal/institucional/594/w3-article-14366.html
  2022: 81.6, // https://www.spensiones.cl/portal/institucional/594/w3-article-15178.html
  2023: 81.6, // https://www.spensiones.cl/portal/institucional/594/w3-article-15486.html
  2024: 84.3, // https://www.spensiones.cl/portal/institucional/594/w3-article-15855.html
  2025: 87.8, // https://www.spensiones.cl/portal/institucional/594/w3-article-16252.html
  2026: 90, // https://www.spensiones.cl/portal/institucional/594/w3-article-16921.html
};

// Tasa del seguro de invalidez y sobrevivencia (SIS) por año comercial.
// Esto cambia por año, no tengo seguridad de los años anteriores al 2022
// https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9917.html#recuadros_articulo_4130_0
const SIS = {
  2018: 1.99,
  2019: 1.99,
  2020: 1.99,
  2021: 1.85,
  2022: 1.54,
  2023: 1.47,
  2024: 1.49,
  2025: 1.49,
  // 2026: vigente desde agosto 2026 (SP y Previred). Provisorio: la SP aún no publica la tasa del AT 2027,
  // y la renta usa la vigente a diciembre (https://previsionsocial.gob.cl/wp-content/uploads/2026/01/20251218-Documento-Independientes-CCP-VF.pdf)
  // https://www.previred.com/indicadores-previsionales/
  2026: 1.78,
};

// 10% + comisión de la AFP más barata (Uno: 0,49% hasta sep 2025, 0,46% desde oct 2025)
// https://www.previred.com/indicadores-previsionales/
function obtenerTasaAfp(commercialYear) {
  return commercialYear >= 2026 ? 10.46 : 10.49;
}

/**
 * Calculates and returns tax brackets based on the provided UTA value.
 *
 * @param {Number} uta - The UTA value for which tax brackets are to be calculated.
 * @returns {Array.<{factor: Number, montoMaximo: Number, descuento: Number}>}
 * An array of objects, each containing:
 *  - `factor`: The tax rate for the bracket.
 *  - `montoMaximo`: The maximum amount for the bracket.
 *  - `descuento`: The discount for the bracket.
 * 
 * @example
 * const tramos = obtenerTramosImpositivos(1.5);
 * console.log(tramos); // Output will be an array of tax bracket objects.
 */
function obtenerTramosImpositivos(uta) {
  const maxValue = Number.MAX_VALUE;
  return [
    [13.5 * uta,     0,           0],
    [  30 * uta,  0.04,  0.54 * uta],
    [  50 * uta,  0.08,  1.74 * uta],
    [  70 * uta, 0.135,  4.49 * uta],
    [  90 * uta,  0.23, 11.14 * uta],
    [ 120 * uta, 0.304,  17.8 * uta],
    [ 310 * uta,  0.35, 23.32 * uta],
    [  maxValue,   0.4, 38.82 * uta],
  ].map(([montoMaximo, factor, descuento]) => ({
    factor,
    montoMaximo,
    descuento,
  }));
}

/**
 * Retrieves the configuration for a given "operacionRenta" year.
 *
 * @param {Number} operacionRenta - The year for which the operation configuration is required.
 * @param {Object} [options] - Optional configuration overrides.
 * @param {Number} [options.uf] - Custom UF value to use instead of the default for the year.
 * @param {Number} [options.uta] - Custom UTA value (also used for the tax brackets).
 * @param {Number} [options.sis] - Custom SIS rate, in percent (e.g. 1.78).
 * @param {Number} [options.afp] - Custom AFP rate including the commission, in percent (e.g. 10.46).
 * @throws {Error} Throws an error if the given year is not available.
  * @returns {{
  *  OPERACION_RENTA: Number,
  *  UTA: Number,
  *  UF: Number,
  *  RETENCION: Number,
  *  COBERTURA_PARCIAL: Number,
  *   TOPE_IMPONIBLE_MENSUAL: Number,
  *   SIS: Number,
  *   AFP: Number,
  *   TRAMOS_IMPOSITIVOS: Array.<{factor: number, montoMaximo: number, descuento: number}>
  * }}
  * An object containing various configuration values:
  * - `OPERACION_RENTA`: The year for which the configuration is valid.
  * - `UTA`: The UTA value for the given year (December), or custom value if provided.
  * - `UF`: The UF value for the given year (last day of December), or custom value if provided.
  * - `RETENCION`: The retention percentage for the given year.
  * - `COBERTURA_PARCIAL`: The partial coverage percentage for the given year.
  * - `TOPE_IMPONIBLE_MENSUAL`: The monthly taxable income cap for the given year.
  * - `SIS`: The SIS rate (percent) for the given year, or custom value if provided.
  * - `AFP`: The AFP rate (percent, including commission) for the given year, or custom value if provided.
  * - `TRAMOS_IMPOSITIVOS`: An array of objects, each containing:
  *   - `factor`: The tax rate for the bracket.
  *   - `montoMaximo`: The maximum amount for the bracket.
  *   - `descuento`: The discount for the bracket.
  *
  * @example
  * const config = getConfig(2022);
  * console.log(config.OPERACION_RENTA); // 2022
  *
  * @example
  * // With custom UF value
  * const config = getConfig(2025, { uf: 40000 });
  * console.log(config.UF); // 40000
  *
  * @example
  * // With provisional values before December is published
  * const config = getConfig(2027, { uta: 870000, sis: 1.78 });
*/
export function getConfig(operacionRenta, options = {}) {
  const commercialYear = operacionRenta - 1;

  if (!TOPE_IMPONIBLE_MENSUAL[commercialYear]) {
    const validos = Object.keys(TOPE_IMPONIBLE_MENSUAL).map(year => parseInt(year) + 1).join(', ');
    throw new Error(`El año ingresado es incorrecto. Los valores válidos son: ${validos}`);
  }

  const ufValue = options.uf !== undefined ? options.uf : UF[commercialYear];
  const utaValue = options.uta !== undefined ? options.uta : UTA[commercialYear];
  const sisValue = options.sis !== undefined ? options.sis : SIS[commercialYear] || SIS[2023];
  const afpValue = options.afp !== undefined ? options.afp : obtenerTasaAfp(commercialYear);

  return {
    OPERACION_RENTA: operacionRenta,
    UTA: utaValue,
    UF: ufValue,
    RETENCION: RETENCION[commercialYear] / 100,
    COBERTURA_PARCIAL: COBERTURA_PARCIAL[commercialYear] / 100,
    TOPE_IMPONIBLE_MENSUAL: TOPE_IMPONIBLE_MENSUAL[commercialYear],
    SIS: sisValue,
    AFP: afpValue,
    TRAMOS_IMPOSITIVOS: obtenerTramosImpositivos(utaValue),
  };
}

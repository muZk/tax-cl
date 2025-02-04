// Valor UTA en diciembre en https://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html
const UTA = {
  2018: 580236,
  2019: 595476,
  2020: 612348,
  2021: 650052,
  2022: 733884,
  2023: 770592,
  2024: 807528,
  2025: 807528, // 2025-01
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
  2025: 38384.41, // 2025-01-31
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
};

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
 * @throws {Error} Throws an error if the given year is not available.
  * @returns {{
  *  OPERACION_RENTA: Number,
  *  UTA: Number,
  *  UF: Number,
  *  RETENCION: Number,
  *  COBERTURA_PARCIAL: Number,
  *   TOPE_IMPONIBLE_MENSUAL: Number,
  *   TRAMOS_IMPOSITIVOS: Array.<{factor: number, montoMaximo: number, descuento: number}>
  * }}
  * An object containing various configuration values:
  * - `OPERACION_RENTA`: The year for which the configuration is valid.
  * - `UTA`: The UTA value for the given year (December).
  * - `UF`: The UF value for the given year (last day of December).
  * - `RETENCION`: The retention percentage for the given year.
  * - `COBERTURA_PARCIAL`: The partial coverage percentage for the given year.
  * - `TOPE_IMPONIBLE_MENSUAL`: The monthly taxable income cap for the given year.
  * - `TRAMOS_IMPOSITIVOS`: An array of objects, each containing:
  *   - `factor`: The tax rate for the bracket.
  *   - `montoMaximo`: The maximum amount for the bracket.
  *   - `descuento`: The discount for the bracket.
  * 
  * @example
  * const config = getConfig(2022);
  * console.log(config.OPERACION_RENTA); // 2022
*/
export function getConfig(operacionRenta) {
  const commercialYear = operacionRenta - 1;

  if (!TOPE_IMPONIBLE_MENSUAL[commercialYear]) {
    const validos = Object.keys(TOPE_IMPONIBLE_MENSUAL).map(year => parseInt(year) + 1).join(', ');
    throw new Error(`El año ingresado es incorrecto. Los valores válidos son: ${validos}`);
  }

  return {
    OPERACION_RENTA: operacionRenta,
    UTA: UTA[commercialYear],
    UF: UF[commercialYear],
    RETENCION: RETENCION[commercialYear] / 100,
    COBERTURA_PARCIAL: COBERTURA_PARCIAL[commercialYear] / 100,
    TOPE_IMPONIBLE_MENSUAL: TOPE_IMPONIBLE_MENSUAL[commercialYear],
    TRAMOS_IMPOSITIVOS: obtenerTramosImpositivos(UTA[commercialYear]),
  };
}

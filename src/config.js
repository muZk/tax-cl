// Valor UTA en diciembre en https://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html
const UTA = {
  2018: 580236,
  2019: 595476,
  2020: 612348,
  2021: 650052,
  2022: 733884,
  2023: 741228, // 2023-01
};

// Valor UF al 31 de diciembre en https://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html
const UF = {
  2018: 27565.79,
  2019: 28309.94,
  2020: 29070.33,
  2021: 30991.74,
  2022: 35110.98,
  2023: 35287.50, // 2023-01-31
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
};

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

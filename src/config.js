// Valor UTA en diciembre en https://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html
const UTA = {
  2018: 580236,
  2019: 595476,
  2020: 612348,
  2021: 650052,
  2022: 653304, // 2021-01-04
};

// Valor UF al 31 de diciembre en https://www.sii.cl/valores_y_fechas/index_valores_y_fechas.html
const UF = {
  2018: 27565.79,
  2019: 28309.94,
  2020: 29070.33,
  2021: 30991.74,
  2022: 31036.65, // 2021-01-09
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
  2022: 81.6, // Not published yet!
};

function obtenerTramosImpositivos(uta) {
  const construirTramoImpositivo = (factor, montoMaximo, descuento) => ({
    factor,
    montoMaximo,
    descuento,
  });

  return [
    construirTramoImpositivo(0, 13.5 * uta, 0),
    construirTramoImpositivo(0.04, 30 * uta, 0.54 * uta),
    construirTramoImpositivo(0.08, 50 * uta, 1.74 * uta),
    construirTramoImpositivo(0.135, 70 * uta, 4.49 * uta),
    construirTramoImpositivo(0.23, 90 * uta, 11.14 * uta),
    construirTramoImpositivo(0.304, 120 * uta, 17.8 * uta),
    construirTramoImpositivo(0.35, 150 * uta, 23.92 * uta),
    construirTramoImpositivo(0.4, Number.MAX_VALUE, 30.67 * uta),
  ];
}

export function getConfig(operacionRenta) {
  const year = operacionRenta - 1;

  if (!TOPE_IMPONIBLE_MENSUAL[year]) {
    const validos = Object.keys(TOPE_IMPONIBLE_MENSUAL).join(', ');
    throw new Error(`El año ingresado es incorrecto. Los valores válidos son: ${validos}`);
  }

  return {
    OPERACION_RENTA: operacionRenta,
    UTA: UTA[year],
    UF: UF[year],
    RETENCION: RETENCION[year] / 100,
    COBERTURA_PARCIAL: COBERTURA_PARCIAL[year] / 100,
    TOPE_IMPONIBLE_MENSUAL: TOPE_IMPONIBLE_MENSUAL[year],
    TRAMOS_IMPOSITIVOS: obtenerTramosImpositivos(UTA[year]),
  };
}

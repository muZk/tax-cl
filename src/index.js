import { getConfig } from './config';

const OPERACION_RENTA_ACTUAL = 2025;

const config = getConfig(OPERACION_RENTA_ACTUAL);

/**
 * Configura el año de la operación renta para los cálculos.
 * @param year {Number}, año de la operación renta
 */
export function configurarDeclaracion(year) {
  const newConfig = getConfig(year);
  Object.keys(newConfig).forEach(key => {
    config[key] = newConfig[key];
  });
}

export function obtenerConfiguracion() {
  return { ...config };
}

function min(a, b) {
  return a > b ? b : a;
}

export function calcularGastos(rentaAnual) {
  const gastos = rentaAnual * 0.3;
  const tope = 15 * config.UTA;
  return min(gastos, tope);
}

const COTIZACIONES_OBLIGATORIAS = [
  {
    name: "Seguro de invalidez y sobrevivencia (SIS)",
    percent: () => {
      // Esto cambia por año, no tengo seguridad de los años anteriores al 2022
      // Aunque el uso de esta librería es más actual que histórico (importa año comercial presente y anterior)
      // No me gusta que esto esté aquí, sin embargo, como hotfix está OK
      // https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9917.html#recuadros_articulo_4130_0
      const SIS = {
        2018: 1.99,
        2019: 1.99,
        2020: 1.99,
        2021: 1.85,
        2022: 1.54,
        2023: 1.47,
        2024: 1.49,
        2025: 1.5,
      };
      return SIS[config.OPERACION_RENTA - 1] || SIS[2023];
    },
    variable: false,
  },
  {
    name:
      "Seguro de la ley de accidentes del trabajo y enfermedades profesionales (ATEP)",
    percent: 0.90,
    variable: false,
  },
  {
    name: "Seguro de acompañamiento niños y niñas (Ley SANNA)",
    percent: 0.03, // https://www.chileatiende.gob.cl/fichas/53276-seguro-para-el-acompanamiento-de-ninos-y-ninas-afectados-por-una-condicion-grave-de-salud-ley-sanna
    variable: false,
  },
  {
    name: "Salud",
    percent: 7,
    variable: true,
  },
  {
    name: "AFP",
    percent: 10.49,
    variable: true,
  },
];

function getContributionPercentage(contribution) {
  return typeof contribution.percent === 'function' ? contribution.percent() : contribution.percent
}

export function calcularSueldoImponible(sueldoAnual) {
  const topeAnual = config.TOPE_IMPONIBLE_MENSUAL * config.UF * 12;
  return min(0.8 * sueldoAnual, topeAnual);
}

export function simularCotizaciones(ingresos, cotizacionParcial = false) {
  const sueldoImponible = calcularSueldoImponible(ingresos)

  if (cotizacionParcial) {
    const sueldoImponibleParcial = sueldoImponible * config.COBERTURA_PARCIAL

    return COTIZACIONES_OBLIGATORIAS.map(cotizacion => {
      const monto = (cotizacion.variable ? sueldoImponibleParcial : sueldoImponible) * getContributionPercentage(cotizacion) / 100
      return {
        name: cotizacion.name,
        percent: 100 * monto / sueldoImponible,
        value: monto,
      }
    })
  } else {
    let remanente = calcularRetencion(sueldoImponible / 0.8)
    return COTIZACIONES_OBLIGATORIAS.map(cotizacion => {
      if (cotizacion.name === 'AFP') {
        const monto = min(remanente, sueldoImponible * getContributionPercentage(cotizacion) / 100)
        return {
          name: cotizacion.name,
          percent: 100 * monto / sueldoImponible,
          value: monto,
        }
      } else {
        const percent = getContributionPercentage(cotizacion)
        const monto = sueldoImponible * percent / 100
        remanente -= monto
        return {
          name: cotizacion.name,
          percent,
          value: monto,
        }
      }
    })
  }
}

export function calcularCotizacionesObligatorias(ingresos, cotizacionParcial = false) {
  return simularCotizaciones(ingresos, cotizacionParcial).reduce((total, cotizacion) => {
    return total + cotizacion.value;
  }, 0)
}

export function calcularRetencion(sueldoAnual) {
  return sueldoAnual * config.RETENCION;
}

export function buscarTramoImpositivo(sueldoTributable) {
  return config.TRAMOS_IMPOSITIVOS.find(({ montoMaximo }) => sueldoTributable <= montoMaximo);
}

export function calcularImpuestos(sueldoTributable) {
  const { factor, descuento } = buscarTramoImpositivo(sueldoTributable);
  return factor * sueldoTributable - descuento;
}

export function calcularDeuda(montoCotizacionesObligatorias, impuestos, retencion) {
  return impuestos - retencion + montoCotizacionesObligatorias;
}

export function calcular(sueldoMensual) {
  const sueldoAnual = 12 * sueldoMensual;
  const gastos = calcularGastos(sueldoAnual);
  const sueldoTributable = sueldoAnual - gastos;
  const montoCotizacionesObligatorias = calcularCotizacionesObligatorias(sueldoAnual);
  const montoCotizacionParcial = calcularCotizacionesObligatorias(sueldoAnual, true);
  const retencion = calcularRetencion(sueldoAnual);
  const impuestos = calcularImpuestos(sueldoTributable);
  const deuda = calcularDeuda(montoCotizacionesObligatorias, impuestos, retencion);
  const deudaModalidadParcial = calcularDeuda(montoCotizacionParcial, impuestos, retencion);
  return {
    operacionRenta: config.OPERACION_RENTA,
    sueldoAnual,
    gastos,
    sueldoTributable,
    montoCotizacionesObligatorias,
    montoCotizacionParcial,
    cotizaciones: {
      parcial: simularCotizaciones(sueldoAnual, true),
      total: simularCotizaciones(sueldoAnual),
    },
    retencion,
    impuestos,
    deuda,
    deudaModalidadParcial,
  };
}

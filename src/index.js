import { getConfig } from './config';

const OPERACION_RENTA_ACTUAL = 2023;

const config = getConfig(OPERACION_RENTA_ACTUAL);

/**
 * Configura el año de la operación renta para los cálculos.
 * @param {Number} year, año de la operación renta
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

export function calcularGastos(sueldoAnual) {
  const gastos = sueldoAnual * 0.3;
  const tope = 15 * config.UTA;
  return min(gastos, tope);
}

export const COTIZACIONES_OBLIGATORIAS = [
  { 
    name: "Seguro de invalidez y sobrevivencia (SIS)", 
    percent: 1.54, // https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9917.html#recuadros_articulo_4130_0
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
    percent: 10, 
    variable: true,
  },
  { 
    name: "Comisión AFP", 
    percent: 0.58, // AFP Modelo https://www.spensiones.cl/apps/estcom/estcom.php
    variable: false
  },
];

export function calcularSueldoImponible(sueldoAnual) {
  const topeAnual = config.TOPE_IMPONIBLE_MENSUAL * config.UF * 12;
  return min(0.8 * sueldoAnual, topeAnual);
}

export function calcularCotizacionesObligatorias(ingresos, cotizacionParcial = false){
  let totalCotizacionesObligatorias = 0;

  COTIZACIONES_OBLIGATORIAS.forEach((cotizacion) => {
    let montoCotizacion = (calcularSueldoImponible(ingresos) * cotizacion.percent) / 100;
    if(cotizacion.variable && cotizacionParcial){
      montoCotizacion = montoCotizacion * config.COBERTURA_PARCIAL;
    }
    totalCotizacionesObligatorias += montoCotizacion;
  });

  return totalCotizacionesObligatorias;
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
  const cotizacionesParciales = calcularCotizacionesObligatorias(sueldoAnual, true);
  const retencion = calcularRetencion(sueldoAnual);
  const impuestos = calcularImpuestos(sueldoTributable);
  const deuda = calcularDeuda(montoCotizacionesObligatorias, impuestos, retencion);
  const deudaModalidadParcial = calcularDeuda(cotizacionesParciales, impuestos, retencion);
  return {
    operacionRenta: config.OPERACION_RENTA,
    sueldoAnual,
    gastos,
    sueldoTributable,
    montoCotizacionesObligatorias,
    retencion,
    impuestos,
    deuda,
    deudaModalidadParcial,
  };
}

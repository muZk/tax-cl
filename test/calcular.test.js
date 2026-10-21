import { test } from 'node:test';
import assert from 'node:assert/strict';
import taxCl, { configurarDeclaracion, obtenerConfiguracion, calcular } from '../src/index.js';

// Bruto mensual de la tabla AT 2026 publicada en https://trabajoremoto.cl/herramientas/sueldos
const BRUTO_MENSUAL = 4746508;

test('AT 2026 reproduce la tabla publicada', () => {
  configurarDeclaracion(2026);
  const resultado = calcular(BRUTO_MENSUAL);
  assert.equal(Math.round(resultado.impuestos / 12), 187712);
  assert.equal(Math.round(resultado.montoCotizacionesObligatorias / 12), 632221);
});

test('el año por defecto es la operación renta 2026', async () => {
  // Módulo nuevo para no heredar el estado de los otros tests
  const { obtenerConfiguracion: obtenerConfiguracionInicial } = await import('../src/index.js?default');
  assert.equal(obtenerConfiguracionInicial().OPERACION_RENTA, 2026);
});

test('configurarDeclaracion acepta overrides de uta, sis y afp', () => {
  configurarDeclaracion(2027, { uta: 870000, sis: 1.5, afp: 10.49 });
  const config = obtenerConfiguracion();
  assert.equal(config.UTA, 870000);
  assert.equal(config.SIS, 1.5);
  assert.equal(config.AFP, 10.49);
  // Los tramos se calculan con la UTA sobreescrita
  assert.equal(config.TRAMOS_IMPOSITIVOS[0].montoMaximo, 13.5 * 870000);

  const sis = calcular(BRUTO_MENSUAL).cotizaciones.total[0];
  assert.equal(sis.percent, 1.5);
});

test('los overrides no quedan pegados al reconfigurar', () => {
  configurarDeclaracion(2027, { uta: 1, sis: 1, afp: 1 });
  configurarDeclaracion(2027);
  const config = obtenerConfiguracion();
  assert.equal(config.UTA, 869280);
  assert.equal(config.SIS, 1.78);
  assert.equal(config.AFP, 10.46);
});

test('el export default expone la misma API', () => {
  assert.equal(taxCl.calcular, calcular);
  assert.equal(taxCl.configurarDeclaracion, configurarDeclaracion);
});

test('un año fuera de rango lanza error', () => {
  assert.throws(() => configurarDeclaracion(2030), /El año ingresado es incorrecto/);
});

# tax-cl

Librería cálculo de impuestos y cotizaciones en Chile 🇨🇱 

## Getting Started

> Si tienes duda con el cálculo y supuestos, puedes ver el README de https://github.com/muZk/impuestos, donde tiene todo lo necesario para entender bien los cálculos.

### Installation

```console
npm install tax-cl --save
```

o

```console
yarn add tax-cl
```

:warning: Debido a que los conceptos de impuestos y contribuciones ya son complicados en español, gran parte del código está en español.

### Basic Usage

El método que calcula cuánto debes pagar (o cuánto recibirás en la devolución) se llama `calcular`:

```javascript
const { calcular } = require('tax-cl'); 

const resultado = calcular(1400000); // sueldo bruto = 1.400.000 mensual

if (resultado.deuda >= 0) {
  console.log(`Tendrás que pagar al SII ${resultado.deuda}`);
} else {
 console.log(`Recibirás una devolución de ${-resultado.deuda}`);
}

if (resultado.deudaModalidadParcial >= 0) {
  console.log(`En modalidad parcial, tendrás que pagar al SII ${resultado.deudaModalidadParcial}`);
} else {
 console.log(`En modalidad parcial, recibirás una devolución de ${-resultado.deudaModalidadParcial}`);
}

```

`calcular` entrega un objeto que tiene propiedades que indican algunas cosas del cálculo, como por ejemplo el monto a pagar de cotizaciones. La propiedad `deuda` indica cuanto tendrás que pagar en total al SII por cotizaciones e impuestos:

- Si `deuda > 0`, le debes dinero al SII.
- Si `deuda < 0`, el SII te devolverá dinero.

A continuación un ejemplo de los otros atributos del resultado:

```javascript
console.log(`Tu sueldo BRUTO anual es ${resultado.sueldoAnual}`);
console.log(`Tus gastos supuestos son ${resultado.gastos}`);
console.log(`Tu sueldo tributable es ${resultado.sueldoTributable}`);
console.log(`Lo que tendrás que pagar por impuestos es ${resultado.impuestos}`);
console.log(`Lo que tendrás que pagar por cotizaciones es igual a ${resultado.montoCotizacionesObligatorias}`);
console.log(`La retención de tus boletas anual es ${retencion}`);
```

## Advanced Usage

TODO.

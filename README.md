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

### `calcular(number: sueldoBrutoMensual)`

Retorna un objeto con el detalle de los datos utilizados para realizar el cálculo del pago de impuestos y cotizaciones.

#### Arguments

Recibe los siguientes argumentos:

* `sueldoBrutoMensual`: *(number)*. Es el total de tus ingresos mensuales.

#### Returns

Retorna un objeto con las siguientes propiedades:

* `sueldoAnual`: *(number)*. Es el sueldo bruto recibido en un año.
* `gastos`: *(number)*. Gastos supuestos, equivalen a un 30% de tu ingreso bruto, hasta un máximo de 15UTA.
* `sueldoTributable`: *(number)*. Es el monto sobre el cual se calculan los impuestos a pagar. Corresponde al sueldo anual menos los gastos supuestos.
* `montoCotizacionesObligatorias`: *(number)*. Es el monto total de las cotizaciones obligatorias que debes pagar. Esto incluye el seguro de invalidez y sobrevivencia, el seguro de la ley de accidentes del trabajo y enfermedades profesionales, el seguro de acompañamiento de niños y niñas, la previsión de salud y la AFP.
* `retencion`: *(number)*. Es el monto total de las retenciones pagadas al Servicio de Impuestos Internos durante un año. Este monto aumenta año a año hasta llegar al 17%.
* `impuestos`: *(number)*. Es el total de impuestos a pagar según el tramo impositivo.
* `deuda`: *(number)*. Es la deuda final, si su valor es positivo indica el valor que debes pagar al Servicio de Impuestos Internos, si es negativo es el valor que recibirás como devolución. 
* `deudaModalidadParcial`: *(number)*. Es la deuda final, pero considerando que has optado por pagar las cotizaciones en modalidad parcial.
* `operacionRenta`: *(number)*. Es el año de la declaración (**2023** por defecto).

### `configurarDeclaracion(number: year) : void`

Configura el año de la operación renta sobre la cual aplican los cálculos. Por defecto, el año de la declaración es **2023**.

#### Arguments

Recibe el siguiente argumento:

* `year`: *(number)*, año de la operación renta para la realización de los cálculos. Los valores válidos son: `2018`, `2019`, `2020`, `2021`, `2022` y `2023`.

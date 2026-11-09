// Helper puro de exportación CSV (spec 005-exportacion-vacas).
// No importa nada de la aplicación: recibe filas ya armadas por la pantalla.

// Indicadores de fórmula de hoja de cálculo: el valor que los comienza
// (incluso con espacios antes) se neutraliza con apóstrofo.
const INDICADORES_FORMULA = new Set(['=', '+', '-', '@', '\t', '\r', '\n'])

// Un campo es "fórmula" si su primer carácter no espacio es un indicador.
// Tabulación y retorno en primera posición también cuentan como indicador.
function esFormula(campo: string): boolean {
  let i = 0
  while (i < campo.length && campo[i] === ' ') i++
  return i < campo.length && INDICADORES_FORMULA.has(campo[i])
}

// Los valores no textuales también conservan su columna: 0 → '0', null/undefined → ''.
function campoAString(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  return String(valor)
}

export function serializeCsv(rows: readonly (readonly unknown[])[]): string {
  const lineas = rows.map(fila =>
    fila.map(valor => {
      const campo = campoAString(valor)
      const neutralizado = esFormula(campo) ? "'" + campo : campo
      return '"' + neutralizado.replace(/"/g, '""') + '"'
    }).join(','))
  // UTF-8 con BOM al inicio; filas separadas por CRLF sin salto final.
  return '\uFEFF' + lineas.join('\r\n')
}

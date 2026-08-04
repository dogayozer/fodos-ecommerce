export function toTitleCase(str: string) {
  if (!str) return str
  return str.toLocaleLowerCase('tr-TR').split(' ').map(word => {
    return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1)
  }).join(' ')
}

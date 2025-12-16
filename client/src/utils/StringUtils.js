export function capitalizeWordsExceptFirst(sentence) {
  if (!sentence)
    return "";
  
  return sentence
    .split(' ')
    .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function camelCaseToTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1') // Insert space before each capital letter
    .replace(/^./, (char) => char.toUpperCase()) // Capitalize the first character
    .trim(); // Remove any leading or trailing spaces
}

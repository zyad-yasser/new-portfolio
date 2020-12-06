export const capetalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

export const projectDirection = (index): string => index % 2 === 0 ? 'left' : 'right'; 
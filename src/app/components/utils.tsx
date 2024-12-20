
const countriaze = (country: string): string => {
  const inner = (c: string): string => {
    return c
      .replace(' ', '_')
      .replace('/', '_')
      .replace('(', '')
      .replace(')', '')
      .replace(',', '')
      .replace('.', '')
      .replace("'", '')
      .replace('"', '')
      .replace('?', '')
      .replace('!', '')
      .replace(':', '')
      .replace(';', '')
      .replace('-', '_')
      .replace('&', 'and')
      .replace('___', '_')
      .replace('__', '_')
      .toLowerCase()
      .trim();
  };

  var last = '';
  var current = inner(country);
  while (last !== current) {
    last = current;
    current = inner(current);
  }

  return current;
};

export default countriaze;
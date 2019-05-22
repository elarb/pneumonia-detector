// Adopted from https://gist.github.com/kaizhu256/4482069
export const uuid4 = () => {
  let uuid = '', ii;
  for (ii = 0; ii < 32; ii += 1) {
    switch (ii) {
      case 8:
      case 20:
        uuid += '-';
        uuid += (Math.random() * 16 | 0).toString(16);
        break;
      case 12:
        uuid += '-';
        uuid += '4';
        break;
      case 16:
        uuid += '-';
        uuid += (Math.random() * 4 | 8).toString(16);
        break;
      default:
        uuid += (Math.random() * 16 | 0).toString(16);
    }
  }
  return uuid;
};

export const tsToDate = (timestamp) => {
  timestamp -= (new Date().getTimezoneOffset() * 60000);
  return new Date(timestamp).toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

export const toTitleCase = (str) => {
  return str.toLowerCase().replace(/(^\w|\s+\w)/g, str => str.toUpperCase());
};

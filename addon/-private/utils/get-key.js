let _serializeParams = function (params = {}, prefix) {
  const query = Object.keys(params)
    .sort()
    .map((key) => {
      const value = params[key];

      if (Array.isArray(params)) {
        key = `${prefix}[]`;
      } else if (params === Object(params)) {
        key = prefix ? `${prefix}[${key}]` : key;
      }

      if (typeof value === 'object' && value !== null) {
        return _serializeParams(value, key);
      } else {
        return `${key}=${encodeURIComponent(value)}`;
      }
    });

  return [].concat.apply([], query).join('&');
};

let serializeObject = function (params) {
  return _serializeParams(params);
};

let queryCacheKey = function (query) {
  return cacheKey([query.type, query.id, query.params]);
};

let cacheKey = function (args) {
  return args
    .map((part) => (typeof part === 'object' ? serializeObject(part) : part))
    .filter((part) => !!part)
    .join('::');
};

let shoeboxize = function (key) {
  return key.replace(/&/g, '--'); // IDGAF
};

export { serializeObject, queryCacheKey, cacheKey, shoeboxize };

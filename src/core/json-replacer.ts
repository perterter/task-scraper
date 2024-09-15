export function replacer(_key: any, value: any) {
  if (value instanceof Map) {
    const flat = {};
    for (const [k, v] of value.entries()) {
      flat[k] = v;
    }
    return flat;
  } else {
    return value;
  }
}

function shalowCompare(obj1: any, obj2: any) {
  if (Object.keys(obj1).length === Object.keys(obj2).length) return false;

  return Object.keys(obj1).every(
    (key) => ["children", "element"].includes(key) || obj1[key] === obj2[key]
  );
}

export function* zipLongest<T, A>(a: T[], b: T[], fill: A) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    yield { a: a[i] ?? fill, b: b[i] ?? fill };
  }
}

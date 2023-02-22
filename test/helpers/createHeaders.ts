export const createHeaders = (headersObject: Record<string, string>): Headers => {
  const headers: Partial<Headers> = headersObject;
  headers.get = (key: string) => headersObject[key] || null;
  headers.getAll = () => Object.entries(headers).map(([key, value]) => `${key}: ${value}`);
  headers.has = (name: string): boolean => !!headersObject[name];
  headers.set = (name: string, value: string): void => {
    headersObject[name] = value;
  };
  headers.append = (name: string, value: string): void => {
    headersObject[name] += value;
  };
  headers.delete = (name: string): void => {
    delete headersObject[name];
  };
  headers.forEach = (callback: (value: string, key: string, parent: Headers) => void, thisArg?: any): void => {
    Object.entries(headers).forEach(([key, value]) => callback(value as unknown as string, key, headers as Headers));
  };
  headers.entries = (): IterableIterator<[key: string, value: string]> =>
    Object.entries(headers) as unknown as IterableIterator<[key: string, value: string]>;
  headers.keys = (): IterableIterator<string> => Object.keys(headers) as unknown as IterableIterator<string>;
  headers.values = (): IterableIterator<string> => Object.values(headers) as unknown as IterableIterator<string>;
  headers[Symbol.iterator] = (): IterableIterator<[key: string, value: string]> =>
    Object.entries(headers) as unknown as IterableIterator<[key: string, value: string]>;
  return headers as Headers;
};

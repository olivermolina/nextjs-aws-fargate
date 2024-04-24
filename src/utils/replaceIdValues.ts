import { newObjectId } from './new-object-id';

export function replaceIdValues(array: any[]): any[] {
  return array.map(obj => {
    if (typeof obj === 'object' && obj !== null) {
      const newObj: { [key: string]: any } = {};
      for (let key in obj) {
        if (key === 'id') {
          newObj[key] = newObjectId();
        } else if (Array.isArray(obj[key])) {
          newObj[key] = replaceIdValues(obj[key]);
        } else if (typeof obj[key] === 'object') {
          newObj[key] = replaceIdValues([obj[key]])[0];
        } else {
          newObj[key] = obj[key];
        }
      }
      return newObj;
    } else {
      return obj;
    }
  });
}

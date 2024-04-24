export function bas6e4toBlob(base64Data: string, contentType: string, sliceSize?: number) {
  const finalSliceSize = sliceSize || 512;

  let byteCharacters = atob(base64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += finalSliceSize) {
    let slice = byteCharacters.slice(offset, offset + finalSliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

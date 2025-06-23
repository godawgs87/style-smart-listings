
export const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
  const promises = files.map(file => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  });
  return Promise.all(promises);
};

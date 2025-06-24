
export const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
  console.log('=== CONVERTING FILES TO BASE64 ===');
  console.log('Number of files to convert:', files.length);
  
  if (!files || files.length === 0) {
    console.error('No files provided for conversion');
    return [];
  }
  
  const promises = files.map((file, index) => {
    return new Promise<string>((resolve, reject) => {
      console.log(`Converting file ${index + 1}:`, file.name, file.size, 'bytes');
      
      if (!file || file.size === 0) {
        console.error(`File ${index + 1} is empty or invalid`);
        reject(new Error(`File ${index + 1} is empty or invalid`));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        if (result && result.length > 100) {
          console.log(`File ${index + 1} converted successfully, size:`, result.length);
          resolve(result);
        } else {
          console.error(`File ${index + 1} conversion failed or too small`);
          reject(new Error(`File ${index + 1} conversion failed`));
        }
      };
      
      reader.onerror = () => {
        console.error(`File ${index + 1} reading failed:`, reader.error);
        reject(new Error(`Failed to read file ${index + 1}`));
      };
      
      reader.readAsDataURL(file);
    });
  });
  
  try {
    const results = await Promise.all(promises);
    console.log('All files converted successfully, total results:', results.length);
    return results;
  } catch (error) {
    console.error('Error during file conversion:', error);
    throw error;
  }
};

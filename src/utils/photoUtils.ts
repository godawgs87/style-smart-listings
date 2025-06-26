
export const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
  console.log('=== CONVERTING FILES TO BASE64 ===');
  console.log('Number of files to convert:', files.length);
  
  if (!files || files.length === 0) {
    console.error('No files provided for conversion');
    return [];
  }
  
  // Process files in batches to prevent memory issues
  const batchSize = 3;
  const results: string[] = [];
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}`);
    
    const batchPromises = batch.map((file, batchIndex) => {
      const fileIndex = i + batchIndex;
      return new Promise<string>((resolve, reject) => {
        console.log(`Converting file ${fileIndex + 1}:`, file.name, file.size, 'bytes');
        
        if (!file || file.size === 0) {
          console.error(`File ${fileIndex + 1} is empty or invalid`);
          reject(new Error(`File ${fileIndex + 1} is empty or invalid`));
          return;
        }
        
        // Check file size (limit to 10MB per file)
        if (file.size > 10 * 1024 * 1024) {
          console.error(`File ${fileIndex + 1} is too large:`, file.size);
          reject(new Error(`File ${fileIndex + 1} is too large (max 10MB)`));
          return;
        }
        
        const reader = new FileReader();
        
        reader.onload = () => {
          const result = reader.result as string;
          if (result && result.length > 100) {
            console.log(`File ${fileIndex + 1} converted successfully, size:`, result.length);
            resolve(result);
          } else {
            console.error(`File ${fileIndex + 1} conversion failed or too small`);
            reject(new Error(`File ${fileIndex + 1} conversion failed`));
          }
        };
        
        reader.onerror = () => {
          console.error(`File ${fileIndex + 1} reading failed:`, reader.error);
          reject(new Error(`Failed to read file ${fileIndex + 1}`));
        };
        
        // Add a small delay between file reads to prevent blocking
        setTimeout(() => {
          reader.readAsDataURL(file);
        }, batchIndex * 100);
      });
    });
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error('Error during batch conversion:', error);
      throw error;
    }
  }
  
  console.log('All files converted successfully, total results:', results.length);
  return results;
};

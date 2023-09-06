
export default async function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
    
        reader.onload = () => {
          resolve(reader.result);
        };
    
        reader.onerror = () => {
          reject(new Error("File reading failed"));
        };
    
        reader.readAsText(file);
      });
}
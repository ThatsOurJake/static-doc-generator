import fs from "node:fs";
import ejs from "ejs";

const promisedRenderFile = (
  fileName: string,
  data: object,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    ejs.renderFile(fileName, data, (err, str) => {
      if (err) {
        return reject(err);
      }

      return resolve(str);
    });
  });
};

const saveTemplate = async (
  fileName: string,
  data: object,
  outputFile: string,
) => {
  try {
    const str = await promisedRenderFile(fileName, data);
    fs.writeFileSync(outputFile, str);
  } catch (err) {
    const error = err as Error;
    console.error(`Failed to save: ${outputFile} - ${error.message}`);
  }
};

export default saveTemplate;

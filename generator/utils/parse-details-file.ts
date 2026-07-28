import fs from 'node:fs';
import path from 'node:path';

interface Details {
  name: string;
  description?: string;
}

const parseDetailsFile = (dir: string): Details | null => {
  const loc = path.join(dir, 'details.json');

  if (!fs.existsSync(loc)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(loc).toString());
};

export default parseDetailsFile;

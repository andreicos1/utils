// Add an internal dependency based on a root path

let fs;
try {
  fs = require("graceful-fs");
} catch {
  fs = require("fs");
}
const path = require("path");

const getPosition = (data, position) => {
  switch (position) {
    case 0:
      return 0;
    case 1:
      return data.indexOf("\n\n");
    case 2:
      const firstLineBreakIdx = data.indexOf("\n\n");
      return data.indexOf("\n\n", firstLineBreakIdx + 1);
  }
};

const addDependencies = async (dependency, dependencyDirectory, position = 3) => {
  const getAllImports = async (directory) => {
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        const fullPath = path.join(directory, file);
        if (fullPath === __filename) return; // skip this file
        const stats = fs.statSync(fullPath);
        if (stats.isFile()) {
          if (!file.match(/\.(ts|js|jsx|tsx)$/)) return;
          fs.readFile(fullPath, "utf-8", (err, data) => {
            if (err) throw err;
            // Find if dependency in array
            const dependencyIndex = data.indexOf(dependency);
            // Find if already imported
            const importDirectory = data.indexOf(dependencyDirectory);
            if (dependencyIndex === -1 || importDirectory !== -1) return;
            // Get index of first new line and add import there (for imports that belong in that group)
            const positionIndex = getPosition(data, position);
            const newData =
              data.slice(0, positionIndex) +
              `\nimport '${dependency} from ${dependencyDirectory}'` +
              data.slice(positionIndex);
            fs.writeFile(fullPath, newData, (err) => {
              if (err) throw err;
            });
          });
        } else {
          getAllImports(fullPath);
        }
      });
    });
  };
  await getAllImports(__dirname);
};

const dependency = "";
const dependencyDirectory = "";

addDependencies(dependency, dependencyDirectory, 1);

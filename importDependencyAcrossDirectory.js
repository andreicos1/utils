// Add an internal dependency based on a root path

const fs = require("fs");
const path = require("path");

const addDependencies = (dependency, dependencyDirectory) => {
  const getAllImports = (directory) => {
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
            if (dependencyIndex === -1) return;
            // Get index of first new line and add import there (for imports that belong in that group)
            const firstNewLineIndex = data.indexOf("\n\n");
            const newData =
              data.slice(0, firstNewLineIndex) +
              `\n\n// import ${dependency} from ${dependencyDirectory}` +
              data.slice(firstNewLineIndex);
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
  getAllImports(__dirname);
};

const dependency = "";
const dependencyDirectory = "";
const start = new Date();
addDependencies(dependency, dependencyDirectory);
console.log("Elapsed: ", new Date() - start);

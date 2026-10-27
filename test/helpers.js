const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');

function loadBrowserScript(filename, globals = {}) {
  const window = globals.window || {};
  const context = vm.createContext({
    window,
    console,
    Date,
    Math,
    setTimeout,
    clearTimeout,
    ...globals
  });
  const source = fs.readFileSync(path.join(projectRoot, filename), 'utf8');
  vm.runInContext(source, context, { filename });
  return { context, window };
}

module.exports = { loadBrowserScript, projectRoot };

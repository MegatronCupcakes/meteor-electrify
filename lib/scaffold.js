var fs     = require('fs');
var path   = require('path');
var shell  = require('shelljs');

module.exports = function($){
  return new Scaffold($);
};

function Scaffold($){
  this.$ = $;
  this.log = require('./log')($, 'electrify:scaffold');
}

Scaffold.prototype.prepare = function() {

  this.log.info('ensuring basic structure');
  
  shell.mkdir('-p' , this.$.env.app.bin);
  shell.mkdir('-p' , this.$.env.core.tmp);
  shell.mkdir('-p',  this.$.env.core.root);

  const electrifyPath = this.$.env.app.electrify_path;
  var index        = path.join(this.$.env.app.root, 'index.js');
  var packageJson  = this.$.env.app.pkg_path;
  var config       = this.$.env.app.config_path;
  var gitignore    = path.join(this.$.env.app.root, '.gitignore');

  var index_tmpl    = path.join(__dirname, 'templates', 'index.js');

  if(!fs.existsSync(index)) {
    fs.writeFileSync(index, fs.readFileSync(index_tmpl, 'utf8'));
  }
  
  // when scaffolding pull name from the parent project if defined
  if (!fs.existsSync(packageJson)) {
    const projectPackageJson = require(`${process.cwd()}/package.json`);
    const npmLib = require('./package-path');
    const additionalDependencies = projectPackageJson.electrifyDependencies ? projectPackageJson.electrifyDependencies : {};
    let packageJsonContents = {
      name: projectPackageJson.name || 'my-electrified-app',
      main: 'index.js',
      dependencies: {
        ...additionalDependencies,
        "@megatroncupcakes/meteor-electrify": electrifyPath
      }
    };
    if(projectPackageJson.electronPackager) packageJsonContents.electronPackager = projectPackageJson.electronPackager;
    fs.writeFileSync(packageJson, JSON.stringify(packageJsonContents, null, 2));
  }

  if (!fs.existsSync(config)) {
    fs.writeFileSync(config, JSON.stringify(this.$.env.app.config, null, 2));
  }

  if (!fs.existsSync(gitignore)) {
    fs.writeFileSync(gitignore, [
        '.DS_Store', '.dist', 'app',
        'bin', 'db', 'node_modules', 'electrify.local.json'
      ].join('\n'));
  }
};

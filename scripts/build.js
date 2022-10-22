// #!/user/bin/env node

const zip = require('adm-zip');
const fs = require('fs-extra');
const minimist = require('minimist');
const {exit} = require('process');

const main = async () => {
  const args = minimist(process.argv.slice(2));

  if(args.c) {
    clean();
  }
  if(args.b) {
    build();
  }
}

const build = async () => {

  await fs.ensureDir("dist");
  const zipFile = new zip();
  zipFile.addLocalFolder("src/");
  zipFile.writeZip("dist/package.zip");

  exit(0);
}

const clean = async () => {

  await fs.remove("dist");
  
  exit(0);
}


main();
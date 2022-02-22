// read version from package.json
import fs from 'fs';
import path from 'path';
import url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// read version from package.json
// import pkg from '../package.json';
const packageJson = fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8');
const pkg = JSON.parse(packageJson);

// save version to ../src-tauri/tauri.conf.json
const version = pkg.version;
const tauriConf = path.join(__dirname, '../src-tauri/tauri.conf.json');
const tauriConfContent = fs.readFileSync(tauriConf, 'utf8');
const tauriConfContentNew = tauriConfContent.replace(/"version":\s*"[^"]+"/, `"version": "${version}"`);
fs.writeFileSync(tauriConf, tauriConfContentNew);

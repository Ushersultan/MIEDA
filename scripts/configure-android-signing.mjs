import { readFile, writeFile } from 'node:fs/promises';
const path = new URL('../android/app/build.gradle', import.meta.url);
const marker = '// MIEDA secure CI signing';
let gradle = await readFile(path, 'utf8');
for (const name of ['CM_KEYSTORE_PATH', 'CM_KEYSTORE_PASSWORD', 'CM_KEY_ALIAS', 'CM_KEY_PASSWORD']) {
  if (!process.env[name]) throw new Error(`Missing signing configuration: ${name}`);
}
if (!gradle.includes(marker)) {
  gradle += `
${marker}
android {
    signingConfigs {
        miedaUpload {
            storeFile file(System.getenv('CM_KEYSTORE_PATH'))
            storePassword System.getenv('CM_KEYSTORE_PASSWORD')
            keyAlias System.getenv('CM_KEY_ALIAS')
            keyPassword System.getenv('CM_KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.miedaUpload
        }
    }
}
`;
  await writeFile(path, gradle, 'utf8');
}
console.log('Gradle signing configured using secure environment references.');

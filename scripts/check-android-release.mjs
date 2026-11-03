// Never print signing values or the keystore contents.
const required = ['ANDROID_VERSION_CODE', 'ANDROID_VERSION_NAME', 'CM_KEYSTORE_PATH', 'CM_KEYSTORE_PASSWORD', 'CM_KEY_ALIAS', 'CM_KEY_PASSWORD'];
const missing = required.filter(name => !process.env[name]);
if (missing.length) throw new Error(`Missing secure build configuration: ${missing.join(', ')}`);
const code = process.env.ANDROID_VERSION_CODE;
if (!/^\d+$/.test(code) || Number(code) < 2 || Number(code) > 2100000000) {
  throw new Error('ANDROID_VERSION_CODE must be an integer from 2 to 2100000000 and greater than every version already uploaded to Play.');
}
if (!/^\d+\.\d+\.\d+(?:[.-][A-Za-z0-9]+)*$/.test(process.env.ANDROID_VERSION_NAME)) {
  throw new Error('ANDROID_VERSION_NAME must be a release version such as 1.3.4.');
}
console.log('Android release configuration present. Confirm the version code against Play Console before uploading.');

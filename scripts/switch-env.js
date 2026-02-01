const fs = require('fs');
const path = require('path');

const env = process.argv[2] || 'dev';
const envFilePath = path.join(__dirname, '../.clasp.env.json');
const claspFilePath = path.join(__dirname, '../.clasp.json');

// 1. .clasp.env.json がない場合の処理
if (!fs.existsSync(envFilePath)) {
  if (fs.existsSync(claspFilePath)) {
    console.log('Notice: .clasp.env.json not found. Using existing .clasp.json.');
    process.exit(0);
  } else {
    console.error('Error: Neither .clasp.env.json nor .clasp.json found.');
    console.error('Please copy .clasp.env.json.sample to .clasp.env.json and fill in your script IDs, or create .clasp.json directly.');
    process.exit(1);
  }
}

// 2. .clasp.env.json を読み込む
let config;
try {
  config = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
} catch (e) {
  console.error('Error: Failed to parse .clasp.env.json.');
  process.exit(1);
}

// 3. 環境設定の決定（フォールバック: dev -> prod）
let targetConfig = config[env];
let activeEnv = env;

if (!targetConfig && env === 'dev') {
  console.log('Notice: "dev" config not found in .clasp.env.json. Falling back to "prod".');
  targetConfig = config['prod'];
  activeEnv = 'prod';
}

if (!targetConfig) {
  console.error(`Error: Configuration for "${env}" (and fallback "prod") not found in .clasp.env.json.`);
  process.exit(1);
}

// 4. .clasp.json の生成
const claspConfig = {
  scriptId: targetConfig.scriptId,
  rootDir: "",
  scriptExtensions: [".js", ".gs"],
  htmlExtensions: [".html"],
  jsonExtensions: [".json"]
};

fs.writeFileSync(
  claspFilePath,
  JSON.stringify(claspConfig, null, 2)
);

console.log(`Successfully switched to ${activeEnv} environment (Source: .clasp.env.json).`);


const arg = process.argv[2];
// const environment = !arg ? "dev" : arg;

const configMap = {
    'dev': './config/config.dev.json',
    'prod': './config/config.prod.json',
    'staging': './config/config.staging.json',
    // Add more environment mappings as needed
};

const configFile = configMap[arg]
const config = require(configFile);
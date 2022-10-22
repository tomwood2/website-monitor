const mongoCrudModule = require('./mongoCrud');
const runnerModule = require('./runner');

const mongoCrud = mongoCrudModule.getMongoCrud();
const runner = runnerModule.getRunner(mongoCrud);

const info = {
    continueLoop: true,
    loopFrequency: 60 * 1000 * 10,  // 10 minutes in milliseconds
    // mongoConfigFolder: 'config',
    // mongoConfigFilename: 'mongoConfig.json',
};

console.log(`Startup: current time is ${new Date().toLocaleString()}`)

runner.main(info);
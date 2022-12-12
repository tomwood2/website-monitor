const runnerModule = require('./runner');

const runner = runnerModule.getRunner();

const info = {
    continueLoop: true,
    loopFrequency: 60 * 1000 * 10,  // 10 minutes in milliseconds
};

console.log(`Startup: current time is ${new Date().toLocaleString()}`);

runner.main(info);
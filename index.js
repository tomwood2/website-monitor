const mongoCrudModule = require('./mongoCrud');
const runnerModule = require('./runner');


const mongoCrud = mongoCrudModule.getMongoCrud();
const runner = runnerModule.getRunner(mongoCrud);

runner.run(runner);
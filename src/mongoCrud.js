const { MongoClient } = require('mongodb');

// calls to connect should be enclosed in try/catch

const getMongoCrud = () => {

    let client = null;
    // add database here?

    return {
        connect: async (mongoConfig) => {
            const local = new MongoClient(mongoConfig.uri);
            await local.connect();
            client = local;
        },
        close: async () => {
            if (client !== null) {
                await client.close();
                client = null;
            }
        },
        crud: async (funtionName, argument1, argument2) => {

            if (client === null) {
                throw 'calling mongoCrud.crud with null client.  Did you call mongoCrud.connect?';
            }

            const databaseName = 'website-scraper';
            const collectionName = 'sites';

            const collection = client.db(databaseName).collection(collectionName);

            // Make the appropriate DB calls

            switch (funtionName) {
                case 'insertOne':
                    return await collection.insertOne(argument1);

                case 'insertMany':
                    return await collection.insertMany(argument1);

                case 'findOne':
                    return await collection.findOne(argument1);

                case 'findMany': {
                    const cursor = collection.find(argument1);
                        // .sort({ last_review: -1 })
                        // .limit(argument2);

                    return await cursor.toArray();
                }

                case 'updateOne':
                    return await collection.updateOne(argument1, argument2);
            }
        }
    }; // return object
};   // mongoCrud()

exports.getMongoCrud = getMongoCrud;

const axios = require('axios');
const cheerio = require('cheerio');

const timeout = (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds);
    });
};

const getRunner = (_mongoCrud) => {
    // private properties
    const mongoCrud = _mongoCrud;

    // private functions
    const getSiteElementInnerText = async ({url, selector, maxLength}) => {
        try {

            // 'User-agent' defaults to 'axios/1.1.3'
            // could pass config object as second
            // argument to override

            const response = await axios.get(url);

            const $ = cheerio.load(response.data);
            const elements = $(selector, response.data);

            if (elements.length === 0 || elements[0] === undefined) {
                throw `selector ${selector} not found on url ${url}`;
            }

            return $(elements[0]).prop('innerText').slice(0, maxLength);
        }
        catch (e) {
            throw `re-throw exception '${e}' in getSiteElementInnerText`;
        }
    };

    // for copperknob, the selector finds an
    // anchor element that have an href=link to stepsheet
    // and child span element with dance name

    const scrapeAndTest = async (sites) => {

        for(const site of sites) {

            try {

                const elementText = await getSiteElementInnerText(site);

                // if last property doesn't exist in site, it has never been updated

                const neverUpdated = site.last === undefined;

                // test for change
                if (neverUpdated || elementText !== site.last.elementText) {

                    // send notification if neverUpdated is false
                    const message = `Changed detected for site:\n${site.url}`;
                    const title = site.name;

                    console.log(`element changed to:\n'${elementText}' for site:\n${site.url}`);

                    // axios will throw on non-2xx status codes, no response
                    // and bad request creation, see
                    // https://axios-http.com/docs/handling_errors

                    await axios.post('https://api.pushover.net/1/messages.json', {
                        token: 'apm1gzynn6tu8f3x2fv8wx6b9oz6wk',
                        user: 'uqp7try2irsehj2iua97pxnx4kg5ee',
                        device: 'Tommys_iPhone_12_Pro_Max',
                        title: title,
                        message: message
                    });
            
                    // update db
                    const update = {
                        $set: {
                            last: {
                                elementText: elementText,
                                dateUpdated: new Date()
                            }
                        }
                    };
                    await mongoCrud.crud('updateOne', {_id: site._id}, update);
                }

            } catch(e) {
                // we log but don't stop for single site failure
                console.log(`exception '${e}' in scrapeAndTest for site id '${site._id}'`);
            }
        }

        // add exception counts here
        console.log(`getAll() completed at ${new Date().toLocaleString()}`);
    };

    const run = async () => {
        try {
            // connect to mongodb
            await mongoCrud.connect();

            // get sites data from database
            const sites = await mongoCrud.crud('findMany', {});

            // scrape each site and test for changes
            await scrapeAndTest(sites);

        } catch(e)  {
            console.log(e);
        } finally {
            await mongoCrud.close();
        }
    };

    return {
        main: async (info) => {
            while (info.continueLoop) {
                await run();
                // run again in n minutes
                await timeout(info.loopFrequency);
            }
        }
    };   // end return object
};   // end runModule()

exports.getRunner = getRunner;
// const mongoCrud = mongoCrudModule.getMongoCrud();
// const run = getRun(mongoCrud);

// run.run();
//run(mongoCrud);

// const sitesData = [
//     {
//         _id: 1000,
//         name: 'Fred Whitehouse',
//         url: 'https://www.copperknob.co.uk/choreographer/468/fred-whitehouse',
//         selector: '.listitem > .listTitle > a:first',
//         maxLength: 100,
//     },
//     {
//         _id: 1010,
//         name: 'Shane McKeever',
//         url: 'https://www.copperknob.co.uk/choreographer/826/shane-mckeever',
//         selector: '.listitem > .listTitle > a:first',
//         maxLength: 100,
//     },
//     {
//         _id: 1020,
//         name: 'Niels Poulsen',
//         url: 'https://www.copperknob.co.uk/choreographer/2/niels-poulsen',
//         selector: '.listitem > .listTitle > a:first',
//         maxLength: 100,
//     },
//     {
//         _id: 2000,
//         name: 'NWS San Diego Regional Weather Roundup',
//         url: 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SGX&product=RWR&format=CI&version=1',
//         selector: '.glossaryProduct',
//         maxLength: 200,
//     },
// ];

// mongoCrud.crud("insertMany", sitesData);
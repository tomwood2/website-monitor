const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const process = require('process');
const sitesModel = require('website-monitor-schemas/sites');
const usersModel = require('website-monitor-schemas/users');

const timeout = (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), milliseconds);
    });
};

const getRunner = () => {

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

    const scrapeAndTest = async (sites) => {

        for(const site of sites) {

            try {

                // for copperknob, the selector finds an
                // anchor element that have an href=link to stepsheet
                // and child span element with dance name

                const elementText = await getSiteElementInnerText(site);

                // if last property doesn't exist in site, it has never been updated

                const neverUpdated = site.last === undefined;

                // test for change
                if (neverUpdated || elementText !== site.last.elementText) {

                    // send notification and update last property on site document

                    const message = `Changed detected for site:\n${site.url}`;
                    const title = site.name;

                    console.log(`element changed to:\n'${elementText}' for site:\n${site.url}`);

                    site.last = {
                        elementText: elementText,
                        dateUpdated: new Date()
                    };

                    await site.save();

                    for (const user of site.users) {
                        if (user.pushover !== undefined) {

                            // axios will throw on non-2xx status codes, no response
                            // and bad request creation, see
                            // https://axios-http.com/docs/handling_errors

                            await axios.post('https://api.pushover.net/1/messages.json', {
                                token: 'apm1gzynn6tu8f3x2fv8wx6b9oz6wk',
                                user: user.pushover.user,
                                device: user.pushover.device,
                                title: title,
                                message: message
                            });
                        }

                        if (user.emailNotify) {

                        }
                    }
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

            // connect to the mongoDB database
            mongoose.set('strictQuery', true);
            await mongoose.connect(process.env.MONGO_CONNECT_URI, {
                retryWrites: true,
                w: 'majority',
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            
            // Bind connection to error event (to get notification of connection errors)
            mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
        
            const sites = await sitesModel.find({})
              .populate('users')
              .exec();

            // scrape each site and test for changes
            await scrapeAndTest(sites);

        } catch(e)  {
            console.log(e);
        } finally {
            mongoose.connection.removeAllListeners();
            await mongoose.connection.close();
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

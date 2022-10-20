const rp = require('request-promise');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const mongoCrudModule = require('./mongoCrud');

const getSiteElementInnerText = async ({url, selector, maxLength}) => {
    try {
        const options = {
            headers: {
                'User-agent': 'tjw app v1.3'
            }
        };

        const html = await rp(url, options);

        const $ = cheerio.load(html);
        const elements = $(selector, html);

        if (elements.length === 0 || elements[0] === undefined) {
            throw `selector ${selector} not found on url ${url}`;
        }

        return $(elements[0]).prop('innerText').slice(0, maxLength);

        // const dances = [];
        // for (const element of elements) {
        //     console.log($(element).prop('innerText')); // save this for comparison

        //     const dance = {
        //     href: element.attribs.href,     
        //     name: $(element.children[0]).prop('innerText')
        // };

        //     // dance.name = $(span).text();
        //   dances.push(dance);
        // }
        // console.log(dances);

        // console.log($.default('td > b > a', html).length);
        // console.log($.default('td > b > a', html));
    }
    catch (e) {
        throw `re-throw exception '${e}' in getSiteElementInnerText`;
    }
}

// for copperknob, the selector finds an
// anchor element that have an href=link to stepsheet
// and child span element with dance name

const scrapeAndTest = async (mongoCrud, sites) => {

    for(const site of sites) {

        try {

            const elementText = await getSiteElementInnerText(site);

            // if last property doesn't exist in site, it has never been updated

            const neverUpdated = site.last === undefined;

            // test for change
            if (neverUpdated || elementText !== site.last.elementText) {

                // send notification if neverUpdated is false
                console.log(`element changed from '${neverUpdated ? null : site.last.elementText}' to '${elementText}' for site ${site.url}`);
                
                // update db
                const update = {
                    $set: {
                        last: {
                            elementText: elementText,
                            dateUpdated: new Date()
                        }
                    }
                };
                const result = await mongoCrud.crud(client, "updateOne", {_id: site._id}, update);
            }

        } catch(e) {
            // we log but don't stop for single site failure
            console.log(`exception '${e}' in scrapeAndTest for site id '${site._id}'`);
        }
    };

    // add exception counts here
    console.log(`getAll() completed at ${new Date().toLocaleString()}`);
}


const run = async (mongoCrud) => {

    try {
        const mongoConfigPath = path.join(process.cwd(), 'config', 'mongoConfig.json');

        const mongoConfigData = await fs.promises.readFile(mongoConfigPath, 'utf-8');

        const mongoConfig = JSON.parse(mongoConfigData);

        await mongoCrud.connect(mongoConfig);

        // get sites data from database
        const sites = await mongoCrud.crud('findMany', {});

        // scrape each site and test for changes
        await scrapeAndTest(mongoCrud, sites);

    } catch(e)  {

        console.log(e);

    } finally {

        await mongoCrud.close();

        // run again in 10 minutes
        setTimeout(run, 60 * 1000 * 10);
    }
}

const mongoCrud = mongoCrudModule.getMongoCrud();

run(mongoCrud);

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
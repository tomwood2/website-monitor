const mongoCrudModule = require('./mongoCrud');

const sitesData = [
    {
        name: 'Fred Whitehouse',
        url: 'https://www.copperknob.co.uk/choreographer/468/fred-whitehouse',
        selector: '.listitem > .listTitle > a:first',
        maxLength: 100,
    },
    {
        name: 'Shane McKeever',
        url: 'https://www.copperknob.co.uk/choreographer/826/shane-mckeever',
        selector: '.listitem > .listTitle > a:first',
        maxLength: 100,
    },
    {
        name: 'Niels Poulsen',
        url: 'https://www.copperknob.co.uk/choreographer/2/niels-poulsen',
        selector: '.listitem > .listTitle > a:first',
        maxLength: 100,
    },
    {
        name: 'Guillaume Richard',
        url: 'https://www.copperknob.co.uk/choreographer/793/guillaume-richard',
        selector: '.listitem > .listTitle > a:first',
        maxLength: 100,
    },
    {
        name: 'NWS San Diego Regional Weather Roundup',
        url: 'https://forecast.weather.gov/product.php?site=NWS&issuedby=SGX&product=RWR&format=CI&version=1',
        selector: '.glossaryProduct',
        maxLength: 200,
    },
];

const mongoCrud = mongoCrudModule.getMongoCrud();

const runAddSites = async () => {
    try {
        await mongoCrud.connect();
        await mongoCrud.crud('insertMany', sitesData);
    } catch (e) {
        console.log();
    } finally {
        await mongoCrud.close();
    }
}

runAddSites();
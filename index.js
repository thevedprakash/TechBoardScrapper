const puppeteer = require("puppeteer");
const request = require("request-promise");
const cheerio = require("cheerio");
const mongoose = require("mongoose");
const techboardListing  = require("./model/Listing");

const scrapingResults = [
    {
        Company : "Icosian",
        Logo : "https://i1.wp.com/techboard.com.au/wp-content/uploads/2018/11/Screen-Shot-2018-11-01-at-11.27.30-am.png?w=648&ssl=1",
        PageUrl :  "https://techboard.com.au/company-profile/icosian/",
        CompanyAnnouncements: "No items found",
        ElevatorPitch : "Icosian powers the next generation of service organisations. We build technology \
                        that transforms the way organisations various industries manage their mobile workforce.",
        Category : "People solutions",
        URL : "http://www.icosian.io/",
        OperationalStatus : "Active",
        ASXListingCode : '',
        YearofCommencement : 2016,
        Address : "30 Florence St, Teneriffe, Queensland 4005, au",
        State : "Queensland",
        OverseasOperations : "No",
        Twitter : '',
        Facebook : '',
        Linkedin : '',
        KeyPersonnel : '',
        AwardsWon: ''
    }
];

const url = 'mongodb://127.0.0.1:27017/techboardwebscraper'

async function connectToMongoDb() {
    await mongoose.connect(url,{ useNewUrlParser: true });
    console.log("connected to mongodb :",url);
};

async function scrapeListings(page) {

    await page.goto("https://techboard.com.au/companies/")

    const html = await page.content();
    const $ = cheerio.load(html);

    const listings = $("table > tbody > tr").map((index,element) => {
        const logoElement = $(element).find("img");
        const companyElement = $(element).find("td")[1];
        const companyName = $(companyElement).text();
        const logoLocation = $(logoElement).attr('src');
        const pageUrl = $(companyElement).find("a").attr('href');

        return {
                companyName,logoLocation,pageUrl
            };

        }
    ).get();

    return listings
};

async function scrapeCompanyDescription(listings,page) {
    for (var i=0; i< listings.length; i++) {
        await page.goto(listings[i].pageUrl);

        const html = await page.content();
        const $ = cheerio.load(html);  
        // const companyDescription =  $("table > tbody > tr").map((index,element) => {
        //     return { [String($($(element).find("td")[0]).text().replace(':',""))] : $($(element).find("td")[1]).text().replace("\n","") };
        //     }).get();
        // listings[i].companyDescription = companyDescription;
        const CompanyAnnouncements =  $("table > tbody > tr:nth-child(1) > td:nth-child(2)").text().trim(" ","");
        listings[i].CompanyAnnouncements = CompanyAnnouncements;
        const ElevatorPitch = $("table > tbody > tr:nth-child(2) > td:nth-child(2)").text();
        listings[i].ElevatorPitch = ElevatorPitch;
        const Category = $("table > tbody > tr:nth-child(3) > td:nth-child(2)").text();
        listings[i].Category = Category;
        const URL = $("table > tbody > tr:nth-child(4) > td:nth-child(2)").find('a').attr('href');
        listings[i].URL = URL;
        const OperationalStatus = $("table > tbody > tr:nth-child(5) > td:nth-child(2)").text();
        listings[i].OperationalStatus = OperationalStatus;
        const ASXListingCode = $("table > tbody > tr:nth-child(6) > td:nth-child(2)").text();
        listings[i].ASXListingCode = ASXListingCode;
        const YearofCommencement = $("table > tbody > tr:nth-child(7) > td:nth-child(2)").text();
        listings[i].YearofCommencement = YearofCommencement;
        const Address = $("table > tbody > tr:nth-child(8) > td:nth-child(2)").text();
        listings[i].Address = Address;
        const State = $("table > tbody > tr:nth-child(9) > td:nth-child(2)").text();
        listings[i].State = State;
        const OverseasOperations = $("table > tbody > tr:nth-child(10) > td:nth-child(2)").text();
        listings[i].OverseasOperations = OverseasOperations;
        const Twitter = $("table > tbody > tr:nth-child(11) > td:nth-child(2)").find('a').attr('href');
        listings[i].Twitter = Twitter;
        const Facebook = $("table > tbody > tr:nth-child(12) > td:nth-child(2)").find('a').attr('href');
        listings[i].Facebook = Facebook;
        const Linkedin = $("table > tbody > tr:nth-child(13) > td:nth-child(2)").find('a').attr('href');
        listings[i].Linkedin = Linkedin;
        const KeyPersonnel = $("table > tbody > tr:nth-child(14) > td:nth-child(2)").text();
        listings[i].KeyPersonnel = KeyPersonnel;
        const AwardsWon = $("table > tbody > tr:nth-child(15) > td:nth-child(2)").text();
        listings[i].AwardsWon = AwardsWon;
        console.log(listings[i]);
        const listingModel = new techboardListing(listings[i]);
        await listingModel.save();
        console.log("Sleeping for 1000 miliseconds.")

        await sleep(1000);
    }
};


async function clickSelect(page) {

    await page.goto("https://techboard.com.au/companies/")

    const html = await page.content();
    const $ = cheerio.load(html);
    $( "input[value='Search/Filter']" ).click();
};

async function sleep(miliseconds) {
    return new Promise(resolve => setTimeout(resolve,miliseconds));
};


async function main() {
    await connectToMongoDb();
    await page.goto("https://techboard.com.au/companies/")

    const html = await page.content();
    const $ = cheerio.load(html);

    var i = 0;
    while (i < 10) {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        const listings = await scrapeListings(page);
        const listingWithCompanyDescription = await scrapeCompanyDescription(
            listings,
            page
        );
        console.log(listings);
        clickSelect(page)
        console.log("Page no. : ", i);
    };
};

main();
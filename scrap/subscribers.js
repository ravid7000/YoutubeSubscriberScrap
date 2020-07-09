const puppeteer = require("puppeteer");
const csv = require("csvtojson");
const path = require("path");
const { wait, createOrModifyCSV, numberConversion } = require("./utils");

const csvFilePath = path.join(__dirname, "../files/subscribers.csv");
const csvOutputFilePath = "subscribers-output-1.csv";

let CSVDATA = [];
let TOTAL_FETCH = 2000;
let fetchCount = 1000;
let page;
let browser;

const HEADERS = [
  "r_category",
  "r_owner",
  "uid",
  "r_url",
  "Subscribers",
  "Email Id",
  "Contact Number",
  "pcu",
  "acu",
  "fans",
  "tms",
  "mdt",
  "operator",
  "progress",
  "Email Ids",
];

async function scrapeSubscribers() {
  const row = CSVDATA[fetchCount];

  console.log();
  console.log("------------------------------");
  console.log("Fetch count", fetchCount);
  console.log("Fetching Subscribers for", row.r_url);

  try {
    if (!row.r_url) {
      throw new Error("Skipping profile:", row.r_owner, "as it don't have channel url.");
    }

    await page.goto(row.r_url, {waitUntil: 'load', timeout: 0});
    let subscribers = await page.evaluate(
      () => document.querySelector("#subscriber-count").textContent
    );
  
    if (typeof subscribers === "string") {
      subscribers = subscribers.split(" ")[0];
      row.Subscribers = numberConversion(subscribers || '');
      createOrModifyCSV({
        headers: HEADERS,
        json: [row],
        fileName: csvOutputFilePath,
      });
      console.log("Fetching Subscribers for", row.r_url, "Subscribers:", subscribers);
    }
    
    fetchCount += 1;
    console.log("Completed:", parseFloat((fetchCount/TOTAL_FETCH) * 100).toFixed(1) + "%");
    console.log("------------------------------");
    console.log();

    if (fetchCount === TOTAL_FETCH) {
      await browser.close();
    } else {
      await wait(200);
      scrapeSubscribers();
    }
  } catch(err) {
    console.log("Error", err.message);
    console.log("Failed to fetch for", row.r_url);
    if (fetchCount !== TOTAL_FETCH) {
      await wait(200);
      scrapeSubscribers();
    }
  }
}

(async () => {
  CSVDATA = await csv().fromFile(csvFilePath);
  browser = await puppeteer.launch({
    headless: true,
  });
  page = await browser.newPage();
  await scrapeSubscribers();
})();

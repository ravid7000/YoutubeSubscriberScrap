const fs = require("fs");
const path = require("path");

const FILES_BASE_DIR = path.join(__dirname, "../files");
const MRE = new RegExp('m', 'ig');
const KRE = new RegExp('k', 'ig');
const BRE = new RegExp('b', 'ig');

const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const jsonToCSV = (json) => {
  let csv = "";
  json.map((part) => {
    csv += Object.values(part).join(",") + "\n";
  });
  return csv;
};

const createOrModifyCSV = ({ headers, json, fileName }) => {
  const filePath = path.join(FILES_BASE_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    let csv = headers.join(",") + ",\n";
    csv += jsonToCSV(json);
    fs.writeFileSync(filePath, csv);
  } else {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    fileContent += jsonToCSV(json);
    fs.writeFileSync(filePath, fileContent);
  }
};

const numberConversion = numStr => {
  if (BRE.test(numStr)) {
    numStr = numStr.replace(BRE, '');
    numStr = parseFloat(numStr) * 1000000000;
    return numStr;
  }

  if (MRE.test(numStr)) {
    numStr = numStr.replace(MRE, '');
    numStr = parseFloat(numStr) * 1000000;
    return numStr;
  }

  if (KRE.test(numStr)) {
    numStr = numStr.replace(KRE, '');
    numStr = parseFloat(numStr) * 1000;
    return numStr;
  }

  return numStr;
}

module.exports = { wait, createOrModifyCSV, numberConversion };

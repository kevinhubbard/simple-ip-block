const fs = require('fs');
const ipv4 = require('./lib/ipv4');
const ipv6 = require('./lib/ipv6');
const util = require('./lib/util');

let ipArray = [], ipv4ObjectArray = [], ipv6ObjectArray = [];

function loadIPList(file) {
        try {
                let data = fs.readFileSync(file, 'utf8');
                let entry = data.split('\n');

                for (let i = 0; i < entry.length; i++) {
                        let ip = entry[i].trim();
                        if (ip.length > 0) {
                                ipArray.push(ip);
                        }
                }
        } catch (err) {
                console.error("Error reading file: " + err);
        }
        return ipArray;
}

// loop through the array of IPs created from the text file
// if current address contains a CIDR #, find its block range otherwise push ip to approperate array for searching
function createIPObject(ipArrayList) {
        for (let i = 0; i < ipArrayList.length; i++) {
                // if ip address has a cidr # then calculate the start and end block of ip address
                if (ipArrayList[i].includes('/')) {
                        if (ipArrayList[i].includes(':')) { // ipv6 check
                                let i6StartEnd = ipv6.findIPv6Block(ipArrayList[i]);
                                ipv6ObjectArray.push(new util.IPStartEndBlock(ipv6.v6ToInteger(i6StartEnd[0]), ipv6.v6ToInteger(i6StartEnd[1])));
                        } else {
                                let startEndValues = ipv4.findIPBlock(ipArrayList[i]);
                                ipv4ObjectArray.push(new util.IPStartEndBlock(ipv4.ipToIntegerConversion(startEndValues[0]), ipv4.ipToIntegerConversion(startEndValues[1])));    
                        }
                // if ip address does not contain cidr value push the same ip start/end value to ip array object
                } else {
                        if (ipArrayList[i].includes(':')) { // ipv6 check
                                let i6StartEnd = ipv6.findIPv6Block(ipArrayList[i] + '/128')
                                ipv6ObjectArray.push(new util.IPStartEndBlock(ipv6.v6ToInteger(i6StartEnd[0]), ipv6.v6ToInteger(i6StartEnd[1])));
                        } else {
                                ipv4ObjectArray.push(new util.IPStartEndBlock(ipv4.ipToIntegerConversion(ipArrayList[i]), ipv4.ipToIntegerConversion(ipArrayList[i])));
                        }
                }
        }
}

function banCheck(options) {
       createIPObject(loadIPList(options.source));
       // console.log(ipv4ObjectArray, ipv6ObjectArray);

        return function(req, res, next) {
                const ip = req.headers['cf-connecting-ip'] || req.ip;
                if (ip.includes(':')) { // ipv6 check
                        const convertedIP = ipv6.v6ToInteger(ipv6.expandIPv6(ip));
                        const isv6Banned = ipv6ObjectArray.some(block => {
                                convertedIP >= block.start && convertedIP <= block.end
                        });
                        if (isv6Banned) return res.status(403).send('ACCESS-DENIED');
                } else {
                        const convertedIP = ipv4.ipToIntegerConversion(ip);
                        const isv4Banned = ipv4ObjectArray.some(block => {
                                convertedIP >= block.start && convertedIP <= block.end
                        });
                        if (isv4Banned) return res.status(403).send('ACCESS-DENIED');
                }
        next();
        }
}

module.exports = banCheck;
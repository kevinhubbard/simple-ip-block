const fs = require('fs');
let ipArray = [];
let ipObjectArray = [];

function IPStartEndBlock(start, end) {
        this.start = start;
        this.end = end;
}

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

function ipToIntegerConversion(ipv4Number) {
        let segment = ipv4Number.split('.');
        let ipInteger = (parseInt(segment[0]) * Math.pow(256, 3)) + (parseInt(segment[1]) * Math.pow(256,2)) + (parseInt(segment[2]) * 256) + parseInt(segment[3]);
        return ipInteger;
}


function createIPObject(ipArrayList) {
        for (let i = 0; i < ipArrayList.length; i++) {
                if (ipArrayList[i].includes('/')) {
                        let startEndValues = findIPBlock(ipArrayList[i]);
                        ipObjectArray.push(new IPStartEndBlock(ipToIntegerConversion(startEndValues[0]), ipToIntegerConversion(startEndValues[1])));
                } else {
                        ipObjectArray.push(new IPStartEndBlock(ipToIntegerConversion(ipArrayList[i]), ipToIntegerConversion(ipArrayList[i])));
                }
        }
        return ipObjectArray;
}

// findIPBlock takes a ipv4 with cidr and returns an array of 2 ip addresses (a start address and an end address)
function findIPBlock(cidrBlock) {
        // first take ip and strip off cidr
        let splitCIDR = cidrBlock.split('/');
        let cidr = splitCIDR[1];
        let splitIP = splitCIDR[0].split('.');
        //console.log(splitIP);

        // convert ip to a bit string
        let firstOctet = padOctet(parseInt(splitIP[0]).toString(2));
        let secondOctet = padOctet(parseInt(splitIP[1]).toString(2));
        let thirdOctet = padOctet(parseInt(splitIP[2]).toString(2));
        let fourthOctet = padOctet(parseInt(splitIP[3]).toString(2));
        let binaryString = firstOctet + secondOctet + thirdOctet + fourthOctet;
        //console.log(binaryString);

        // loop through string a char at a time till i get to where the cidr value is
        // leave ip bit string unchanged up till the cidr number
        let firstHalf = '';
        for (let i = 0; i < cidr; i++) {
                firstHalf += binaryString.charAt(i);
        }

        // save 2 values a start and end value
        let binaryStart = padStart(firstHalf); // start = unchanged ip until cidr bit + change all remaining bits to 0
        let binaryEnd = padEnd(firstHalf); // end = unchanged ip until cidr bit + change all remaining bits to 1

        // convert ip bit string back to an ipv4 address (will use function bitStringToIPConversion())
        let blockStartEnd = [];
        blockStartEnd[0] = bitStringToIPConversion(binaryStart);
        blockStartEnd[1] = bitStringToIPConversion(binaryEnd);

        // returns an array of 2 values (start and end)
        return blockStartEnd;
}

function padStart(partialIP) {
        let ipStarts = partialIP;
        let startPad = 32 - partialIP.length;
        for (let i = 0; i < startPad; i++) {
                ipStarts += 0;
        }
        return ipStarts;
}

function padEnd(partialIP) {
        let ipEnds = partialIP;
        let endPad = 32 - partialIP.length;
        for (i = 0; i < endPad; i++) {
                ipEnds += 1;
        }
        return ipEnds;
}

// bitStringToIPConversion is a function that takes a 32 character "bit string" and converts/returns a ipv4 address
function bitStringToIPConversion(bitString) {
        // loop through first 8 bits
        let binarySlice = '';
        binarySlice = bitString.slice(0, 8) + '.' + bitString.slice(8,16) + '.' + bitString.slice(16,24) + '.' + bitString.slice(24,32);
        let convertedIP = binarySlice.split('.');
        for (i = 0; i < convertedIP.length; i++) {
                convertedIP[i] = parseInt(convertedIP[i], 2);
        }
        let ipString = convertedIP[0] + '.' + convertedIP[1] + '.' + convertedIP[2] + '.' + convertedIP[3];
        return ipString;
}

// padOctet looks at a binary string length and if its not an octet it padds it with zeros.
function padOctet(octet) {
        if (octet.length == 8) {
                return octet;
        } else {
                let pad = 8 - octet.length;
                let paddedOctet = '';
                for (let i = 0; i < pad; i++) {
                        paddedOctet += 0;
                }
                paddedOctet = paddedOctet + octet;
                return paddedOctet;
        }
}

// later we sort our ipObjectArray based on start and ascending
// lastly implement binary search to find ip
// trun into express middleware and update as my first useful npm package!


function sortArray(array) {
        array.sort(function(a,b) {
                return a.start - b.start;
        });
}


function banCheckMiddleware(options) {
        const ipa = createIPObject(loadIPList(options.source));
        console.log(ipa);
        sortArray(ipa);
        console.log(ipa);


        return function(req, res, next) {
                const ip = req.headers['cf-connecting-ip'] || req.ip;
                let convertedIP = ipToIntegerConversion(ip);

                // if converted ip is in sorted array 
                        //then return res.status(403).send('Access denied');
                // else next();

                // Optional: binary search or linear check for now
        const isBanned = ipObjectArray.some(block =>
            convertedIP >= block.start && convertedIP <= block.end
        );

        if (isBanned) {
                return res.status(403).send('ACCESS-DENIED');
        }
        next();
        }
}

module.exports = banCheckMiddleware;

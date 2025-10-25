const fs = require('fs');
let ipArray = [];
let ipv4ObjectArray = [];
let ipv6ObjectArray = [];

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

function v6ToInteger(i6n) {
        return BigInt("0x"+i6n[0]) * (2n**16n)**7n + BigInt("0x"+i6n[1]) * (2n**16n)**6n + BigInt("0x"+i6n[2]) * (2n**16n)**5n + BigInt("0x"+i6n[3]) * (2n**16n)**4n + BigInt("0x"+i6n[4]) * (2n**16n)**3n + BigInt("0x"+i6n[5]) * (2n**16n)**2n + BigInt("0x"+i6n[6]) * (2n**16n)**1n + BigInt("0x"+i6n[7]);
}


function createIPObject(ipArrayList) {
        for (let i = 0; i < ipArrayList.length; i++) {
                // if ip address has a cidr # then calculate the start and end block of ip address
                if (ipArrayList[i].includes('/')) {
                        if (ipArrayList[i].includes(':')) {
                                let i6StartEnd = findIPv6Block(ipArrayList[i]);
                                ipv6ObjectArray.push(new IPStartEndBlock(v6ToInteger(i6StartEnd[0]), v6ToInteger(i6StartEnd[1])));
                        } else {
                                let startEndValues = findIPBlock(ipArrayList[i]);
                                ipv4ObjectArray.push(new IPStartEndBlock(ipToIntegerConversion(startEndValues[0]), ipToIntegerConversion(startEndValues[1])));    
                        }

                } else {
                        // if ip address does not contain cidr value push the same ip start/end value to ip array object
                        if (ipArrayList[i].includes(':')) {
                                let i6StartEnd = findIPv6Block(ipArrayList[i] + '/128')
                                ipv6ObjectArray.push(new IPStartEndBlock(v6ToInteger(i6StartEnd[0]), v6ToInteger(i6StartEnd[1])));
                        } else {
                                ipv4ObjectArray.push(new IPStartEndBlock(ipToIntegerConversion(ipArrayList[i]), ipToIntegerConversion(ipArrayList[i])));
                        }
                }
        }
}


function findIPv6Block(i6Num) {
        let i6Range =[], rebuiltIPV6Begins =[], rebuiltIPV6Ends = [];
        let beginBits = '', i6Begins = '', i6Ends = '', i6HexToBin = '';
        let cidrNum = parseInt(getCidrBlock(i6Num));
        let expaI6 = expandIPv6(i6Num);

        for (let i = 0; i < expaI6.length; i++) {
                let padding = '';
                let test = parseInt(expaI6[i],16).toString(2);
                if (test.length < 16) {
                        let pad = 16 - test.length;
                        for (let i = 0; i < pad; i++) {
                                padding += '0';
                        }
                }
                i6HexToBin += padding + test;
        }

        for (let i = 0; i < cidrNum; i++) {
                beginBits += i6HexToBin.charAt(i);
        }

        i6Begins = beginBits;
        i6Ends = beginBits;

        while (i6Begins.length != 128) {
                i6Begins += '0';
        }

        while (i6Ends.length != 128) {
                i6Ends += '1';
        }


        for (let i = 0; i < i6Begins.length; i+=16) {
                let sect = i6Begins.slice(i,i+16);
                //console.log("parsedSection: "+ parseInt(sect, 16));
                sect = parseInt(sect, 2).toString(16);
                let padSect = '';
                let p;
                if (sect.length < 4) {
                        p = 4 - sect.length;
                }
                for (let i = 0; i < p; i++) {
                        padSect += '0';
                }
                let finalLower = padSect + sect;
                rebuiltIPV6Begins.push(finalLower);
        }

        for (let i = 0; i < i6Ends.length; i+=16) {
                let sect = i6Ends.slice(i,i+16);
                sect = parseInt(sect, 2).toString(16);
                let padSect = '';
                let p;
                if (sect.length < 4) {
                        p = 4 - sect.length;
                }
                for (let i = 0; i < p; i++) {
                        padSect += '0';
                }
                let finalUpper = padSect + sect;
                rebuiltIPV6Ends.push(finalUpper);
                
        }
        i6Range.push(rebuiltIPV6Begins);
        i6Range.push(rebuiltIPV6Ends);
        return i6Range;
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

function expandIPv6(ipv6String) {
        let expandedIPv6 = [];
        let expandedIPv6String = '';
        let tempString = ipv6String.split('/');
        const v6Cidr = tempString[1];

        if (tempString[0].includes('::')) {
                let tempSplit = tempString[0].split('::');
                //console.log("tempory split: " + tempSplit);
                

                let leftBlocks = tempSplit[0].split(':');
                //console.log("left blocks: " + leftBlocks);
                let rightBlocks = tempSplit[1].split(':');
                //console.log("right blocks: " + rightBlocks);

                let leftSize = leftBlocks.length;
                //console.log("left Size: " + leftSize);
                let rightSize = rightBlocks.length;
                //console.log("right Size: " + rightSize);
                let missingBlockSize = 8 - (leftSize + rightSize);

                for (let i = 0; i < leftSize; i++) {
                        expandedIPv6.push(leftBlocks[i]);
                }

                for (let i = 0; i < missingBlockSize; i++) {
                        expandedIPv6.push('0000');
                }

                for (let i = 0; i < rightSize; i++) {
                        expandedIPv6.push(rightBlocks[i]);
                }
                
        } else {
                expandedIPv6 = tempString[0].split(':');
        }

        for (let i = 0; i < expandedIPv6.length; i++) {
                expandedIPv6[i] = padHextet(expandedIPv6[i]);
                expandedIPv6String += expandedIPv6[i];
        }


        return expandedIPv6;
}


function padHextet(hextet) {
        let paddedHextet = hextet;
        if (paddedHextet.length === 4) {
                return paddedHextet;
        } else {
                let missingBits = 4 - paddedHextet.length;
                for (let i = 0; i < missingBits; i++) {
                        paddedHextet = '0' + paddedHextet;
                }
                return paddedHextet;
        }
}

function getCidrBlock(ip) {
        if (ip.includes('/')) {
                return ip.split('/')[1];
        }
}

function sortArray(array) {
        array.sort(function(a,b) {
                return a.start - b.start;
        });
}

function banCheckMiddleware(options) {
       createIPObject(loadIPList(options.source));
       console.log(ipv4ObjectArray);
       console.log(ipv6ObjectArray);

        return function(req, res, next) {
                const ip = req.headers['cf-connecting-ip'] || req.ip;
                if (ip.includes(':')) {
                        //IPv6
                        const convertedIP = v6ToInteger(expandIPv6(ip));
                        const isv6Banned = ipv6ObjectArray.some(block => {
                                convertedIP >= block.start && convertedIP <= block.end
                        });
                        if (isv6Banned) return res.status(403).send('ACCESS-DENIED');
                } else {
                        //IPv4
                        const convertedIP = ipToIntegerConversion(ip);
                        const isv4Banned = ipv4ObjectArray.some(block => {
                                convertedIP >= block.start && convertedIP <= block.end
                        });
                        if (isv4Banned) return res.status(403).send('ACCESS-DENIED');
                }
        next();
        }
}

module.exports = banCheckMiddleware;
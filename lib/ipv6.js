const cidr = require('./util');
function v6ToInteger(i6n) {
        return BigInt("0x"+i6n[0]) * (2n**16n)**7n + BigInt("0x"+i6n[1]) * (2n**16n)**6n + BigInt("0x"+i6n[2]) * (2n**16n)**5n + BigInt("0x"+i6n[3]) * (2n**16n)**4n + BigInt("0x"+i6n[4]) * (2n**16n)**3n + BigInt("0x"+i6n[5]) * (2n**16n)**2n + BigInt("0x"+i6n[6]) * (2n**16n)**1n + BigInt("0x"+i6n[7]);
}

function findIPv6Block(i6Num) {
        let i6Range =[], rebuiltIPV6Begins =[], rebuiltIPV6Ends = [];
        let beginBits = '', i6Begins = '', i6Ends = '', i6HexToBin = '';
        let cidrNum = parseInt(cidr.getCidrBlock(i6Num));
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

module.exports = {
        v6ToInteger,
        findIPv6Block,
        expandIPv6,
        padHextet
};
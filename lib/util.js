function getCidrBlock(ip) {
        if (ip.includes('/')) {
                return ip.split('/')[1];
        }
}

function IPStartEndBlock(start, end) {
        this.start = start;
        this.end = end;
}

function sortArray(array) {
        array.sort(function(a,b) {
                return a.start - b.start;
        });
}

module.exports = {
        getCidrBlock,
        IPStartEndBlock,
        sortArray
};
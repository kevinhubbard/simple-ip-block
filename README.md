# simple-ip-block

A lightweight Node.js package to block and manage IP addresses easily.

## Features

- Add or remove blocked IPs dynamically
- Check if an IP is blocked
- Simple and easy to integrate with Express or other Node.js apps

## Installation

```bash
npm install simple-ip-block
```
## Usage

```javascript
const banCheck = require('simple-ip-block');
app.use(banCheck({source: './bannedIP.txt'}));
```

## Text file format
> [!NOTE]
> Text file should contain only 1 IP address per line using one of the following formats.
- IPv4 addresses, IPv4 CIDR ranges, IPv6 addresses, IPv6 CIDR ranges

192.168.1.1
192.168.1.1/24
2001:0db8:85a3:0000:0000:8a2e:0370:7334
2001:0db8:85a3::0370:7334
2001:0db8::1/66


## Task list
- [x] Add IPv6 functionality
- [ ] Refactor functions
- [ ] Modularize code
- [ ] Quicksort
- [ ] Binary search for faster loading
- [ ] \(Optional) Seralize object for even faster loading is textfile is unchanged
- [ ] Add delight to the experience when all tasks are complete :tada:
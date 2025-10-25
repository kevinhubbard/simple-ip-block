# simple-ip-block
Is a lightweight Node.js package that can block and manage single IP addresses or entire CIDR blocks easily.

## Features
- Add or remove IPs dynamically via text file
- Checks if an IP is banned
- Sends the banned IP a 403 response [^1][^2] 
- Simple and easy to integrate with Express or other Node.js apps

## Installation
```bash
npm install simple-ip-block
```

## Usage
```javascript
const banCheck = require('simple-ip-block');
app.use(banCheck({source: './bannedList.txt'}));
```

## Text file format
> [!NOTE]
> Text file should contain only 1 IP address per line using one of the following formats.
- IPv4 addresses, IPv4 CIDR ranges, IPv6 addresses, IPv6 CIDR ranges
```
192.168.1.1
192.168.1.1/24
2001:0db8:85a3:0000:0000:8a2e:0370:7334
2001:0db8:85a3::0370:7334
2001:db8::1/66
```

## Task list
- [x] Add IPv6 functionality
- [ ] Refactor/Modularize
- [ ] Add quicksort and binary search functionality for faster loading
- [ ] \(Optional) Seralize object for even faster loading if textfile is unchanged
- [ ] Add delight to the experience when all tasks are complete :tada:

[^1]: This middleware sends a 403 response to banned IPs; they can still make requests, but no assets are delivered (bandwidth may still be used).
[^2]: To completely prevent problem IPs requests from reaching your server, create a firewall rule through your proxy.
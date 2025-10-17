# simple-ip-block

A lightweight Node.js package to block and manage IP addresses easily.

## Features

- Add or remove blocked IPs dynamically
- Check if an IP is blocked
- Simple and easy to integrate with Express or other Node.js apps

## Installation

```bash
npm install simple-ip-block

## Usage
const banCheck = require('simple-ip-block');
app.use(banCheck({source: './bannedIP.txt'}));

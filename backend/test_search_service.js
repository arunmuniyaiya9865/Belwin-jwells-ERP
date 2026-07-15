const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const loanSearchService = require('./services/loanSearchService');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      console.log('\n--- Testing Search Service with 9845678453 ---');
      const result = await loanSearchService.searchLoans('9845678453');
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.log('Error on 9845678453:', e.message);
    }

    try {
      console.log('\n--- Testing Search Service with LOAN000001 ---');
      const result2 = await loanSearchService.searchLoans('LOAN000001');
      console.log(JSON.stringify(result2, null, 2));
    } catch (e) {
      console.log('Error on LOAN000001:', e.message);
    }
    
    process.exit(0);
  });

const dns = require('dns');

const srvRecord = '_mongodb._tcp.cluster0.0lv7zp.mongodb.net';

console.log(`Checking SRV record for: ${srvRecord}`);

dns.resolveSrv(srvRecord, (err, addresses) => {
  if (err) {
    console.error('SRV Resolution Failed:', err.code, err.message);
    
    // Try resolving the base domain
    dns.resolve4('cluster0.0lv7zp.mongodb.net', (err2, addrs) => {
      if (err2) {
        console.error('Base Domain Resolution Failed:', err2.code, err2.message);
      } else {
        console.log('Base Domain Resolved to:', addrs);
      }
    });
  } else {
    console.log('SRV Resolution Success:', addresses);
  }
});

// Also check TXT records (used for options in srv)
dns.resolveTxt('cluster0.0lv7zp.mongodb.net', (err, records) => {
  if (err) {
    console.error('TXT Resolution Failed:', err.code, err.message);
  } else {
    console.log('TXT Resolution Success:', records);
  }
});

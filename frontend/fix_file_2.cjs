const fs = require('fs');

const currentFile = fs.readFileSync('src/pages/employee/payment/ReceivePayment.jsx', 'utf8');
const originalFile = fs.readFileSync('../original_ReceivePayment.txt', 'utf8');

const topPart = currentFile.split('<label className={lbl}>Amount Received')[0];
const bottomPart = originalFile.split('<label className={lbl}>Amount Received')[1];

fs.writeFileSync('src/pages/employee/payment/ReceivePayment.jsx', topPart + '<label className={lbl}>Amount Received' + bottomPart, 'utf8');
console.log('Fixed');

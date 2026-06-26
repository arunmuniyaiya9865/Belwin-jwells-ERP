const mongoose = require('mongoose');
const Payment = require('./models/Payment');
const Customer = require('./models/Customer').Customer;

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/belwin');

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const matchQuery = {
    paymentDate: {
      $gte: new Date('2024-01-01'), // test start
      $lte: endOfDay
    }
  };

  const payments = await Payment.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'customers',
        localField: 'customerId',
        foreignField: 'customerId',
        as: 'customerDetails'
      }
    },
    {
      $unwind: { path: '$customerDetails', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        date: '$paymentDate',
        customerId: '$customerId',
        customerName: { $ifNull: ['$customerDetails.customerName', 'Unknown Customer'] },
        loanId: '$loanId',
        principalAmount: { $ifNull: ['$principalAmount', 0] },
        interestAmount: { $ifNull: ['$interestAmount', 0] },
        documentCharges: { $ifNull: ['$penaltyAmount', 0] },
        paymentMode: '$paymentMode',
        employeeName: '$collectedBy'
      }
    },
    {
      $addFields: {
        totalAmount: {
          $add: ['$principalAmount', '$interestAmount', '$documentCharges']
        }
      }
    }
  ]);

  // Aggregate summary
  const totalCustomers = new Set(payments.map(p => p.customerId)).size;
  const totalPrincipal = payments.reduce((acc, curr) => acc + curr.principalAmount, 0);
  const totalInterest = payments.reduce((acc, curr) => acc + curr.interestAmount, 0);
  const totalDocumentCharges = payments.reduce((acc, curr) => acc + curr.documentCharges, 0);
  const grandTotal = totalPrincipal + totalInterest + totalDocumentCharges;

  const result = {
    summary: {
      totalCustomersCollected: totalCustomers,
      totalPrincipalCollection: totalPrincipal,
      totalInterestCollection: totalInterest,
      totalDocumentCharges: totalDocumentCharges,
      totalCollectionAmount: grandTotal
    },
    tableData: payments
  };

  console.log(JSON.stringify(result, null, 2));
  mongoose.disconnect();
}
run();

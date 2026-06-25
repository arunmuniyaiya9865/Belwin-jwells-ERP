const GoldStock = require('../models/GoldStock');

// Get all gold stock
exports.getGoldStocks = async (req, res) => {
    try {
        const stocks = await GoldStock.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: stocks });
    } catch (error) {
        console.error('Error fetching gold stock:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gold stock', error: error.message });
    }
};

// Get single gold stock by stockId
exports.getGoldStockById = async (req, res) => {
    try {
        const stock = await GoldStock.findOne({ stockId: req.params.stockId });
        if (!stock) {
            return res.status(404).json({ success: false, message: 'Stock not found' });
        }
        res.status(200).json({ success: true, data: stock });
    } catch (error) {
        console.error('Error fetching gold stock:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gold stock', error: error.message });
    }
};

// Get gold stock for a specific loan
exports.getGoldStockByLoanId = async (req, res) => {
    try {
        const stocks = await GoldStock.find({ loanId: req.params.loanId });
        res.status(200).json({ success: true, data: stocks });
    } catch (error) {
        console.error('Error fetching gold stock for loan:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gold stock for loan', error: error.message });
    }
};

// Centralized GoldStock Synchronization Utility
exports.syncGoldStockStatus = async (loanId, loanStatus) => {
    try {
        let newStockStatus = 'In Stock';
        if (loanStatus === 'Closed') {
            newStockStatus = 'Released';
        } else if (loanStatus === 'Auction Ready') {
            newStockStatus = 'Auction Ready';
        } else if (loanStatus === 'Auctioned') {
            newStockStatus = 'Auctioned';
        } else if (['Active', 'Overdue', 'TopUp', 'Repledged'].includes(loanStatus)) {
            newStockStatus = 'In Stock';
        }

        await GoldStock.updateMany(
            { loanId: loanId },
            { $set: { status: newStockStatus } }
        );
        console.log(`GoldStock sync complete for Loan ${loanId} -> Status: ${newStockStatus}`);
    } catch (error) {
        console.error(`Failed to sync GoldStock status for Loan ${loanId}:`, error);
    }
};

// Get reporting data with filters and aggregations
exports.getGoldStockReport = async (req, res) => {
    try {
        const { stockId, loanId, customerId, status, fromDate, toDate } = req.query;
        let filter = {};

        if (stockId) filter.stockId = new RegExp(stockId, 'i');
        if (loanId) filter.loanId = new RegExp(loanId, 'i');
        if (customerId) filter.customerId = new RegExp(customerId, 'i');
        if (status) filter.status = status;
        
        if (fromDate || toDate) {
            filter.stockDate = {};
            if (fromDate) filter.stockDate.$gte = new Date(fromDate);
            if (toDate) filter.stockDate.$lte = new Date(toDate);
        }

        const stocks = await GoldStock.find(filter).sort({ stockDate: -1, createdAt: -1 });

        let totalArticles = stocks.length;
        let totalGrossWeight = 0;
        let totalNetWeight = 0;
        let auctionReadyArticles = 0;

        stocks.forEach(stock => {
            totalGrossWeight += (stock.grossWeight || 0);
            totalNetWeight += (stock.netWeight || 0);
            if (stock.status === 'Auction Ready') {
                auctionReadyArticles += 1;
            }
        });

        res.status(200).json({
            success: true,
            data: stocks,
            summary: {
                totalArticles,
                totalGrossWeight: parseFloat(totalGrossWeight.toFixed(2)),
                totalNetWeight: parseFloat(totalNetWeight.toFixed(2)),
                auctionReadyArticles
            }
        });
    } catch (error) {
        console.error('Error fetching gold stock report:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gold stock report', error: error.message });
    }
};

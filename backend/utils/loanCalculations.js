/**
 * Core Calculation Engine for Jewellery Finance ERP - BACKEND
 * These utilities handle all calculations for loans and gold values.
 * Acts as the SINGLE SOURCE OF TRUTH for financial validation.
 */

// 1. Article Calculations
const calculateNetWeight = (totalWeight = 0, stoneWeight = 0) => {
    const netWeight = Number(totalWeight) - Number(stoneWeight);
    return netWeight < 0 ? 0 : Number(netWeight.toFixed(3));
};

const calculateArticleValue = (netWeight = 0, gramRate = 0) => {
    return Number((Number(netWeight) * Number(gramRate)).toFixed(2));
};

const calculateTotalGoldWeight = (articles = []) => {
    return articles.reduce((sum, article) => sum + (Number(article.nettWt) || 0), 0);
};

const calculateTotalGoldValue = (articles = []) => {
    return articles.reduce((sum, article) => sum + (Number(article.total) || 0), 0);
};

// 2. Loan Amount Calculations
const calculateEligibleLoanAmount = (totalGoldValue = 0, loanPercentage = 75) => {
    const percent = Number(loanPercentage) || 0;
    return Number(((Number(totalGoldValue) * percent) / 100).toFixed(2));
};

// 3. Interest Calculations
const calculateInterest = (loanAmount = 0, interestPercent = 0, isYearly = false) => {
    const interest = (Number(loanAmount) * Number(interestPercent)) / 100;
    return Number(interest.toFixed(2));
};

// 4. Date Calculations
const calculateLoanEndDate = (startDate, loanPeriodMonths = 0) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + Number(loanPeriodMonths));
    return date.toISOString().split('T')[0];
};

const calculateTotalDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const calculateRemainingDays = (endDate, currentDate = new Date()) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const today = new Date(currentDate);
    const diffTime = end - today;
    return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
};

// 5. Settlement Calculations
const calculateSettlementAmount = (remainingLoan = 0, remainingInterest = 0, penalty = 0, documentCharge = 0) => {
    return Number((
        Number(remainingLoan) +
        Number(remainingInterest) +
        Number(penalty) +
        Number(documentCharge)
    ).toFixed(2));
};

module.exports = {
    calculateNetWeight,
    calculateArticleValue,
    calculateTotalGoldWeight,
    calculateTotalGoldValue,
    calculateEligibleLoanAmount,
    calculateInterest,
    calculateLoanEndDate,
    calculateTotalDays,
    calculateRemainingDays,
    calculateSettlementAmount
};

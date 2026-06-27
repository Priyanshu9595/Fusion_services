// Utility for exact GST calculations

const calculateLineItem = (qty, unitPrice, gstPercent) => {
    const subtotal = Number((qty * unitPrice).toFixed(2));
    const gstAmount = Number(((subtotal * gstPercent) / 100).toFixed(2));
    const total = Number((subtotal + gstAmount).toFixed(2));
    
    return { subtotal, gstAmount, total };
};

const calculateDocumentTotals = (items, discount = 0) => {
    let subtotal = 0;
    let totalGst = 0;
    
    const processedItems = items.map(item => {
        const calc = calculateLineItem(item.qty, item.unit_price, item.gst_percent);
        subtotal += calc.subtotal;
        totalGst += calc.gstAmount;
        return {
            ...item,
            line_subtotal: calc.subtotal,
            line_gst_amount: calc.gstAmount,
            line_total: calc.total
        };
    });

    // Apply discount to subtotal if any (for MVP, let's assume flat discount on grand total or subtotal)
    // Here we will keep it simple: Grand Total = Subtotal + Total GST - Discount
    const grandTotal = Number((subtotal + totalGst - discount).toFixed(2));
    
    return {
        items: processedItems,
        subtotal: Number(subtotal.toFixed(2)),
        totalGst: Number(totalGst.toFixed(2)),
        grandTotal
    };
};

module.exports = { calculateLineItem, calculateDocumentTotals };

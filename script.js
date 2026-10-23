const invoiceItems = document.querySelectorAll("#invoice-items tr");

const subtotalElement = document.getElementById("subtotal");
const gstElement = document.getElementById("gst");
const grandTotalElement = document.getElementById("grand-total");

const GST_RATE = 0.18;

// Format amount in Indian Rupees
function formatCurrency(amount) {
    return amount.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Calculate invoice totals
function calculateInvoice() {
    let subtotal = 0;

    invoiceItems.forEach(function (row) {
        const quantityInput = row.querySelector(".qty");
        const rateInput = row.querySelector(".rate");
        const amountElement = row.querySelector(".amount");

        const quantity = Math.max(1, Number(quantityInput.value) || 1);
        const rate = Math.max(0, Number(rateInput.value) || 0);

        // Calculate amount for each item
        const amount = quantity * rate;

        amountElement.textContent = formatCurrency(amount);

        // Add item amount to subtotal
        subtotal += amount;
    });

    // Calculate GST and grand total
    const gst = subtotal * GST_RATE;
    const grandTotal = subtotal + gst;

    subtotalElement.textContent = formatCurrency(subtotal);
    gstElement.textContent = formatCurrency(gst);
    grandTotalElement.textContent = formatCurrency(grandTotal);
}

// Recalculate whenever quantity or rate changes
invoiceItems.forEach(function (row) {
    const quantityInput = row.querySelector(".qty");
    const rateInput = row.querySelector(".rate");

    quantityInput.addEventListener("input", calculateInvoice);
    rateInput.addEventListener("input", calculateInvoice);
});

// Calculate totals when the page loads
calculateInvoice();
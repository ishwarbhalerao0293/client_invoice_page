"use strict";

const itemsBody = document.getElementById("invoice-items");
const countrySelect = document.getElementById("client-country");
const stateSelect = document.getElementById("client-state");
const gstSelect = document.getElementById("gst-rate");
const igstSelect = document.getElementById("igst-rate");

const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

function money(paise) {
    return currency.format(paise / 100);
}

function fillTaxDropdown(select) {
    for (let rate = 1; rate <= 20; rate++) {
        const option = document.createElement("option");
        option.value = String(rate);
        option.textContent = rate + "%";

        if (rate === 18) {
            option.selected = true;
        }

        select.appendChild(option);
    }
}

fillTaxDropdown(gstSelect);
fillTaxDropdown(igstSelect);

const initialItems = [
    { name: "Wheat Seeds", qty: 10, rate: 500 },
    { name: "Organic Fertilizer", qty: 5, rate: 800 },
    { name: "Neem Oil", qty: 4, rate: 350 },
    { name: "Drip Irrigation Pipe", qty: 3, rate: 1200 },
    { name: "Agriculture Sprayer", qty: 2, rate: 1500 }
];

const rates = [
    0, 50, 100, 200, 250, 300, 350, 400, 500,
    600, 700, 800, 900, 1000, 1200, 1500, 2000,
    2500, 3000, 5000, 10000, 15000, 20000
];

function createDropdown(values, selectedValue, type) {
    const select = document.createElement("select");
    select.className = type;

    values.forEach(value => {
        const option = document.createElement("option");
        option.value = String(value);
        option.textContent = type === "rate"
            ? currency.format(value)
            : String(value);

        if (value === selectedValue) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    return select;
}

function createRow(item) {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "item-name";
    nameInput.value = item.name;
    nameInput.setAttribute("aria-label", "Item name");
    nameCell.appendChild(nameInput);

    const qtyCell = document.createElement("td");
    const quantities = Array.from({ length: 101 }, (_, i) => i);
    qtyCell.appendChild(createDropdown(quantities, item.qty, "qty"));

    const rateCell = document.createElement("td");
    rateCell.appendChild(createDropdown(rates, item.rate, "rate"));

    const amountCell = document.createElement("td");
    amountCell.className = "amount";
    amountCell.textContent = money(0);

    row.append(nameCell, qtyCell, rateCell, amountCell);
    return row;
}

initialItems.forEach(item => {
    itemsBody.appendChild(createRow(item));
});

function calculateInvoice() {
    let subtotal = 0;

    itemsBody.querySelectorAll("tr").forEach(row => {
        const qty = Number(row.querySelector(".qty").value);
        const rate = Number(row.querySelector(".rate").value);
        const amount = Math.round(qty * rate * 100);

        row.querySelector(".amount").textContent = money(amount);
        subtotal += amount;
    });

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const isIndia = countrySelect.value === "India";
    const isMaharashtra = stateSelect.value === "Maharashtra";

    const gstSettings = document.getElementById("gst-settings");
    const igstSettings = document.getElementById("igst-settings");
    const cgstRow = document.getElementById("cgst-row");
    const sgstRow = document.getElementById("sgst-row");
    const igstRow = document.getElementById("igst-row");

    if (!isIndia) {
        gstSettings.hidden = true;
        igstSettings.hidden = true;
        cgstRow.hidden = true;
        sgstRow.hidden = true;
        igstRow.hidden = true;

        document.getElementById("tax-mode").textContent =
            "Tax type: GST not calculated in this demo";
    } else if (isMaharashtra) {
        gstSettings.hidden = false;
        igstSettings.hidden = true;
        cgstRow.hidden = false;
        sgstRow.hidden = false;
        igstRow.hidden = true;

        const gstRate = Number(gstSelect.value);
        const halfRate = gstRate / 2;
        const totalGST = Math.round(subtotal * gstRate / 100);

        cgst = Math.floor(totalGST / 2);
        sgst = totalGST - cgst;

        document.getElementById("cgst-label").textContent =
            `CGST (${halfRate}%)`;
        document.getElementById("sgst-label").textContent =
            `SGST (${halfRate}%)`;

        document.getElementById("tax-mode").textContent =
            "Tax type: CGST + SGST";
    } else {
        gstSettings.hidden = true;
        igstSettings.hidden = false;
        cgstRow.hidden = true;
        sgstRow.hidden = true;
        igstRow.hidden = false;

        const igstRate = Number(igstSelect.value);
        igst = Math.round(subtotal * igstRate / 100);

        document.getElementById("igst-label").textContent =
            `IGST (${igstRate}%)`;

        document.getElementById("tax-mode").textContent =
            "Tax type: IGST";
    }

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("cgst").textContent = money(cgst);
    document.getElementById("sgst").textContent = money(sgst);
    document.getElementById("igst").textContent = money(igst);

    document.getElementById("grand-total").textContent =
        money(subtotal + cgst + sgst + igst);
}

itemsBody.addEventListener("change", calculateInvoice);
countrySelect.addEventListener("change", calculateInvoice);
stateSelect.addEventListener("change", calculateInvoice);
gstSelect.addEventListener("change", calculateInvoice);
igstSelect.addEventListener("change", calculateInvoice);

document.getElementById("print-invoice").addEventListener("click", () => {
    calculateInvoice();
    window.print();
});

document.getElementById("download-pdf").addEventListener("click", () => {
    calculateInvoice();
    window.print();
});

const dateInput = document.getElementById("invoice-date");
const today = new Date();

dateInput.value = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().slice(0, 10);

calculateInvoice();
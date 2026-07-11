/** @format */

function calculateTotal() {
  let table = document.getElementById("quotation-body");
  let rows = table.getElementsByTagName("tr");
  let subTotal = 0;

  // Loop through each row to calculate the amount and update the subTotal
  for (let i = 0; i < rows.length; i++) {
    let cells = rows[i].getElementsByTagName("td");
    let quantity = parseFloat(cells[3].textContent.trim()) || 0; // Quantity
    let unitPrice = parseFloat(cells[4].textContent.trim()) || 0; // Unit Price
    let amount = quantity * unitPrice; // Calculate amount

    // Update the "Amount" cell
    cells[5].innerText = amount.toFixed(2);

    // Add to the subTotal
    subTotal += amount;
  }

  // Update the Sub Total
  document.getElementById("subTotal").innerText = subTotal.toFixed(2);

  // Get CGST and SGST rates from user input
  let cgstRate = parseFloat(document.getElementById("cgstRate").value) || 0;
  let sgstRate = parseFloat(document.getElementById("sgstRate").value) || 0;

  // Calculate Tax amounts
  let cgstAmount = (subTotal * cgstRate) / 100;
  let sgstAmount = (subTotal * sgstRate) / 100;
  let totalTaxAmount = cgstAmount + sgstAmount;

  let cgstAmountEl = document.getElementById("cgstAmount");
  if (cgstAmountEl) cgstAmountEl.innerText = cgstAmount.toFixed(2);

  let sgstAmountEl = document.getElementById("sgstAmount");
  if (sgstAmountEl) sgstAmountEl.innerText = sgstAmount.toFixed(2);

  // Calculate Grand Total
  let grandTotal = subTotal + totalTaxAmount;
  document.getElementById("grandTotal").innerText = grandTotal.toFixed(2);

  // Convert Grand Total to words and update the in-words section (if element exists)
  let amountInWordsEl = document.getElementById("amountInWords");
  if (amountInWordsEl) {
    amountInWordsEl.innerText = numberToWords(grandTotal).toUpperCase() + " RUPEES ONLY";
  }
}

function addRow() {
  let table = document.getElementById("quotation-body");
  let newRow = table.insertRow(-1); // Insert at the end
  let rowCount = table.rows.length;

  // Insert cells
  let cell1 = newRow.insertCell(0); // Sr. No.
  let cell2 = newRow.insertCell(1); // Description
  let cell3 = newRow.insertCell(2); // HNC No.
  let cell4 = newRow.insertCell(3); // Quantity
  let cell5 = newRow.insertCell(4); // Unit Price
  let cell6 = newRow.insertCell(5); // Amount

  // Set cell content
  cell1.innerText = rowCount; // Auto-increment Sr. No.
  cell2.contentEditable = true; // Editable Description
  cell2.innerText = "";
  cell3.contentEditable = true; // Editable HNC No.
  cell3.innerText = "";
  cell4.contentEditable = true; // Editable Quantity
  cell4.innerText = "0";
  cell5.contentEditable = true; // Editable Unit Price
  cell5.innerText = "0";
  cell6.innerText = "0"; // Amount (auto-calculated)

  // Add oninput event to the new row's Quantity and Unit Price cells
  cell4.oninput = calculateTotal;
  cell5.oninput = calculateTotal;
}

function removeRow() {
  let table = document.getElementById("quotation-body");
  let rowCount = table.rows.length;
  if (rowCount > 1) {
    table.deleteRow(rowCount - 1);
    calculateTotal();
  }
}

// Function to convert numbers to words
function numberToWords(num) {
  const a = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  const g = ["", "thousand", "million", "billion", "trillion"];

  if (typeof num !== "number" || isNaN(num)) return "";

  let words = [];
  let numStr = num.toString();
  let numArr = numStr.split(".");

  let integerPart = parseInt(numArr[0]);
  let decimalPart = numArr[1] ? parseInt(numArr[1]) : 0;

  if (integerPart === 0) words.push("zero");

  let groupIndex = 0;
  while (integerPart > 0) {
    let group = integerPart % 1000;
    if (group !== 0) {
      let groupWords = [];
      if (group > 99) {
        groupWords.push(a[Math.floor(group / 100)]);
        groupWords.push("hundred");
        group %= 100;
      }
      if (group > 19) {
        groupWords.push(b[Math.floor(group / 10)]);
        group %= 10;
      }
      if (group > 0) {
        groupWords.push(a[group]);
      }
      groupWords.push(g[groupIndex]);
      words.unshift(groupWords.join(" "));
    }
    integerPart = Math.floor(integerPart / 1000);
    groupIndex++;
  }

  if (decimalPart > 0) {
    words.push("and");
    words.push(a[decimalPart]);
    words.push("paise");
  }

  return words.join(" ");
}

// Initial calculation on page load
calculateTotal();

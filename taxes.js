let taxes= [
    {
      "name": "61945rmf0g",
      "owner": "kunal.m@jcssglobal.com",
      "creation":(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(6, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
      })(),
      "modified":(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(6, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
      })(),
      "modified_by": "kunal.m@jcssglobal.com",
      "docstatus": 0,
      "idx": 1,
      "charge_type": "On Net Total",
      "account_head": "Output Tax SGST - HFABPL",
      "description": "Output Tax SGST",
      "included_in_print_rate": 0,
      "included_in_paid_amount": 0,
      "cost_center": "Head Office - HFABPL",
      "rate": 0,
      "gst_tax_type": "sgst",
      "account_currency": "INR",
      "tax_amount": 45.69,
      "total": 979.84,
      "tax_amount_after_discount_amount": 45.69,
      "base_tax_amount": 45.69,
      "base_total": 979.84,
      "base_tax_amount_after_discount_amount": 45.69,
      "item_wise_tax_detail": "{\"6 SECONDS FILTER COFFEE DECOCTION-PACK OF 5\":[9,41.64],\"BANANA CAKE (OFA)\":[0,0],\"Premium Kaapi (Serves 5)\":[2.5,4.05],\"SPINACH & CORN SANDWICH (OFA)\":[0,0],\"Mysore Coffee Flask (Serves 2) (220 ml) (OFA)\":[0,0]}",
      "dont_recompute_tax": 0,
      "parent": "SINV-KL-00015",
      "parentfield": "taxes",
      "parenttype": "Sales Invoice",
      "doctype": "Sales Taxes and Charges"
    },
    {
      "name": "o2bh0hokp0",
      "owner": "kunal.m@jcssglobal.com",
      "creation": (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(6, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
      })(),
      "modified": (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(6, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
      })(),
      "modified_by": "kunal.m@jcssglobal.com",
      "docstatus": 0,
      "idx": 2,
      "charge_type": "On Net Total",
      "account_head": "Output Tax CGST - HFABPL",
      "description": "Output Tax CGST",
      "included_in_print_rate": 0,
      "included_in_paid_amount": 0,
      "cost_center": "Head Office - HFABPL",
      "rate": 0,
      "gst_tax_type": "cgst",
      "account_currency": "INR",
      "tax_amount": 45.69,
      "total": 1025.53,
      "tax_amount_after_discount_amount": 45.69,
      "base_tax_amount": 45.69,
      "base_total": 1025.53,
      "base_tax_amount_after_discount_amount": 45.69,
      "item_wise_tax_detail": "{\"6 SECONDS FILTER COFFEE DECOCTION-PACK OF 5\":[9,41.64],\"BANANA CAKE (OFA)\":[0,0],\"Premium Kaapi (Serves 5)\":[2.5,4.05],\"SPINACH & CORN SANDWICH (OFA)\":[0,0],\"Mysore Coffee Flask (Serves 2) (220 ml) (OFA)\":[0,0]}",
      "dont_recompute_tax": 0,
      "parent": "SINV-KL-00015",
      "parentfield": "taxes",
      "parenttype": "Sales Invoice",
      "doctype": "Sales Taxes and Charges"
    }
  ]

  module.exports = taxes
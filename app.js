const express = require("express");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const path = require("path");
require("dotenv").config();
const sheet = require("./latestMasterData.json");

const obj = require("./output");
const taxes = require("./taxes");
const test = require("./testupload");
const cron = require("node-cron");
const app = express();
const allbranch = require("./latestBranchName.json");
const nodemailer = require('nodemailer');
let pool;
// Initialize connection pool
const initializePool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306, // Use default port if not provided
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true', // Convert string to boolean
      },
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 2, // Adjustable via environment
      queueLimit: Number(process.env.DB_QUEUE_LIMIT) || 0, // Default to 0
    });
    console.log("Connection pool initialized!");
  }
  return pool;
};

// Query function using the pool
const query = async (sql, params, retries = 3) => {
  const pool = initializePool();
  while (retries > 0) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      if (error.code === "ER_USER_LIMIT_REACHED" && retries > 0) {
        console.log(`Retrying query... (${3 - retries} retries left)`);
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 1 second
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached for query execution.");
};

const apiKey = "8d3b20c0-296d-4e50-926b-1da264da401e";
const secretKey = "qkCOlbB8C-drun-3XjhqV0r93I0YPFxU2oMfyNMNAos";

// // Utility to generate JWT token
const generateToken = () => {
  const tokenCreationTime = Math.floor(Date.now() / 1000);
  const payload = {
    iss: apiKey,
    iat: tokenCreationTime,
  };
  return jwt.sign(payload, secretKey);
};
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Function to send email with error details
const sendErrorMail = async (branch, error, token) => {
  try {
    const subject =  `Branch ${branch} having error in date ${token}`;
    const htmlContent = `
      <h2>Error Notification</h2>
      <p><strong>Branch:</strong> ${branch}</p>
      <p><strong>Date:</strong> ${token}</p>
      <p><strong>Error:</strong> ${error}</p>
      <p>An error occurred while processing the sales summary. Please investigate further.</p>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: ["dharmendra@avidusinteractive.com"
      ], // Send email to yourself or other recipients
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Error notification email sent:', info.messageId);
  } catch (mailError) {
    console.error('Error while sending email notification:', mailError.message);
  }
};
const fetchSalesSummary = async () => {
  const token = generateToken();
  console.log(token)
  let branch_list;
  try {
    branch_list = await axios.get("https://api.ristaapps.com/v1/branch/list", {
      headers: {
        "x-api-key": apiKey,
        "x-api-token": token,
        "content-type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
  const branch_data = branch_list.data;
  console.log(branch_data.length,"branch length")
  if (branch_data.length == 0) {
    return console.log("No Branch fetched!");
  }
  const getOneDayBeforeDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };
  let count=1
  let totalitem=1
  for (let i = 0; i < branch_data.length; i++) {
    let branch = branch_data[i].branchCode;
    let period = getOneDayBeforeDate();
    
    try {
      const response = await axios.get(
        `https://api.ristaapps.com/v1/analytics/sales/summary`,
        {
          params: { branch, period },
          headers: {
            "x-api-key": apiKey,
            "x-api-token": token,
            "Content-Type": "application/json",
          },
        }
      );
      const items = response.data.items;
      console.log(totalitem,"totalcounter")
      totalitem++
      if(items.length!==0){
      
      
      function calculatePercentage(total, percentage) {
        return (total * percentage) / 100;
      }
      let total_SGST = 0;
      let total_CGST = 0;
      let total_taxable_value = 0;
      let item_tax_detail_SGST = {};
      let item_tax_detail_CGST = {};
      let total_qty = 0;
      const transformedItems = await Promise.all(
        items.map(async (item, index) => {
          if(item.itemName){
            const [rows] = await query(
              "SELECT * FROM master_data WHERE rista_name = ?",
              [item.itemName]
            );
           
            const [warehouse] = await query(
              "SELECT * FROM warehouse_data WHERE branch_code = ?",
              [branch]
            );
            warehouse[0] = warehouse;
            
            if(rows !== undefined){
              rows[0] = rows;
            let parse_taxes = JSON.parse(rows[0]?.item_tax_rate)
  
            if (parse_taxes) {
              let SGST_perc = parse_taxes["Output Tax SGST - HFABPL"];
              let CGST_perc = parse_taxes["Output Tax CGST - HFABPL"];
              let tax_amount_SGST = calculatePercentage(
                item.itemTotalgrossAmount - item.itemTotalDiscountAmount,
                SGST_perc
              );
              let tax_amount_CGST = calculatePercentage(
                item.itemTotalgrossAmount - item.itemTotalDiscountAmount,
                CGST_perc
              );
              total_SGST += +tax_amount_SGST;
              total_CGST += +tax_amount_CGST;
              item_tax_detail_SGST[item.itemName] = [SGST_perc, tax_amount_SGST];
              item_tax_detail_CGST[item.itemName] = [CGST_perc, tax_amount_CGST];
            } else {
              item_tax_detail_SGST[item.itemName] = [0, 0];
              item_tax_detail_CGST[item.itemName] = [0, 0];
            }
            total_taxable_value += +(
              item.itemTotalgrossAmount - item.itemTotalDiscountAmount
            );
            total_qty += +item.itemTotalQty;
            
            return {
              docstatus: 0,
              doctype: "Sales Invoice Item",
              name: "new-sales-invoice-item-uicnovjvho",
              __islocal: 1,
              __unsaved: 1,
              owner: "kunal.m@jcssglobal.com",
              has_item_scanned: 0,
              stock_uom: rows[0]?.uom,
              margin_type: "",
              is_free_item: 0,
              grant_commission: 0,
              delivered_by_supplier: 0,
              is_fixed_asset: 0,
              enable_deferred_revenue: 0,
              use_serial_batch_fields: 0,
              allow_zero_valuation_rate: 0,
              page_break: 0,
              parent: "new-sales-invoice-bfbpkipkkt",
              parentfield: "items",
              parenttype: "Sales Invoice",
              idx: index + 1,
              item_code: rows[0]?.erp_new_item_name,
              item_name: rows[0]?.erp_new_item_name,
              qty: item.itemTotalQty,
              uom: rows[0]?.uom,
              rate: item.itemTotalgrossAmount / item.itemTotalQty,
              amount: item.itemTotalgrossAmount,
              discount_amount: item.itemTotalDiscountAmount,
              discount_account: "Discount Allowed - HFABPL",
              taxable_value:
                item.itemTotalgrossAmount - item.itemTotalDiscountAmount,
              description: rows[0]?.erp_new_item_name,
              item_group: rows[0]?.item_group || null,
              income_account: rows[0]?.default_income_account || null,
              warehouse: warehouse[0]?.warehouse_name || null,
              cost_center: warehouse[0]?.cost_centre || null,
              item_tax_template: rows[0]?.item_tax_template || null,
              item_tax_rate: rows[0]?.item_tax_rate || null,
              conversion_factor: 0,
              stock_qty: 0,
              price_list_rate: 0,
              base_price_list_rate: 0,
              margin_rate_or_amount: 0,
              rate_with_margin: 0,
              base_rate_with_margin: 0,
              base_rate: item.itemTotalgrossAmount / item.itemTotalQty,
              base_amount: item.itemTotalgrossAmount,
              stock_uom_rate: 0,
              net_rate: item.itemTotalgrossAmount / item.itemTotalQty,
              net_amount: item.itemTotalgrossAmount,
              base_net_rate: item.itemTotalgrossAmount / item.itemTotalQty,
              base_net_amount: item.itemTotalgrossAmount,
              igst_rate: 0,
              cgst_rate: 0,
              sgst_rate: 0,
              cess_rate: 0,
              cess_non_advol_rate: 0,
              igst_amount: 0,
              cgst_amount: 0,
              sgst_amount: 0,
              cess_amount: 0,
              cess_non_advol_amount: 0,
              weight_per_unit: 0,
              total_weight: 0,
              incoming_rate: 0,
              actual_batch_qty: 0,
              actual_qty: 0,
              company_total_stock: 0,
              delivered_qty: 0,
              has_margin: false,
              child_docname: "new-sales-invoice-item-uicnovjvho",
              discount_percentage: 0,
            };
          }
          }
          
        })
      );
      /*-----------------For taxes SGST--------------------------*/
      taxes[0].tax_amount = +total_SGST.toFixed(2);
      taxes[0].tax_amount_after_discount_amount = +total_SGST.toFixed(2);
      taxes[0].base_tax_amount = +total_SGST.toFixed(2);
      taxes[0].base_tax_amount_after_discount_amount = +total_SGST.toFixed(2);
      taxes[0].total = +(total_taxable_value + total_SGST).toFixed(2);
      taxes[0].base_total = +(total_taxable_value + total_SGST).toFixed(2);
      taxes[0].item_wise_tax_detail = +item_tax_detail_SGST;

      /*-----------------For taxes CGST--------------------------*/
      taxes[1].tax_amount = +total_CGST.toFixed(2);
      taxes[1].tax_amount_after_discount_amount = +total_CGST.toFixed(2);
      taxes[1].base_tax_amount = +total_CGST.toFixed(2);
      taxes[1].base_tax_amount_after_discount_amount = +total_CGST.toFixed(2);
      taxes[1].total = +(total_taxable_value + total_CGST).toFixed(2);
      taxes[1].base_total = +(total_taxable_value + total_CGST).toFixed(2);
      taxes[1].item_wise_tax_detail = +item_tax_detail_CGST;

      obj.base_total = total_taxable_value;
      obj.base_net_total = total_taxable_value;
      obj.total = total_taxable_value;
      obj.net_total = total_taxable_value;
      obj.base_grand_total = total_taxable_value;
      obj.grand_total =
        total_taxable_value + +total_SGST.toFixed(2) + +total_CGST.toFixed(2);
      obj.base_total_taxes_and_charges =
        +total_SGST.toFixed(2) + +total_CGST.toFixed(2);
      obj.total_taxes_and_charges =
        +total_SGST.toFixed(2) + +total_CGST.toFixed(2);
      obj.base_rounded_total = Math.round(
        total_taxable_value + +total_SGST.toFixed(2) + +total_CGST.toFixed(2)
      );
      obj.rounded_total = Math.round(
        total_taxable_value + +total_SGST.toFixed(2) + +total_CGST.toFixed(2)
      );
      obj.outstanding_amount = Math.round(
        total_taxable_value + +total_SGST.toFixed(2) + +total_CGST.toFixed(2)
      );
      obj.base_rounding_adjustment = +(
        obj.base_rounded_total -
        (total_taxable_value + +total_SGST.toFixed(2) + +total_CGST.toFixed(2))
      ).toFixed(2);
      obj.rounding_adjustment = +(
        obj.rounded_total -
        (total_taxable_value + +total_SGST.toFixed(2) + +total_CGST.toFixed(2))
      ).toFixed(2);
      obj.total_qty = total_qty;
      const cleanedArray = transformedItems.filter(item => item !== undefined);
      obj.items = cleanedArray;
      obj.taxes = taxes;
      obj.lr_date=period
      obj.posting_date=period
      obj.due_date=period
      const loginData = JSON.stringify({
        usr: "kunal.m@jcssglobal.com",
        pwd: "jcss@123",
      });

      const loginConfig = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://hktest.frappe.cloud/api/method/login",
        headers: {
          "Content-Type": "application/json",
        },
        data: loginData,
      };

      try {
        // Step 1: Perform login and extract cookies
        const loginResponse = await axios.request(loginConfig);
        const cookies = loginResponse.headers["set-cookie"];

        if (!cookies) {
          return res
            .status(400)
            .json({ error: "Failed to retrieve cookies from login response" });
        }

        // Step 2: Prepare data for the file upload API
        const data = new FormData();
        // console.log(obj)
        data.append("doc", JSON.stringify(obj));
        data.append("action", "Save");
        const uploadConfig = {
          method: "post",
          maxBodyLength: Infinity,
          url: "https://hktest.frappe.cloud/api/method/frappe.desk.form.save.savedocs",
          headers: {
            // ...data.getHeaders(),
            Cookie: cookies.join("; "),
          },
          data: data,
        };

        // Step 3: Perform the file upload
        const uploadResponse = await axios.request(uploadConfig);
        console.log({ uploadResponse: uploadResponse.data,branch:branch });
        console.log(items.length,"count",count,"branchinfo",branch)
      count++
      } catch (error) {
         console.error("Error:", error.response.data);
         sendErrorMail(branch, JSON.stringify(error.response.data),period );
        // console.log({ error: error.message ,branchinfo:branch});
      }
    }
    } catch (error) {
      //console.error("Error fetching sales summary:", error);
      sendErrorMail(branch, error, period);
      console.log(branch,"branch",error,
          "An error occurred while fetching sales summary.",branch,token,
      );
    }
  }
};
// fetchSalesSummary()
// // Schedule the cron job
cron.schedule("5 0 * * *", () => {
  console.log("Running fetch-sales-summary cron job at 12:05 AM");
  fetchSalesSummary();
});

// app.get("/fetch-sales-summary", async (req, res) => {
//  try {
//   fetchSalesSummary();
//   } catch (error) {
//     console.error("Error fetching sales summary:", error);
//     res.status(error.response?.status || 500).json({
//       error:
//         error.response?.data ||
//         "An error occurred while fetching sales summary.",
//     });
//   }
// });

// API to Upload Excel and Store Data in Database
// app.get('/api/upload', async (req, res) => {

//   try {
//     const sheetData=sheet
//     // Insert data into the database
//     for (const row of sheetData) {
//       await query(
//         `INSERT INTO master_data (
//           rista_name, channel_name, erp_new_item_name, uom, item_group,
//           default_income_account, item_tax_template, item_tax_rate, remarks
//         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           row.rista_name || null,
//           row.channel_name || null,
//           row.erp_new_item_name || null,
//           row.uom || null,
//           row.item_group || null,
//           row.default_income_account || null,
//           row.item_tax_template || null,
//           row.item_tax_rate || null,
//           row.remarks || null,
//         ]
//       );
//     }

//     res.status(200).json({ message: 'Data uploaded and stored successfully!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Failed to process file', error });
//   }
// });


// app.get('/api/upload/branch', async (req, res) => {
//   const token = generateToken();

//   try {
//     const sheetData=allbranch
//     console.log(sheetData,"branch")
//     // Insert data into the database
//     for (const row of sheetData) {
//       const data=await query(
//         `INSERT INTO warehouse_data (
//         branch_code, warehouse_name, cost_centre
//         ) VALUES (?, ?, ?)`,
//         [
//           row.branchCode || null,
//           row.warehouse || null,
//           row.cost_centre || null,
//         ]
//       );
//       console.log(data,"data")
//     }

//     res.status(200).json({ message: 'Data uploaded and stored successfully!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Failed to process file', error });
//   }
// });

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

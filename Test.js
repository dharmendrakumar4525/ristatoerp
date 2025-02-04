const express = require("express");
const app = express();

app.use(express.json());

const validatePayload = (req, res, next) => {

    console.log( req.body);
    const { product_id,  product_name} = req.body;
    
    if (!product_id || !product_name) {
        return res.status(400).json({ message:"enter the product_id and product_name" });
    }
    next();
};
app.post('/product',validatePayload,(req, res) => {
    console.log("djdjdjdjd")
    const { product_id,  product_name} = req.body;
    console.log(product_id,product_name);
     res.status(200).json({ message:"Goof Jobn" });
    //  res.status(200,"Good Job");
});


const PORT = process.env.PORT || 3001;
app.listen(3002, () => {
  console.log(`Server running on port ${PORT}`);
});

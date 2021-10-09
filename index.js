if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const Razorpay = require("razorpay")
var Mailchimp = require('mailchimp-api-v3')
const app = express();
const cors = require("cors");
app.use(express.json());
const corsOptions = {
  origin: "*",
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS","PATCH"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true, //Credentials are cookies, authorization headers or TLS client certificates.
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "device-remember-token",
    "Access-Control-Allow-Origin",
    "Origin",
    "Accept",
  ],
};
app.use(cors(corsOptions)); 


const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});



///craete order id
app.get("/create-order", (req, res,next) => {
  const options = {
    amount: 299, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send({orderId : order.id})
  });
});


///get customer info 
app.post("/userinfo", (req, res,next) =>{
  const { payment_id } = req.body

    instance.payments.fetch(payment_id)
    .then((response)=>{
        console.log(response.email);
        res.send({email : response.email , number : response.contact})
    })

})



////mailchimp api

















app.listen(process.env.PORT, function () {
  console.log(`server is running ${process.env.PORT}`);
});

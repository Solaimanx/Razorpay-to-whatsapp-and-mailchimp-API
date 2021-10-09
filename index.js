const express = require("express");
const Razorpay = require("razorpay")
var Mailchimp = require('mailchimp-api-v3')
const app = express();
const cors = require("cors");
const PORT = 5000;
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
  key_id: "rzp_live_dpzb41Y09Csill",
  key_secret: "MQxSSzZnX8OCYr8O7jZDiGsD",
});



///craete order id
app.get("/create-order", (req, res,next) => {
  const options = {
    amount: 399, // amount in the smallest currency unit
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

















app.listen(PORT, function () {
  console.log(`server is running ${PORT}`);
});

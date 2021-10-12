if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const Razorpay = require("razorpay");
var Mailchimp = require("mailchimp-api-v3");
var md5 = require("md5");
const app = express();
const cors = require("cors");
app.use(express.json());
const corsOptions = {
  origin: "*",
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
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

var mailchimp = new Mailchimp(process.env.MAILCHIMP_KEY);

app.get("/", (req, res) => {
  res.send({
    server: "running",
  });
});

///craete order id
app.get("/create-order", (req, res, next) => {
  const options = {
    amount: 299, // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11",
  };
  instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send({ orderId: order.id });
  });
});

///get customer info
app.get("/userinfo/:id", (req, res, next) => {
  const { id } = req.params;

  instance.payments.fetch(id).then((response) => {
    console.log(response.email);
    res.send({ email: response.email, number: response.contact });
  });
});


////mailchimp api start from here

//// sucess payment
app.get("/mc/add-success-tag/:email", (req, res, next) => {
  const { email } = req.params;

  const hashedEmail = md5(email);

  mailchimp
    .post({
      path: `/lists/f22669270c/members/${hashedEmail}/tags`,
      body: {
        tags: [
          {
            name: "HackerrankPaid",
            status: "active",
          },
        ],
      },
    })
    .then((response) => {
      if (response.statusCode == 204) {
        mailchimp
          .post({
            path: `/lists/f22669270c/members/${hashedEmail}/tags`,
            body: {
              tags: [
                {
                  name: "HackerrankFollowup",
                  status: "inactive",
                },
              ],
            },
          })
          .then((response) => {
            if (response.statusCode == 204) {
              next()
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        return res.status(422).json({ message: "failed to add tag" });
      }
      
      return res.status(200).json({ message: "sucess" });


  
    })
    .catch((error) => {
      console.log(error);
    });
});


///failed payment 

app.get("/mc/add-followup-tag/:email", (req, res, next) => {
  const { email } = req.params;

  const hashedEmail = md5(email);

  mailchimp
    .post({
      path: `/lists/f22669270c/members/${hashedEmail}/tags`,
      body: {
        tags: [
          {
            name: "HackerrankFollowup",
            status: "active",
          },
        ],
      },
    })
    .then((response) => {

      if(response.statusCode == 204) {
        return res.status(200).json({ message: "sucess" });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});


app.post('/webhook',(res,req,next) => {
  console.log(req.body)
  console.log('working')
  next()
})







app.listen(process.env.PORT, function () {
  console.log(`server is running ${process.env.PORT}`);
});




if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios").default;
var Mailchimp = require("mailchimp-api-v3");
var md5 = require("md5");
const app = express();
const cors = require("cors");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

var customParser = bodyParser.json({
  type: function (req) {
    if (req.headers["content-type"] === "") {
      return (req.headers["content-type"] = "application/json");
    } else if (typeof req.headers["content-type"] === "undefined") {
      return (req.headers["content-type"] = "application/json");
    } else {
      return (req.headers["content-type"] = "application/json");
    }
  },
});

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


var mailchimp = new Mailchimp(process.env.MAILCHIMP_KEY);

app.get("/", (req, res) => {
  res.send({
    server: "running",
  });
});



app.post("/hook", customParser, (req, res) => {
  var payload = req.body.payload.payment.entity;
  console.log(payload);

  if (payload.amount == 29900) {
    if (payload.status == "failed") {
      const email = payload.email;

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
          axios
            .post(
              "https://webhooks.integrately.com/a/webhooks/d5e1be31d65f4e478d0212c1dd1fe622",
              {
                email: payload.email,
                contact: payload.contact,
                paymentStatus: payload.status,
                amount: payload.amount,
                paymentid: payload.id,
                orderid: payload.order_id,
              }
            )
            .then((response) => {
              console.log(response.status);
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      ///sucess payment then process
      const email = payload.email;
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
              axios
                .post(
                  "https://webhooks.integrately.com/a/webhooks/d5e1be31d65f4e478d0212c1dd1fe622",
                  {
                    email: payload.email,
                    contact: payload.contact,
                    paymentStatus: payload.status,
                    amount: payload.amount,
                    paymentid: payload.id,
                    orderid: payload.order_id,
                  }
                )
                .then((response) => {
                  console.log(response.status);
                })
                .catch((error) => {
                  console.log(error);
                });
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  } else {
    ///do nothing
    return;
  }
});

app.listen(process.env.PORT, function () {
  console.log(`server is running ${process.env.PORT}`);
});

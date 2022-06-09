require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");

const router = express.Router();

const PaymentDetailsSchema = mongoose.Schema({
  razorpayDetails: {
    orderId: String,
    paymentId: String,
    signature: String,
  },
  success: Boolean,
});

const PaymentDetails = mongoose.model("PatmentDetail", PaymentDetailsSchema);

router.post("/orders", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: "rzp_test_O6gD5lUjm2mzhX", // YOUR RAZORPAY KEY
      key_secret: "MED7jkY5waqWBGNef5C8pRqr", // YOUR RAZORPAY SECRET
    });

    const options = {
      amount: Number(req.body.amount * 100),
      currency: req.body.currency,
      receipt: req.body.receipt,
    };

    console.log("req.body", req.body);
    const order = await instance.orders.create(options);
    console.log("order", order);

    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post("/success", async (req, res) => {
  try {
    const {
      orderCreationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = req.body;

    const shasum = crypto.createHmac("sha256", "MED7jkY5waqWBGNef5C8pRqr");
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature)
      return res.status(400).json({ msg: "Transaction not legit!" });

    const newPayment = PaymentDetails({
      razorpayDetails: {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
      },
      success: true,
    });

    await newPayment.save();
    console.log("razorpayOrderId", razorpayOrderId);
    console.log("razorpayPaymentId", razorpayPaymentId);

    res.json({
      msg: "success",
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;

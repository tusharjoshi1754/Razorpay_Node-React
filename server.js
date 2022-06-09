const express = require("express");

const connectDb = require("./database/connectDb");
var cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
// connect to db
connectDb();

// middlewares
app.use(express.json({ extended: false }));

app.use("/payment", require("./routes/payment"));

app.listen(port, () => console.log(`server started on port ${port}`));

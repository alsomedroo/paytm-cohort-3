const express = require('express');
const userRouter = require("./user");
const accountRouter = require("./account");
const router = express.Router();


router.use("/user", userRouter)
router.use("/account", accountRouter);
//console.log("Connected to MongoDB")
module.exports = router;
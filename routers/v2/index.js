const express = require("express");
const router = express.Router();
const promoRouter = require("./promo");

router.use("/promo", promoRouter);

module.exports = router;

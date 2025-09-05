const mongoose = require("mongoose");
const { HoldingSchema } = require("../schemas/HoldingSchema");

const HoldingsModel = mongoose.model("Holdings", HoldingSchema);

module.exports = { HoldingsModel };

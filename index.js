require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./Routes/AuthRoute");
const { HoldingsModel } = require("./model/HoldingModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGO_URL;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.post("/api/newOrder", async (req, res) => {
  try {
    const { name, qty, price } = req.body;

    const newOrder = new OrdersModel(req.body);
    await newOrder.save();

    let holding = await HoldingsModel.findOne({ name });
    if (holding) {
      const totalQty = (holding.qty || 0) + (qty || 0);
      const totalCost =
        (holding.avg || 0) * (holding.qty || 0) + (price || 0) * (qty || 0);

      holding.qty = totalQty;
      holding.avg = totalQty ? totalCost / totalQty : 0;
      holding.price = price || 0;
    } else {
      holding = new HoldingsModel({
        name: name || "Unknown",
        qty: qty || 0,
        avg: price || 0,
        price: price || 0,
        net: "+0.00%",
        day: "+0.00%",
        isLoss: false,
      });
    }

    await holding.save();

    res
      .status(201)
      .json({ success: true, message: "Order placed and holdings updated!" });
  } catch (err) {
    console.error("New order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/allHoldings", async (req, res) => {
  try {
    const holdings = await HoldingsModel.find({});
    const sanitized = holdings.map((h) => ({
      name: h.name || "Unknown",
      qty: h.qty || 0,
      avg: h.avg || 0,
      price: h.price || 0,
      net: h.net || "+0.00%",
      day: h.day || "+0.00%",
      isLoss: h.isLoss || false,
    }));
    res.json(sanitized);
  } catch (err) {
    console.error("Holdings fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/allPositions", async (req, res) => {
  try {
    const positions = await PositionsModel.find({});
    res.json(positions);
  } catch (err) {
    console.error("Positions fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));


const mongoose = require("mongoose");
// 1- Create Schema
const kanbanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name required"],
    },
    items: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        title: String,
        description: String,
       
      },
    ],
  },
  { timestamps: true }
);


// 2- Create model
module.exports = mongoose.model("Kanban", kanbanSchema);

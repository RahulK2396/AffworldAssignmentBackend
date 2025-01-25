const mongoose = require('mongoose');


const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Done'], default: 'Pending' },
});


module.exports = mongoose.model('Task', taskSchema);

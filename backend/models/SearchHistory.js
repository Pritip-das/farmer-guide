import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  location: { type: String, required: true },
  searchedAt: { type: Date, default: Date.now }
});

export default mongoose.model('SearchHistory', historySchema);
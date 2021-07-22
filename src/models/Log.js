const mongoose = require ("mongoose");
const mongoosePaginate = require ("mongoose-paginate");

const LogSchema = new mongoose.Schema
(
    {
        user: String,
        lock: String,
        path: [String],
        role: String,
        type: String,
        creationDate: Date,
        owner: String
    }
);

LogSchema.plugin (mongoosePaginate);
module.exports = mongoose.model ("Log", LogSchema);
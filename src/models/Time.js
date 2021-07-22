const mongoose = require ("mongoose");

const TimeSchema = new mongoose.Schema
(
    {
        start: Number,
        end: Number,
        days: [Boolean],
        use: Boolean,
        trackAccess: Boolean,
        trackMiss: Boolean,
        owner: String
    }
);

module.exports = mongoose.model ("Time", TimeSchema);
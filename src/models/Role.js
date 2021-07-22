const mongoose = require ("mongoose");
const mongoosePaginate = require ("mongoose-paginate");

const RoleSchema = new mongoose.Schema
(
    {
        name: String,
        times: [{type: String, ref: "Time"}],
        owner: String
    }
);

RoleSchema.plugin (mongoosePaginate);
module.exports = mongoose.model ("Role", RoleSchema);
const mongoose = require ("mongoose");
const mongoosePaginate = require ("mongoose-paginate");

const UserSchema = new mongoose.Schema
(
    {
        name: String,
        PINs: [String],
        roles: [{type: String, ref: "Role"}],
        usedTimes: [{type: String, ref: "Time"}],
        owner: String
    }
);

UserSchema.plugin (mongoosePaginate);
module.exports = mongoose.model ("User", UserSchema);
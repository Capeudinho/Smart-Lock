const mongoose = require ("mongoose");
const mongoosePaginate = require ("mongoose-paginate");

const ItemSchema = new mongoose.Schema
(
    {
        name: String,
        parents: [{type: String, ref: "Item"}],
        owner: String
    },
    {
        discriminatorKey: "type"
    }
);

ItemSchema.plugin (mongoosePaginate);
module.exports = mongoose.model ("Item", ItemSchema);
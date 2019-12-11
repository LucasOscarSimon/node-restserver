const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let categorySchema = new Schema({
    description: { type: String, required: [true, 'description is required'] },
    state: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

categorySchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();
    return userObject;
}

categorySchema.plugin(uniqueValidator, { message: '{PATH} must be unique' })

module.exports = mongoose.model('Category', categorySchema);
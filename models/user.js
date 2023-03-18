const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, "username is required."]
    },
    pass: {
        type: String,
        require: [true, "password is required."]
    }

})

module.exports = mongoose.model("User",userSchema)
import {Schema, model} from 'mongoose'

const userSchema = Schema({
    name:{
        type: String,
        require : true
    },
    username:{
        type: String,
        unique: true,
        lowerCase: true,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type:String,
        require: true
    }
},{
    versionKey: false
})

export default model('user', userSchema)
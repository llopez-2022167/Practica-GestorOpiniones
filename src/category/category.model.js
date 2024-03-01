import { Schema, model } from 'mongoose'

const categorySchema = Schema({
    name: {
        type: String,
        rquere: true
    },
    description: {
        type: String,
        required: true
    }
},{
    versionKey: false
})

export default model('category', categorySchema)

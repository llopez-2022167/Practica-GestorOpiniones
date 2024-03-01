import { Schema,model } from "mongoose";

const publictionSchema = Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        required: true
    },
    user:{
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
},{
    versionKey: false
})

export default model('publications',publictionSchema)
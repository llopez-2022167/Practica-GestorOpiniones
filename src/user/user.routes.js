import {Router} from 'express'
import { edit, editPassword, login, signUp } from './user.controller.js'
import { validateJwt } from '../middleware/validate.js'

const api = Router()

api.post('/add', signUp)
api.post('/login', login)
api.put('/edit/:id', [validateJwt], edit)
api.put('/editPassword/:id', [validateJwt], editPassword)

export default api
import {Router} from 'express'
import { validateJwt } from '../middleware/validate.js'
import { test,signUp,login,edit } from './user.controller.js'

const api = Router()

//Rutas publicas
api.post('/add', signUp)
api.post('/login', login)
//api.put('/editPassword/:id', [validateJwt], editPassword)
//Rutas privadas
api.get('/test',[validateJwt], test)
api.put('/edit/:id', [validateJwt], edit)


export default api
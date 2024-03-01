import User from './user.model.js'
import {encrypt, checkUpdate,checkPassword } from '../../utils/validator.js'
import {generateJwt} from '../../utils/jwt.js'


export const test = (req, res)=>{
    console.log('Tes is running')
    res.send({message: 'test good'})
};

//Inscribirse o registrarse
// Registro de Usuario
export const signUp = async (req, res) => {
    try {
        let data = req.body;

        // Verificar si el nombre de usuario o el correo electrónico ya existen
        let user = await User.findOne({ $or: [{ email: data.email, username: data.username }] });
        if (user) {
            return res.status(400).send({ message: 'Username or email already exists' });
        }

        // Crear un nuevo usuario
        data.password = await encrypt(data.password);
        user = new User(data);
        await user.save();

        return res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error registering user' });
    }
};

// Controlador para la función de inicio de sesión
export const login = async (req, res) => {
    try {
        let data = req.body;
        // Buscar al usuario por nombre de usuario o correo electrónico
        let user = await User.findOne({ $or: [{ username: data.username }, { email: data.email }] });
        if (user && await checkPassword(data.password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                email: user.email
            }
            let token = await generateJwt(loggedUser)
            return res.send(
                {
                    message: `Welcome ${loggedUser.username}`,
                    loggedUser,
                    token
                }
            )
        }
        return res.status(401).send({ message: 'Invalid credentials' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error logging in' });
    }
};



export const edit = async (req, res) => {
    try {
        // Extraer el ID del usuario a editar de los parámetros de la solicitud
        let { id } = req.params
        let {username, email, currentPassword, newPassword} = req.body
         // Verificar si los datos proporcionados contienen información válida para la actualización
        let user = await User.findById(id);
        // Verificar si el ID del usuario que se quiere editar es igual al ID del usuario autenticado
        if(!user) return  res.status(404).send(
            { 
                message: 'User not fouund' 
            });
       
            if (!(await checkPassword(currentPassword, user.password)));
        
        if(username) user.username = username;
        
        if (email) user.email = email;

        if(newPassword){
            newPassword = await encrypt(newPassword);
            user.password = newPassword;
        }
        await user.save();
        return res.send({message: 'user perfile update successfully', user});
    } catch (error) {
            // Manejar cualquier error que pueda ocurrir durante el proceso
        console.error(error);
        return res.status(500).json({ message: 'Error updating user perfile'});
    }
};

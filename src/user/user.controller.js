import User from './user.model.js'
import {encrypt, comparePassword, checkUpdate, checkUpdateClient } from '../../utils/validator.js'
import {generateJwt} from '../../utils/jwt.js'


export const test = (req, res)=>{
    console.log('Tes is running')
    res.send({message: 'test good'})
}

export const defaultAdmin = async () => {
    try {
         // Buscar si ya existe un usuario con el nombre de usuario 'default
        const existingUser = await User.findOne({ username: 'default' });
         // Si ya existe un usuario con el nombre de usuario 'default', salir de la función
        if (existingUser) {
            return;
        }
        // Si no existe un usuario con el nombre de usuario 'default', crear uno predeterminado
        let data = {
            name: 'Default',// Nombre del usuario predeterminado
            username: 'default',// Nombre de usuario predeterminado
            email: 'default@gmail.com',// Correo electrónico del usuario predeterminado
            password: await encrypt('SOLOVINO'),// Contraseña del usuario predeterminado (se encripta antes de guardarla)
        }
         // Crear un nuevo objeto de usuario con los datos predeterminados
        let user = new User(data)
        // Guardar el usuario predeterminado en la base de datos
        await user.save()

    } catch (error) {
         // Manejar cualquier error que pueda ocurrir durante el proceso
        console.error(error)
    }
}

export const signUp = async (req, res) => {
    try {
         // Extraer los datos del cuerpo de la solicitud
        let data = req.body
         // Extraer los datos del cuerpo de la solicitud
        let existingUser = await User.findOne({ username: data.username });
         // Si ya existe un usuario con el mismo nombre de usuario, devolver un mensaje de error
        if (existingUser) {
            return res.status(400).send({ message: 'Username is already in use' });
        }
         // Encriptar la contraseña antes de guardarla en la base de datos
        data.password = await encrypt(data.password)
        // Crear un nuevo objeto de usuario con los datos proporcionados
        let user = new User(data)
        // Guardar el nuevo usuario en la base de datos
        await user.save()
         // Enviar una respuesta de éxito con un mensaje indicando que el usuario se registró correctamente
        return res.send({ message: `Registered successfully, can be logged with username ${user.username}` })
    } catch (err) {
        // Manejar cualquier error que pueda ocurrir durante el proceso
        console.error(err)
        // Enviar una respuesta de error con un mensaje indicando que ocurrió un error al registrar al usuario
        return res.status(500).send({ message: 'Error registering user', err: err })
    }
}

// Controlador para la función de inicio de sesión
export const login = async (req, res) => {
    try {
        // Extraer el usuario y la contraseña del cuerpo de la solicitud
        let { user, password } = req.body;
        // Buscar al usuario en la base de datos por su nombre de usuario o correo electrónico
        let users = await User.findOne({
            $or: [
                { username: user }, // Buscar por nombre de usuario
                { email: user }     // Buscar por correo electrónico
            ]
        });
        // Verificar si el usuario existe y si la contraseña es correcta
        if (users && await comparePassword(password, users.password)) {
            // Si las credenciales son válidas, crear un objeto de usuario autenticado
            let loggedUser = {
                uid: users.id,
                username: users.username,
                email: users.email,
                name: users.name,
            };
            // Generar un token JWT para el usuario autenticado
            let token = await generateJwt(loggedUser);
            // Enviar una respuesta al cliente con un mensaje de bienvenida, el usuario autenticado y el token JWT
            return res.send({ message: `Welcome ${loggedUser.name}`, loggedUser, token });
        }
        // Si las credenciales son inválidas, devolver un mensaje de error
        return res.status(404).send({ message: 'Invalid credentials' });
    } catch (err) {
        // Si ocurre un error durante el proceso, devolver un mensaje de error de servidor
        console.error(err);
        return res.status(500).send({ message: 'Error to login' });
    }
};


export const edit = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        let data = req.body;
        // Extraer el ID del usuario a editar de los parámetros de la solicitud
        let { id } = req.params
        // Obtener el ID del usuario autenticado
        let uid = req.user._id
         // Verificar si los datos proporcionados contienen información válida para la actualización
        let updated = checkUpdateClient(data, id)
        // Verificar si el ID del usuario que se quiere editar es igual al ID del usuario autenticado
        if(id != uid) return  res.status(401).send({ message: 'you can only update your account' })
        if (!updated) return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' })
        // Actualizar el usuario en la base de datos
        let updatedUsers = await User.findOneAndUpdate(
            { _id: id }, //ObjectsId <- hexadecimales (Hora sys, Version Mongo, Llave privada...)
            data, //Los datos que se van a actualizar
            { new: true } //Objeto de la BD ya actualizado
        )
        // Verificar si el usuario se actualizó correctamente
        if (!updatedUsers) return res.status(401).send({ message: 'User not found and not updated' })
        // Enviar una respuesta con un mensaje de éxito y el usuario actualizado
        return res.send({ message: 'Updated user', updatedUsers })
    } catch (error) {
            // Manejar cualquier error que pueda ocurrir durante el proceso
        console.error(error);
        return res.status(500).json({ message: 'Error updating user .', error: error });
    }
}

export const editPassword = async (req, res) => {
    try {
         // Extraer las contraseñas antigua y nueva del cuerpo de la solicitud
        let { oldPassword, newPassword } = req.body;
        // Extraer el ID del usuario a editar de los parámetros de la solicitud
        let { id } = req.params;
        // Obtener el ID del usuario autenticado
        let uid = req.user._id
        // Verificar que el usuario esté intentando actualizar su propia cuenta
        if (id != uid) 
            return res.status(401).send({ message: 'You can only update your own account' });
        // Verificar que se haya enviado una nueva contraseña
        if (!newPassword) 
            return res.status(400).send({ message: 'New password is missing' });
        // Obtener el usuario de la base de datos y verificar que existe
        let user = await User.findOne({ _id: id });
        if (!user) 
            return res.status(404).send({ message: 'User not found' });
        // Verificar que la contraseña anterior coincida con la almacenada en la base de datos
        if (!(await comparePassword(oldPassword, user.password))) 
            return res.status(401).send({ message: 'Incorrect old password' });
        // Actualizar la contraseña del usuario utilizando findOneAndUpdate
        let updatedUser = await User.findOneAndUpdate({ _id: id }, // Condición para encontrar el usuario por su ID y contraseña antigua
            { password: await encrypt(newPassword) }, // Actualizar la contraseña
            { new: true } // Devolver el usuario actualizado
        );
         // Verificar si el usuario se actualizó correctamente
        if (!updatedUser) 
            return res.status(404).send(
            { message: 'User not found or password not updated' }
        );
        // Enviar una respuesta con un mensaje de éxito y el usuario actualizado
        return res.send({ message: 'Password updated successfully', updatedUser });
    } catch (error) {
        // Manejar cualquier error que pueda ocurrir durante el proceso
        console.error(error);
        return res.status(500).json({ message: 'Error updating password', error: error });
    }
};
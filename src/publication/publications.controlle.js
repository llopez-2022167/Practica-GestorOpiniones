// Importar los modelos y las funciones necesarias
import Publication from './publications.model.js'
import User from '../user/user.model.js'
import jwt from 'jsonwebtoken'
import { checkUpdate } from '../../utils/validator.js'

// Controlador para agregar una nueva publicación
export const add = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        let data = req.body;
        
        // Extraer el ID de usuario del objeto de solicitud
        let uid = req.user._id;

        // Asignar el ID de usuario a la publicación
        data.user = uid;

        // Crear una nueva instancia de publicación con los datos proporcionados
        let publication = new Publication(data);

        // Guardar la publicación en la base de datos
        await publication.save();

        // Enviar una respuesta exitosa
        return res.send({ message: 'Add publication successfully' });
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error add publication', err: err });
    }
}

// Controlador para eliminar una publicación
export const deleted = async (req, res) => {
    try {
        // Extraer el ID de la publicación de los parámetros de la solicitud
        let { id } = req.params;
        
        // Extraer el ID de usuario del objeto de solicitud
        let uid = req.user._id;

        // Verificar si la publicación existe y si el usuario es el propietario
        let publication = await Publication.findOne({ _id: id, user: uid });
        if (!publication)
            return res.status(404).send({ message: 'Publication not found or you are not authorized to delete it' });

        // Eliminar la publicación de la base de datos
        let deletedPublication = await Publication.findOneAndDelete({ _id: id, user: uid });
        if (!deletedPublication)
            return res.status(500).send({ message: 'Error deleting publication' });

        // Enviar una respuesta exitosa
        return res.send({ message: 'Publication deleted successfully' });
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error deleting publication' });
    }
}

// Controlador para actualizar una publicación
export const update = async (req, res) =>{
    try {
        // Extraer el ID de la publicación de los parámetros de la solicitud
        let { id } = req.params;
        
        // Extraer los datos del cuerpo de la solicitud
        let data = req.body;
        
        // Extraer el ID de usuario del objeto de solicitud
        let uid = req.user._id;

        // Verificar si se pueden actualizar los datos proporcionados
        let update = checkUpdate(data, id);

        // Buscar la publicación en la base de datos
        let publication = await Publication.findOne({ _id: id, user: uid });   
        if (!publication) 
            return res.status(404).send({ message: 'Publication not found or you are not authorized to delete it' });
        
        // Verificar si se pueden actualizar los datos proporcionados
        if (!update) 
            return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' });

        // Actualizar la publicación en la base de datos
        let updatePublication = await Publication.findOneAndUpdate({ _id: id }, data, { new: true });
        if (!updatePublication) 
            return res.status(401).send({ message: 'Publication not found and not updated' });

        // Enviar una respuesta exitosa
        return res.send({ message: 'Updated publication', updatePublication });
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error updating publication' });
    }
}

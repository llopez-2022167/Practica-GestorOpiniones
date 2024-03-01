// Importar los modelos y las funciones necesarias
import Comment from './comment.model.js'
import User from '../user/user.model.js'
import Publication from '../publication/publications.model.js'
import jwt from 'jsonwebtoken'
import { checkUpdate } from '../../utils/validator.js'

// Controlador para agregar un nuevo comentario
export const add = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        let data = req.body;
        
        // Extraer el ID de usuario del objeto de solicitud
        let uid = req.user._id;
        
        // Asignar el ID de usuario al comentario
        data.user = uid;
        
        // Verificar si se enviaron todos los parámetros necesarios
        if (!data.publication || !data.comment || !data.user) 
            return res.status(400).send({message: 'You must send all the parameters'});
        
        // Crear una nueva instancia de comentario con los datos proporcionados
        let comment = new Comment(data);
        
        // Guardar el comentario en la base de datos
        await comment.save();
        
        // Enviar una respuesta exitosa
        return res.send({ message: 'Add comment successfully' });
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error add comment', err: err });
    }
}

// Controlador para actualizar un comentario existente
export const update = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        let data = req.body;
        // Extraer el ID de usuario del objeto de solicitud
        let uid = req.user._id;     
        // Verificar si se proporcionaron datos válidos para la actualización
        let updated = checkUpdate(data, id);   
        // Buscar el comentario en la base de datos
        let comment = await Comment.findOne({ _id: id, user: uid });   
        // Verificar si el comentario existe y si el usuario tiene permiso para actualizarlo
        if (!comment) 
            return res.status(404).send({ message: 'Comment not found or you are not authorized to updated it' });  
        // Verificar si se pueden actualizar los datos proporcionados
        if (!updated) 
            return res.status(400).send({ message: 'Have submitted some data that cannot be updated or missing data' });
        // Actualizar el comentario en la base de datos
        let updateComment = await Comment.findOneAndUpdate({ _id: id }, data, { new: true });
        // Verificar si el comentario se actualizó correctamente
        if (!updateComment) 
            return res.status(401).send({ message: 'Comment not found and not updated' });
        // Enviar una respuesta exitosa
        return res.send({ message: 'Updated comment', updateComment });
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error updating comment' });
    }
}

// Controlador para eliminar un comentario
export const deleted = async (req, res) => {
    try {
        // Extraer el ID del comentario de los parámetros de la solicitud
        let { id } = req.params;
        // Extraer el ID de usuario del objeto de solicitud
        let uid = req.user._id;
        // Verificar si el comentario existe y si el usuario tiene permiso para eliminarlo
        let comment = await Comment.findOne({ _id: id, user: uid });
        if (!comment)
            return res.status(404).send({ message: 'Comment not found or you are not authorized to delete it' });
        // Eliminar el comentario de la base de datos
        let updatedComment = await Comment.findOneAndDelete({ _id: id, user: uid });
        if (!updatedComment)
            return res.status(500).send({ message: 'Error deleting comment' });
        // Enviar una respuesta exitosa
        return res.send({ message: 'Comment deleted successfully' });
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error deleting comment' });
    }
}

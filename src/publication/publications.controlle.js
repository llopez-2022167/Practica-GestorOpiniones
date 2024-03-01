// Importar los modelos y las funciones necesarias
import Publication from './publications.model.js'
//import User from '../user/user.model.js'
//import jwt from 'jsonwebtoken'
//import { checkUpdate } from '../../utils/validator.js'

export const test =(req, res)=>{
    console.log('test in running')
    return res.send({message: 'Test is running'})
}

// Controlador para agregar una nueva publicación
export const add = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        let {title,description} = req.body;
        let userId = req.user.id; // Obtener el id del usuairio 
        
        let Publication = new Publication({
            title,
            description,
            user: userId //se unen con la publicacion con el usuario
        })
        // Guardar la publicación en la base de datos
        await Publication.save();
        return res.status(201).send({message: 'Publication creating succefully', publication:Publication})
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error add publication'});
    }
}

// Controlador para actualizar una publicación
export const update = async (req, res) =>{
    try {
        // Extraer el ID de la publicación de los parámetros de la solicitud
        let { id } = req.params;
        
        let {title,description,user} = req.body
        let userId = req.user._id; // Se obtiene el id del usuario autenticado
        // Extraer el ID de usuario del objeto de solicitud
        let Publication = await Publication.findOne({_id: id, user: userId}).Publication('user', ['username']);
        if(!Publication ){
            return res.status(404).send({message: 'Publication not found or you are not authorize to edit this Publication'});
        }
        //Se actualiza los datos de nuestra publicacion 
        Publication.title = title;
        Publication.description = description;

        await Publication.save();
        return res.send({message: 'Publication updated succefully', Publication});
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error updating publication' });
    }
}

// Controlador para eliminar una publicación
export const deleted = async (req, res) => {
    try {
        // Extraer el ID de la publicación de los parámetros de la solicitud
        let { id } = req.params;
        // Extraer el ID de usuario del objeto de solicitud
        let userId = req.user._id;//Obtener el id del usuario actual resgistrado
        // Verificar si la publicación existe y si el usuario es el propietario
        let publication = await Publication.findOne({ _id: id, user: uid });
        if (!publication){
            return res.status(404).send({ 
                message: 'Publication not found or you are not authorized to delete it'
            });
        }

        // Eliminar la publicación de la base de datos
        let deletedPublication = await Publication.deleteOne({ _id: id});
        if (!deletedPublication.deletedCount === 0)
            return res.status(404).send({ 
                message: 'Publication not found and not deleted' 
            });

        // Enviar una respuesta exitosa
        return res.send({ message: 'Publication deleted successfully' });
    } catch (err) {
        // Manejar errores
        console.error(err);
        return res.status(500).send({ message: 'Error deleting publication' });
    }
}

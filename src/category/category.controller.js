// Importar el modelo de Category desde './category.model.js'
import Category from './category.model.js'

// Controlador para la función de agregar una nueva categoría
export const add = async (req, res) => {
    try {
        // Extraer los datos del cuerpo de la solicitud
        let data = req.body;
        // Verificar si ya existe una categoría con el mismo nombre
        let existingCategory = await Category.findOne({ name: data.name });
        if (existingCategory) {
            // Si ya existe una categoría con el mismo nombre, devolver un mensaje de error
            return res.status(400).send({ message: 'Category with this name already exists' });
        }
        // Verificar si se proporcionaron todos los parámetros necesarios
        if (!data.name || !data.description) {
            return res.status(400).send({ message: 'You must send all the parameters' });
        }
        // Crear una nueva instancia de Category con los datos proporcionados
        let category = new Category(data);
        // Guardar la nueva categoría en la base de datos
        await category.save();
        // Enviar una respuesta de éxito con un mensaje indicando que se creó una nueva categoría
        return res.send({ message: 'A new category was created' });
    } catch (err) {
        // Manejar cualquier error que pueda ocurrir durante el proceso
        console.error(err);
        // Enviar una respuesta de error con un mensaje indicando que ocurrió un error al guardar la categoría
        return res.status(500).send({ message: 'Saving error' });
    }
}

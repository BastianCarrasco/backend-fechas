const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const FILE_PATH = './fechas.json';

// Función para leer el archivo JSON y agregar el campo 'id' si no existe
const leerFechas = () => {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const parsedData = JSON.parse(data);

        // Aseguramos que todas las fechas tengan un id
        parsedData.forEach((fecha, index) => {
            if (!fecha.id) {
                fecha.id = index + 1;  // Asigna un id basado en el índice
            }
        });

        return parsedData;
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        // Si hay un error (como si el archivo no existe), devolvemos un array vacío
        return [];
    }
};

// Función para escribir en el archivo JSON
const escribirFechas = (data) => {
    try {
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al escribir el archivo:', error);
    }
};

// Obtener todas las fechas
app.get('/fechas', (req, res) => {
    const data = leerFechas();
    res.json(data);
});

// Obtener una fecha por id
app.get('/fechas/:id', (req, res) => {
    const { id } = req.params;
    const data = leerFechas();

    const fecha = data.find(fecha => fecha.id === parseInt(id)); // Convertimos el id a número
    if (fecha) {
        res.json(fecha);
    } else {
        res.status(404).json({ mensaje: 'Fecha no encontrada' });
    }
});

// Crear una nueva fecha
app.post('/fechas', (req, res) => {
    const { nombre, url, fechaInicio, fechaCierre, plataforma } = req.body;
    const data = leerFechas();

    // Generar un nuevo ID basado en el último id de las fechas
    const newId = data.length ? Math.max(...data.map(f => f.id)) + 1 : 1;

    const nuevaFecha = { 
        id: newId, 
        nombre, 
        url, 
        fechaInicio, 
        fechaCierre, 
        plataforma 
    };

    data.push(nuevaFecha);
    escribirFechas(data);

    res.status(201).json({ mensaje: 'Fecha creada', nuevaFecha });
});

// Editar una fecha por id
app.put('/fechas/:id', (req, res) => {
    const { id } = req.params;
    const { nuevaFecha } = req.body;
    let data = leerFechas();

    const index = data.findIndex(fecha => fecha.id === parseInt(id)); // Convertimos el id a número
    if (index !== -1) {
        // Actualizamos los campos de la fecha
        data[index] = { ...data[index], ...nuevaFecha };
        escribirFechas(data);
        res.json({ mensaje: 'Fecha actualizada', data });
    } else {
        res.status(404).json({ mensaje: 'Fecha no encontrada' });
    }
});

// Eliminar una fecha por id
app.delete('/fechas/:id', (req, res) => {
    const { id } = req.params;
    let data = leerFechas();

    const index = data.findIndex(fecha => fecha.id === parseInt(id)); // Convertimos el id a número
    if (index !== -1) {
        data.splice(index, 1);  // Eliminar la fecha
        escribirFechas(data);
        res.json({ mensaje: 'Fecha eliminada' });
    } else {
        res.status(404).json({ mensaje: 'Fecha no encontrada' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

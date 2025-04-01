const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const FILE_PATH = './fechas.json';

// Función para leer el JSON
const leerFechas = () => {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { fechas: [] };
    }
};

// Función para escribir en el JSON
const escribirFechas = (data) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// Obtener todas las fechas
app.get('/fechas', (req, res) => {
    const data = leerFechas();
    res.json(data.fechas);
});

// Obtener una fecha por ID
app.get('/fechas/:id', (req, res) => {
    const { id } = req.params;
    const data = leerFechas();

    const fecha = data.fechas.find(fecha => fecha.id === parseInt(id));
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
    const newId = data.fechas.length ? Math.max(...data.fechas.map(f => f.id)) + 1 : 1;

    const nuevaFecha = { 
        id: newId,
        nombre, 
        url, 
        fechaInicio, 
        fechaCierre, 
        plataforma
    };

    data.fechas.push(nuevaFecha);
    escribirFechas(data);

    res.status(201).json({ mensaje: 'Fecha creada', nuevaFecha });
});

// Editar una fecha por ID
app.put('/fechas/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, url, fechaInicio, fechaCierre, plataforma } = req.body;
    let data = leerFechas();

    const index = data.fechas.findIndex(fecha => fecha.id === parseInt(id));
    if (index !== -1) {
        data.fechas[index] = {
            id: parseInt(id),
            nombre, 
            url, 
            fechaInicio, 
            fechaCierre, 
            plataforma
        };
        escribirFechas(data);
        res.json({ mensaje: 'Fecha actualizada', fecha: data.fechas[index] });
    } else {
        res.status(404).json({ mensaje: 'Fecha no encontrada' });
    }
});

// Eliminar una fecha por ID
app.delete('/fechas/:id', (req, res) => {
    const { id } = req.params;
    let data = leerFechas();

    const index = data.fechas.findIndex(fecha => fecha.id === parseInt(id));
    if (index !== -1) {
        data.fechas.splice(index, 1);  // Eliminar la fecha
        escribirFechas(data);
        res.json({ mensaje: 'Fecha eliminada' });
    } else {
        res.status(404).json({ mensaje: 'Fecha no encontrada' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const dirNode_modules = path.join(__dirname, '../node_modules');

app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));

require('./helpers');

const directoriopublico = path.join(__dirname, '../public');
app.use(express.static(directoriopublico));
const directoriopartials = path.join(__dirname, '../partials');
hbs.registerPartials(directoriopartials);
app.use(bodyParser.urlencoded({ extended: false }));


app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('index', {
    });
});

app.get('/registro_user', (req, res) => {
    res.render('registro_user', {
    });
});

app.post('/guardar_datos', (req, res) => {
    res.render('guardar_datos', {
        cedula: parseInt(req.body.cedula),
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: parseInt(req.body.telefono)
    });
});

app.get('/crear_cursos_form', (req, res) => {
    res.render('crear_cursos_form', {
    });
});

app.post('/crear_cursos_valid', (req, res) => {
    res.render('crear_cursos_valid', {
        id: parseInt(req.body.id),
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        valor: parseInt(req.body.valor),
        modalidad: req.body.modalidad,
        duracion: req.body.duracion
    });
});

app.get('/listado_aspirantes', (req, res) => {
    res.render('listado_aspirantes', {
    });
});

app.post('/eliminar_aspirante', (req, res) => {
    res.render('eliminar_aspirante', {
        id_curso: parseInt(req.body.id_curso),
        id_asp: parseInt(req.body.id_asp)
    });
});

app.get('/listado_usuarios', (req, res) => {
    res.render('listado_usuarios', {
    });
});

app.post('/cambiar_rol', (req, res) => {
    res.render('cambiar_rol', {
        cedula: parseInt(req.body.cedula),
        rol: req.body.rol
    });
});

app.post('/validarSesion', (req, res) => {
    res.render('validarSesion', {
        usuario: req.body.usuario,
        contrasena: parseInt(req.body.contrasena)
    });
});

app.get('/cerrar_sesion', (req, res) => {
    res.render('cerrar_sesion', {
    });
});

app.get('/listar_cursos', (req, res) => {
    res.render('listar_cursos', {
    });
});

app.post('/listar_cursos_valid', (req, res) => {
    res.render('listar_cursos_valid', {
        id: parseInt(req.body.id),
        estado: req.body.estado
    });
});

app.post('/inscripcion_curso', (req, res) => {
    res.render('inscripcion_curso', {
        id: parseInt(req.body.id)
    });
});

app.get('/mis_cursos', (req, res) => {
    res.render('mis_cursos', {
    });
});

app.post('/eliminar_curso', (req, res) => {
    res.render('eliminar_curso', {
        id: parseInt(req.body.id)
    });
});

app.get('*', (req, res) => {
    res.render('error', {
        estudiante: 'error'
    });
});

app.listen(port, () => {
    console.log('Escuchando por el puerto ' + port);
});

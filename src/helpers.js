const hbs=require('hbs');
const fs = require('fs');
const localStorage = require('localStorage');

listaUsers = [];
listaCursos = [];
listaInscripciones = [];

navBarCoord = "<nav class='navbar navbar-expand-lg navbar-light bg-light'>\
<div class='collapse navbar-collapse' id='navbarSupportedContent'>\
<ul class='navbar-nav mr-auto'>\
    <li class='nav-item active'>\
    <a class='btn btn-default' href='/listar_cursos'>Listar cursos</span></a>\
    </li>\
    <li class='nav-item'>\
    <a class='btn btn-default' href='/crear_cursos_form'>Crear cursos</a>\
    </li>\
    <li class='nav-item'>\
    <a class='btn btn-default' href='/listado_aspirantes'>Listado de aspirantes</a>\
    </li>\
    <li class='nav-item'>\
    <a class='btn btn-default' href='/listado_usuarios'>Listado de usuarios</a>\
    </li>\
    <li class='nav-item'>\
    <a class='nav-link' href='/cerrar_sesion'>Cerrar sesión</a>\
    </li>\
</ul>\
</div>\
</nav>";

navBarAsp = "<nav class='navbar navbar-expand-lg navbar-light bg-light'>\
<div class='collapse navbar-collapse' id='navbarSupportedContent'>\
<ul class='navbar-nav mr-auto'>\
    <li class='nav-item active'>\
    <a class='btn btn-default' href='/listar_cursos'>Oferta academica</span></a>\
    </li>\
    <li class='nav-item'>\
    <a class='btn btn-default' href='/mis_cursos'>Mis cursos</a>\
    </li>\
    <li class='nav-item'>\
    <a class='nav-link' href='/cerrar_sesion'>Cerrar sesión</a>\
    </li>\
</ul>\
</div>\
</nav>";

hbs.registerHelper('listarCursos', ()=>{
    getCourses();
    
    if (localStorage.getItem('rol') == 'Aspirante') {
        let texto="<div align='center' style='padding-top: 20px;'>\
        <h4>Listado de cursos<h4>\
        <table border='2' style='text-align: center;'>\
        <thead>\
            <th>Id</th>\
            <th>Nombre</th>\
            <th>Descripción</th>\
            <th>Valor</th>\
            <th>Modalidad</th>\
            <th>Intensidad horaria</th>\
            <th>Estado</th>\
        </thead>\
        <tbody>";

        listaCursos.forEach(curso => {
            if (curso.state == 'Disponible') {
                texto=texto+
                '<tr>'+
                '<td>' + curso.id + '</td>' +
                '<td>' + curso.name + '</td>' +
                '<td>'+ curso.description + '</td>' +
                '<td>'+ curso.value + '</td>' +
                '<td>'+ curso.type + '</td>' +
                '<td>'+ curso.duration + '</td>' +
                '<td>' + curso.state + '</td></tr>';
            }
        })
        texto=texto+"</tbody></table></div>";
        return texto;
    }

    if (localStorage.getItem('rol') == 'Coordinador') {
        let texto="<div align='center' style='padding-top: 20px;'>\
        <h4>Listado de cursos<h4>\
        <table border='2' style='text-align: center;'>\
        <thead>\
            <th>Id</th>\
            <th>Nombre</th>\
            <th>Descripción</th>\
            <th>Valor</th>\
            <th>Modalidad</th>\
            <th>Intensidad horario</th>\
            <th>Cant. personas inscritas</th>\
            <th>Estado</th>\
        </thead>\
        <tbody>";

        listaCursos.forEach(curso => {
            texto=texto+
            '<tr>'+
            '<td>' + curso.id + '</td>' +
            '<td>' + curso.name + '</td>' +
            '<td>'+ curso.description + '</td>' +
            '<td>'+ curso.value + '</td>' +
            '<td>'+ curso.type + '</td>' +
            '<td>'+ curso.duration + '</td>' +
            '<td>'+ curso.cant_user + '</td>' +
            '<td>' + curso.state + '</td></tr>';
        })
        texto=texto+"</tbody></table></div>";
        return texto;
    }
})

hbs.registerHelper('setForm', ()=>{
    if (localStorage.getItem('rol') == 'Coordinador') {
        let texto="<div class='text-center' style='padding-top: 40px; border-style: groove;'>\
        <form action='/listar_cursos_valid' method='POST'>\
            <h4 class='text-center'>Editar estado de un curso<h4>\
            <label class='mb-3'>Id <input type='number' class='form-control' name='id' placeholder='Digite el id del curso' required></label>\
            <div class='form-group mb-3'>\
                <label>\
                    Estado\
                    <select class='form-control' name='estado'>\
                        <option value='Disponible'>Disponible</option>\
                        <option value='Cerrado'>Cerrado</option>\
                    </select>\
                </label>\
            </div>\
            <button class='btn btn-primary'>Guardar</button>\
        </form>\
        </div>";
        return texto;
    }

    if (localStorage.getItem('rol') == 'Aspirante') {
        let texto="<div class='text-center' style='padding-top: 40px; border-style: groove;'>\
        <form action='/inscripcion_curso' method='POST'>\
            <h4 class='text-center pb-2'>Inscribirse a un curso<h4>\
            <label class='mb-3'>Id <input type='number' class='form-control' name='id' placeholder='Digite el id del curso' required></label>\
            <button class='btn btn-primary'>Guardar</button>\
        </form>\
        </div>";
        return texto;
    }
})

hbs.registerHelper('validarInfoEstado', (id, estado)=>{
    let mensaje = "";
    getCourses();

    let existe = listaCursos.find(curso => curso.id === id);
    if (existe) {
        existe['state'] = estado;
        let datos = JSON.stringify(listaCursos);
        fs.writeFile('./src/courses.json', datos, (err) => {
            if (err) throw (err);
        });
        mensaje = "Se ha cambiado el estado del curso a: " + estado + " <a href='/listar_cursos'>Regresar</a>";
    } else {
        mensaje = "No se ha encontrado el curso con el número de identificación ingresado <a href='/listar_cursos'>Regresar</a>";
    }
    return mensaje;
});

hbs.registerHelper('validarInscripcion', (id)=>{
    let mensaje = "";
    getCourses();
    getInscrpciones();

    let yaExiste = listaInscripciones.find(asp => asp.cedula_asp === localStorage.getItem('cedula') && asp.id_curso === id);
    if (!yaExiste) {
        let curso = listaCursos.find(curso => curso.id === id && curso.state === 'Disponible');
        if (curso) {
            curso['cant_user'] = curso['cant_user'] + 1;
            guardar_curso();
            let data = {
                id_curso: curso.id,
                nombre_curso: curso.name,
                description_curso: curso.description,
                valor_curso: curso.value,
                modalidad_curso: curso.type,
                duracion_curso: curso.duration,
                email_asp: localStorage.getItem('user'),
                cedula_asp: localStorage.getItem('cedula')
            }
            guardarInscripcion(data);
            mensaje = "Se ha realizado la inscripción correctamente <a href='/listar_cursos' class='btn btn-link'>Regresar</a>";
        } else {
            mensaje = "No se ha encontrado el curso con el número de identificación ingresado <a href='/listar_cursos' class='btn btn-link'>Regresar</a>";
        }
    } else {
        mensaje = "Usted ya se encuentra inscrito a este curso <a href='/listar_cursos' class='btn btn-link'>Regresar</a>";
    }
    return mensaje;
});

const guardarInscripcion = (data) => {
    listaInscripciones.push(data);
    let datos = JSON.stringify(listaInscripciones);
    fs.writeFile('./src/inscripciones.json', datos, (err) => {
        if (err) throw (err);
    });
    return 'Se ha guardado la información';
}

const getCourses = () => {
    try {
        listaCursos = JSON.parse(fs.readFileSync('./src/courses.json'));
        return 'Se encontró el archivo de datos';
    } catch (error) {
        listaCursos = [];
        //console.log(error);
    }
}

const getInscrpciones = () => {
    try {
        listaInscripciones = JSON.parse(fs.readFileSync('./src/inscripciones.json'));
        return 'Se encontró el archivo de datos';
    } catch (error) {
        listaInscripciones = [];
        //console.log(error);
    }
}

hbs.registerHelper('guardar_curso', (id, nombre, descripcion, valor, modalidad, duracion)=>{
    let mensaje = "";
    if (localStorage.getItem('rol')) {
        if (localStorage.getItem('rol') === 'Coordinador') {
            getCourses();

            let curso = {
                id: id,
                name: nombre,
                description: descripcion,
                value: valor,
                type: modalidad,
                duration: duracion,
                state: 'Disponible',
                cant_user: 0
            }        
            let duplicado = listaCursos.find(curso => curso.id === id);
            if (!duplicado) {
                listaCursos.push(curso);
                mensaje = guardar_curso();
            } else {
                mensaje = "Ya existe un curso con el número de identificación ingresado <a href='/crear_cursos_form' class='btn btn-link'>Regresar</a>";
            }
        } else {
            mensaje = 'Usted no tiene permisos para realizar esta acción';
        }
    } else {
        mensaje = 'Debe iniciar sesión para realizar esta acción';
    }
    return mensaje;
});

const guardar_curso = () => {
    let datos = JSON.stringify(listaCursos);
    fs.writeFile('./src/courses.json', datos, (err) => {
        if (err) throw (err);
    });
    return "Se ha guardado la información <a href='/crear_cursos_form' class='btn btn-link'>Regresar</a>";
}

hbs.registerHelper('registro_aspirante', (cedula, nombre, email, telefono)=>{
    let mensaje = '';
    getUsers();

    let asp = {
        cedula: cedula,
        nombre: nombre,
        email: email,
        telefono: telefono,
        rol: 'Aspirante'
    }      
    let duplicado = listaUsers.find(id => id.cedula === cedula);
    if (!duplicado) {
        listaUsers.push(asp);
        mensaje = guardar();
    } else {
        mensaje = 'Ya existe un aspirante con el número de identificación ingresado';
    }
    
    return mensaje;
});

const guardar = () => {
    coordinador = {
        cedula: 13110108,
        nombre: 'SU',
        email: 'SU@gmail.com',
        telefono: 123456,
        rol: 'Coordinador'
    }

    let duplicado = listaUsers.find(id => id.cedula === coordinador.cedula);
    if (!duplicado) {
        listaUsers.push(coordinador);
        let datos = JSON.stringify(listaUsers);
        fs.writeFile('./src/usuarios.json', datos, (err) => {
            if (err) throw (err);
        });
    } else {
        let datos = JSON.stringify(listaUsers);
        fs.writeFile('./src/usuarios.json', datos, (err) => {
            if (err) throw (err);
        });
    }
    return 'Se ha guardado la información <a href="/">Iniciar sesión</a>';
}

const getUsers = () => {
    try {
        listaUsers = JSON.parse(fs.readFileSync('./src/usuarios.json'));
        return 'Se encontró el archivo de datos';
    } catch (error) {
        listaUsers = [];
        //console.log(error);
    }
}

hbs.registerHelper('validar_user', (usuario, contrasena) => {
    let mensaje = "";
    getUsers();

    let valid = listaUsers.find(user => user.email === usuario && user.cedula === contrasena);

    if (valid) {
        if (valid.rol === 'Coordinador') {
            mensaje += navBarCoord;
        }
        if (valid.rol === 'Aspirante') {
            mensaje += navBarAsp;
        }
        localStorage.setItem('user', usuario);
        localStorage.setItem('cedula', contrasena);
        localStorage.setItem('rol', valid.rol);
        mensaje += "<p style='padding: 20px'>Bienvenid@ " + valid.rol + "</p>";
    } else {
        mensaje = "Verifique sus credenciales <a href='/'>Regresar</a>";
    }
    return mensaje;
});

hbs.registerHelper('mostrarMisCursos', () => {
    if (localStorage.getItem('rol') === 'Aspirante') {
        getInscrpciones();
        let texto="<div align='center' style='padding-top: 20px;'>\
        <h4>Listado de cursos<h4>\
        <table border='2' style='text-align: center;'>\
        <thead>\
            <th>Id</th>\
            <th>Nombre</th>\
            <th>Descripcion</th>\
            <th>Valor</th>\
            <th>Modalidad</th>\
            <th>Intensidad</th>\
        </thead>\
        <tbody>";

        listaInscripciones.forEach(curso => {
            if (curso.cedula_asp == localStorage.getItem('cedula')) {
                texto=texto+
                '<tr>'+
                '<td>' + curso.id_curso + '</td>' +
                '<td>' + curso.nombre_curso + '</td>' +
                '<td>'+ curso.description_curso + '</td>' +
                '<td>'+ curso.valor_curso + '</td>' +
                '<td>'+ curso.modalidad_curso + '</td>' +
                '<td>'+ curso.duracion_curso + '</td>';
            }
        })
        texto=texto+"</tbody></table></div>\
        <div class='text-center' style='padding-top: 40px; border-style: groove;'>\
        <form action='/eliminar_curso' method='POST'>\
            <h4 class='text-center pb-2'>Eliminar un curso<h4>\
            <label class='mb-3'>Id <input type='number' class='form-control' name='id' placeholder='Digite el id del curso' required></label>\
            <button class='btn btn-primary'>Guardar</button>\
        </form>\
        </div>";
        return texto;
    }
});

hbs.registerHelper('deleteCourse', (id) => {
    let mensaje = "";
    getCourses();
    getInscrpciones();

    let nuevo = listaInscripciones.filter(ins => ins.id_curso != id || ins.cedula_asp != localStorage.getItem('cedula'));

    if (nuevo.length == listaInscripciones.length) {
        mensaje = "No se ha encontrado el curso a eliminar <a href='/mis_cursos' class='btn btn-link'>Regresar</a>";
    } else {
        let curso = listaCursos.find(curso => curso.id === id);
        curso['cant_user'] = curso['cant_user'] - 1;
        guardar_curso();
        listaInscripciones = nuevo;
        let datos = JSON.stringify(listaInscripciones);
        fs.writeFile('./src/inscripciones.json', datos, (err) => {
            if (err) throw (err);
        });
        mensaje = "El curso se ha eliminado correctamente <a href='/mis_cursos' class='btn btn-link'>Regresar</a>";
    }
    return mensaje;
});

hbs.registerHelper('mostrarAspirantes', () => {
    if (localStorage.getItem('rol') === 'Coordinador') {
        getInscrpciones();
        let texto="<div align='center' style='padding-top: 20px;'>\
        <h4>Listado de aspirantes<h4>\
        <table border='2' style='text-align: center;'>\
        <thead>\
            <th>ID curso</th>\
            <th>Nombre</th>\
            <th>Descripcion</th>\
            <th>Valor</th>\
            <th>Modalidad</th>\
            <th>Intensidad</th>\
            <th>Aspirante</th>\
            <th>ID aspirante</th>\
        </thead>\
        <tbody>";

        listaInscripciones.forEach(curso => {
            texto=texto+
            '<tr>'+
            '<td>' + curso.id_curso + '</td>' +
            '<td>' + curso.nombre_curso + '</td>' +
            '<td>'+ curso.description_curso + '</td>' +
            '<td>'+ curso.valor_curso + '</td>' +
            '<td>'+ curso.modalidad_curso + '</td>' +
            '<td>'+ curso.duracion_curso + '</td>' +
            '<td>'+ curso.email_asp + '</td>' +
            '<td>'+ curso.cedula_asp + '</td>';
        })
        texto=texto+"</tbody></table></div>\
        <div class='text-center' style='padding-top: 40px; border-style: groove;'>\
        <form action='/eliminar_aspirante' method='POST'>\
            <h4 class='text-center pb-2'>Eliminar un aspirante de un curso<h4>\
            <label class='mb-3'>Id curso <input type='number' class='form-control' name='id_curso' placeholder='Digite el id del curso' required></label>\
            <label class='mb-3'>Id aspirante <input type='number' class='form-control' name='id_asp' placeholder='Digite el id del aspirante' required></label>\
            <br>\
            <button class='btn btn-primary'>Guardar</button>\
        </form>\
        </div>";
        return texto;
    }
});

hbs.registerHelper('deleteApirante', (id_curso, id_asp) => {
    let mensaje = "";
    getCourses();
    getInscrpciones();

    let nuevo = listaInscripciones.filter(ins => ins.id_curso != id_curso || ins.cedula_asp != id_asp);

    if (nuevo.length == listaInscripciones.length) {
        mensaje = "No se ha encontrado el aspirante a eliminar <a href='/listado_aspirantes' class='btn btn-link'>Regresar</a>";
    } else {
        let curso = listaCursos.find(curso => curso.id === id_curso);
        curso['cant_user'] = curso['cant_user'] - 1;
        guardar_curso();
        listaInscripciones = nuevo;
        let datos = JSON.stringify(listaInscripciones);
        fs.writeFile('./src/inscripciones.json', datos, (err) => {
            if (err) throw (err);
        });
        mensaje = "El curso se ha eliminado correctamente <a href='/listado_aspirantes' class='btn btn-link'>Regresar</a>";
    }
    return mensaje;
});

hbs.registerHelper('mostrarUsuarios', () => {
    if (localStorage.getItem('rol') === 'Coordinador') {
        getUsers();
        let texto="<div align='center' style='padding-top: 20px;'>\
        <h4>Listado de aspirantes<h4>\
        <table border='2' style='text-align: center;'>\
        <thead>\
            <th>Cedula</th>\
            <th>Nombre</th>\
            <th>Email</th>\
            <th>Telefono</th>\
            <th>Rol</th>\
        </thead>\
        <tbody>";

        listaUsers.forEach(user => {
            texto=texto+
            '<tr>'+
            '<td>' + user.cedula + '</td>' +
            '<td>' + user.nombre + '</td>' +
            '<td>'+ user.email + '</td>' +
            '<td>'+ user.telefono + '</td>' +
            '<td>'+ user.rol + '</td>';
        })
        texto=texto+"</tbody></table></div>\
        <div class='text-center' style='padding-top: 40px; border-style: groove;'>\
        <form action='/cambiar_rol' method='POST'>\
            <h4 class='text-center'>Cambiar el rol de un usuario<h4>\
            <label class='mb-3'>Cedula <input type='number' class='form-control' name='cedula' placeholder='Digite el la cedula del usuario' required></label>\
            <div class='form-group mb-3'>\
                <label>\
                    Rol\
                    <select class='form-control' name='rol'>\
                        <option value='Aspirante'>Aspirante</option>\
                        <option value='Coordinador'>Coordinador</option>\
                    </select>\
                </label>\
            </div>\
            <button class='btn btn-primary'>Guardar</button>\
        </form>\
        </div>";
        return texto;
    }
});

hbs.registerHelper('uptdateRol', (cedula, rol)=>{
    let mensaje = "";
    getUsers();

    let existe = listaUsers.find(ced => ced.cedula === cedula);
    if (existe) {
        existe['rol'] = rol;
        let datos = JSON.stringify(listaUsers);
        fs.writeFile('./src/usuarios.json', datos, (err) => {
            if (err) throw (err);
        });
        mensaje = "Se ha cambiado el rol del usuario a: " + rol + " <a href='/listado_usuarios'>Regresar</a>";
    } else {
        mensaje = "No se ha encontrado el usuario con el número de cedula ingresado <a href='/listado_usuarios'>Regresar</a>";
    }
    return mensaje;
});

hbs.registerHelper('setNavBar', () => {
    if (localStorage.getItem('rol') === 'Aspirante') {
        return navBarAsp;
    }
    if (localStorage.getItem('rol') === 'Coordinador') {
        return navBarCoord;
    }
});

hbs.registerHelper('cerrarSesion', () => {
    localStorage.removeItem('rol');
    localStorage.removeItem('user');
    localStorage.removeItem('cedula');
    return "<p>La sesión se ha cerrado con exito<a href='/' class='btn btn-link'>(Volver al inicio)</a></p>";
});
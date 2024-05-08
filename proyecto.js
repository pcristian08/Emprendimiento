const { body } = document;
const alternar = document.getElementById('light-dark');
const botonIngreso = document.getElementById('botonIngreso');
const botonEnviar = document.getElementById('botonEnviar');
const botonRealizarPedido = document.querySelector('.btn-warning');
const botonVaciarCarrito = document.querySelector('.btn-danger');

const usuarios = [
    { nombre: "Cristian", contrasenia: "1234" },
    { nombre: "Exequiel", contrasenia: "5678" },
    { nombre: "Florencia", contrasenia: "admin0000" },
    { nombre: "Marcelo", contrasenia: "inl24" },
    { nombre: "Juan", contrasenia: "asd$" }
];

let usuariosNuevos = [];

let intentos = 0;

function toggleTheme() {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function cargarTemaDesdeLocalStorage() {
    const temaGuardado = localStorage.getItem('theme');
    body.classList.toggle('dark-mode', temaGuardado === 'dark');
}

alternar.addEventListener('click', toggleTheme);
window.addEventListener('DOMContentLoaded', function() {
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
        usuarios.push(...JSON.parse(usuariosGuardados));
    }
    cargarTemaDesdeLocalStorage();
});

// Función para autenticar usuarios
function autenticarUsuario() {
    // Obtener valores de usuario y contraseña del formulario
    const userValue = document.getElementById('user').value.toUpperCase();
    const passValue = document.getElementById('pass').value;
    // Combinar usuarios existentes y nuevos en una sola lista
    const todosLosUsuarios = [...usuarios, ...usuariosNuevos];
    // Buscar el usuario en la lista combinada
    return todosLosUsuarios.find(usuario => usuario.nombre.toUpperCase() === userValue && usuario.contrasenia === passValue);
}

botonIngreso.addEventListener('click', function () {
    // Validar que los campos de usuario y contraseña no estén vacíos
    const usuario = document.getElementById('user').value.trim();
    const contrasenia = document.getElementById('pass').value.trim();

    if (usuario === '' || contrasenia === '') {
        alert('Por favor, complete todos los campos.');
        return;
    }

    // Si los campos están completos, proceder con la autenticación del usuario
    const usuarioValido = autenticarUsuario();
    if (usuarioValido) {
        Swal.fire("Bienvenido " + usuarioValido.nombre + "!");
        const contenedorProductos = document.getElementById('misProductos');
        let totalElement = document.getElementById('total');
        const tablaCarrito = document.getElementById('tableBody');
        let totalAPagar = 0;
        limpiarCamposEntrada();

        function renderizarProductos(listaProductos) {
            for (const producto of listaProductos) {
                contenedorProductos.innerHTML += `
                <div class="card" style="width: 18rem;">
                    <img src=${producto.foto} class="card-img-top" alt=${producto.nombre}>
                    <div class="card-body">
                        <h5 class="card-title">${producto.nombre}</h5>
                        <p class="card-text">Precio: $${producto.precio}</p>
                        <button class="btn btn-secondary agregar-carrito" data-id="${producto.id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}">Añadir al carrito</button>
                    </div>
                </div>`;
            }
        }
        renderizarProductos(productos);

        function agregarAlCarrito(id, nombre, precio) {
            agregarProductoAlCarrito(id, nombre, precio);
            recalcularTotalAPagar();
            mostrarMensajeConfirmacion(nombre);
        }
        
        function agregarProductoAlCarrito(id, nombre, precio) {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${id}</td>
                <td>${nombre}</td>
                <td>$${precio}</td>
                <td><button class="btn btn-danger eliminar-producto">X</button></td>
            `;
            tablaCarrito.appendChild(fila);
        
            // Agregar evento para eliminar producto del carrito
            fila.querySelector('.eliminar-producto').addEventListener('click', () => {
                eliminarProductoDelCarrito(fila, precio);
            });
        }
        
        function recalcularTotalAPagar() {
            totalAPagar = 0;
            tablaCarrito.querySelectorAll('tr').forEach(row => {
                const precioProducto = parseInt(row.querySelector('td:nth-child(3)').textContent.slice(1));
                totalAPagar += precioProducto;
            });
            totalElement.textContent = `Total a pagar: $${totalAPagar}`;
        }

        function eliminarProductoDelCarrito(fila) {
            // Eliminar la fila del DOM
            fila.remove();
            
            // Recalcular el total a pagar
            recalcularTotalAPagar();
        }
        
        function mostrarMensajeConfirmacion(nombre) {
            Toastify({
                text: `${nombre} ha sido añadido al carrito`,
                className: "info",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
            }).showToast();
        }

        document.querySelectorAll('.agregar-carrito').forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.dataset.id);
                const nombre = button.dataset.nombre;
                const precio = parseInt(button.dataset.precio);

                // Llamar a la función para agregar al carrito con los datos del producto
                agregarAlCarrito(id, nombre, precio);
            });
        });

        document.getElementById('user').value = ''; // Limpiar campo de usuario
        document.getElementById('pass').value = ''; // Limpiar campo de contraseña
    } else {
        intentos++;
        alert('Usuario y/o contraseña incorrecta');
        if (intentos === 3) {
            alert('Ha excedido el número máximo de intentos.');
        }
        limpiarCamposEntrada();
    }

    function limpiarCamposEntrada() {
        document.getElementById('user').value = '';
        document.getElementById('pass').value = '';
    }
});


function agregarNuevoUsuario(newUser, newPass) {
    // Agregar el nuevo usuario a la lista de usuarios nuevos
    usuariosNuevos.push({ nombre: newUser, contrasenia: newPass });

    // Guardar la lista de usuarios actualizada en localStorage
    localStorage.setItem('usuarios', JSON.stringify([...usuarios, ...usuariosNuevos]));
}

botonEnviar.addEventListener('click', function () {
    const newUser = document.getElementById('nombre').value.trim();
    const newPass = document.getElementById('contrasenia').value.trim();
    
    if (newUser === '' || newPass === '') {
        alert('Por favor, complete todos los campos.');
        return;
    }

    // Verificar si el usuario ya existe en la lista de usuarios
    const usuarioExistente = usuarios.find(usuario => usuario.nombre.toUpperCase() === newUser.toUpperCase());
    if (usuarioExistente) {
        alert('El usuario ya existe. Por favor, elija otro nombre de usuario.');
        return;
    }

    // Limpiar campos de entrada después de validar el nuevo usuario
    document.getElementById('nombre').value = '';
    document.getElementById('contrasenia').value = '';

    // Agregar el nuevo usuario y contraseña a la lista de usuarios nuevos
    usuariosNuevos.push({ nombre: newUser, contrasenia: newPass });

    // Guardar los usuarios en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuariosNuevos));

    // Mostrar la lista actualizada (esto es opcional, solo para verificar)
    console.log("Lista de usuarios nuevos:", usuariosNuevos);

    alert('Usuario agregado exitosamente.');

    // Restablecer campos de entrada a su estado original
    document.getElementById('user').value = '';
    document.getElementById('pass').value = '';
});

function mostrarAlertaConfirmacion(titulo, texto, confirmButtonText, cancelButtonText, confirmCallback) {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: "btn btn-success",
            cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
    });
    swalWithBootstrapButtons.fire({
        title: titulo,
        text: texto,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            confirmCallback();
        }
    });
}

botonRealizarPedido.addEventListener('click', function () {
    mostrarAlertaConfirmacion(
        "¿Estás seguro?",
        "Una vez realizado el pedido no se puede revertir.",
        "Sí, realizar pedido",
        "Cancelar",
        function () {
            // Aquí puedes agregar la lógica para realizar el pedido
            Swal.fire({
                title: "¡Pedido realizado!",
                text: "¡Gracias por tu compra!",
                icon: "success"
            });

            // Limpiar el formulario y el total a pagar
            document.getElementById('tableBody').innerHTML = ""; // Vaciar tabla del carrito
            document.getElementById('total').textContent = "Total a pagar: $0"; // Reiniciar total a pagar
        }
    );
});

// Evento para el botón "Vaciar carrito"
botonVaciarCarrito.addEventListener('click', function () {
    mostrarAlertaConfirmacion(
        "¿Estás seguro?",
        "Esta acción vaciará tu carrito de compras.",
        "Sí, vaciar carrito",
        "Cancelar",
        function () {
            document.getElementById('tableBody').innerHTML = ""; // Vaciar tabla del carrito
            document.getElementById('total').textContent = "Total a pagar: $0"; // Reiniciar total a pagar
            totalAPagar = 0; // Reiniciar la variable totalAPagar a 0
            Swal.fire({
                title: "¡Carrito vaciado!",
                text: "Tu carrito ha sido vaciado.",
                icon: "success"
            });
        }
    );
});
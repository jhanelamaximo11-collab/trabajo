// URL de tu Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxLFhI0mKU2MeLlO9rtJ1Fu2Zmg-6im-7EbjXEWUyKvaZTMwcbIbSxzzZ7_CBbdYq27/exec";
// ==========================================
// 1. FUNCIÓN PARA CARGAR LAS CARRERAS
// ==========================================
async function cargarCarreras() {
    const container = document.getElementById('programs-container');
    const selectCarrera = document.getElementById('select-carrera');

    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
            <i class="fa-solid fa-spinner fa-spin"></i> Cargando programas...
        </div>`;

    try {
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) throw new Error('Error de conexión');
        const carrerasData = await response.json();

        container.innerHTML = '';

        if (!carrerasData || carrerasData.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No se encontraron programas disponibles.</p>';
            return;
        }

        carrerasData.forEach(item => {
            const card = document.createElement('article');
            card.className = 'card';

            const imagenSrc = item.Imagen ? item.Imagen : 'https://via.placeholder.com/300x200?text=Sin+Imagen';
            const nombreLimpio = item.Carreras ? item.Carreras.replace(/'/g, "\\'") : ''; 

            card.innerHTML = `
                <img src="${imagenSrc}" alt="${item.Carreras}" loading="lazy" style="width: 100%; height: 200px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80'">
                <div class="card-body">
                    <h3 class="card-title">${item.Carreras}</h3>
                    <p class="card-text">${item.Descripcion}</p>
                    <button class="btn-info" onclick="seleccionarCarrera('${nombreLimpio}')">Más información</button>
                </div>
            `;
            container.appendChild(card);

            if (selectCarrera) {
                const option = document.createElement('option');
                option.value = item.Carreras;
                option.textContent = item.Carreras;
                selectCarrera.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: red;">Error al cargar los programas.</p>`;
    }
}

// ==========================================
// 2. FUNCIÓN PARA EL BOTÓN "MÁS INFORMACIÓN"
// ==========================================
function seleccionarCarrera(nombre) {
    const select = document.getElementById('select-carrera');
    if (select) select.value = nombre;
    
    const registro = document.getElementById('registro');
    if (registro) registro.scrollIntoView({ behavior: 'smooth' });
}

// ==========================================
// 3. FUNCIÓN PARA ENVIAR EL FORMULARIO (SIN ALERTAS)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    cargarCarreras();

    const formulario = document.getElementById('form-registro'); 
    
    if (formulario) {
        formulario.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const datos = {
                nombre: document.getElementById('nombre').value,
                correo: document.getElementById('correo').value,
                telefono: document.getElementById('telefono').value,
                carrera: document.getElementById('select-carrera').value,
                acepta: document.getElementById('acepta').checked
            };

            // Validación rápida visual
            if (!datos.nombre || !datos.correo || !datos.carrera) {
                mostrarNotificacion("Por favor, completa los campos obligatorios.", "error");
                return;
            }

            // --- AQUÍ ESTÁ EL TRUCO ---
            // 1. Limpiamos el formulario INMEDIATAMENTE (antes de enviar)
            formulario.reset(); 
            
            // 2. Mostramos un mensaje bonito que desaparece solo
            mostrarNotificacion("¡Registro exitoso! Tus datos han sido guardados.", "success");

            // 3. Enviamos los datos a Google en segundo plano
            try {
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(datos)
                });
            } catch (error) {
                console.error("Error al enviar:", error);
            }
        });
    }
});

// ==========================================
// 4. FUNCIÓN PARA CREAR LA NOTIFICACIÓN FLOTANTE
// ==========================================
function mostrarNotificacion(mensaje, tipo) {
    // Creamos el elemento
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    
    // Estilos en línea para que no tengas que tocar el CSS
    notificacion.style.position = 'fixed';
    notificacion.style.top = '20px';
    notificacion.style.right = '20px';
    notificacion.style.padding = '15px 25px';
    notificacion.style.borderRadius = '8px';
    notificacion.style.color = 'white';
    notificacion.style.fontWeight = 'bold';
    notificacion.style.zIndex = '9999';
    notificacion.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notificacion.style.transition = 'opacity 0.5s ease';
    
    // Color según el tipo
    if (tipo === 'success') {
        notificacion.style.backgroundColor = '#10b981'; // Verde
    } else {
        notificacion.style.backgroundColor = '#ef4444'; // Rojo
    }

    // Lo agregamos a la página
    document.body.appendChild(notificacion);

    // Lo hacemos desaparecer a los 3 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => {
            notificacion.remove(); // Lo borramos del HTML
        }, 500);
    }, 3000);
}
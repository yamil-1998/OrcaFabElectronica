document.addEventListener("DOMContentLoaded", () => {
    let productosData = []; // Aquí se guardarán los productos del JSON
    const contenedor = document.getElementById("contenedor-productos");
    const botonesCategoria = document.querySelectorAll(".btn-categoria");

    // 1. Inyectar la estructura del Modal de Detalles al final del body
    const modalContainer = document.createElement("div");
    modalContainer.id = "modal-detalle";
    modalContainer.classList.add("modal");
    modalContainer.innerHTML = `
        <div class="modal-contenido">
            <span class="cerrar-modal">&times;</span>
            <div class="modal-layout">
                <div class="modal-imagenes">
                    <img id="modal-img-principal" src="" alt="Producto">
                    <div id="modal-galeria" class="modal-galeria"></div>
                </div>
                <div class="modal-info">
                    <h2 id="modal-titulo"></h2>
                    <p id="modal-precio" class="precio"></p>
                    <p id="modal-descripcion"></p>
                    <a id="modal-whatsapp" href="" target="_blank" class="btn-whatsapp">
                        <i class="fab fa-whatsapp"></i> Consultar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);

    // Cerrar el modal
    modalContainer.querySelector(".cerrar-modal").addEventListener("click", () => modalContainer.classList.remove("mostrar"));
    modalContainer.addEventListener("click", (e) => { if(e.target === modalContainer) modalContainer.classList.remove("mostrar"); });

    // 2. CARGAR EL ARCHIVO JSON EXTERNO (Perfecto para GitHub)
    fetch("productos.json")
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el JSON");
            return response.json();
        })
        .then(data => {
            productosData = data;
            // Por defecto muestra "Todos" al cargar la página
            filtrarProductos("Todos");
        })
        .catch(error => console.error("Error cargando los productos:", error));

    // 3. Escuchar clicks en las categorías
    botonesCategoria.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesCategoria.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            filtrarProductos(e.target.getAttribute("data-cat"));
        });
    });

    // 4. Función para renderizar la tienda
    function filtrarProductos(categoria) {
        contenedor.innerHTML = ""; 

        const productosFiltrados = categoria === "Todos" 
            ? productosData 
            : productosData.filter(p => p.categoria === categoria);

        productosFiltrados.forEach(prod => {
            const estadoTexto = prod.disponible ? "Disponible" : "Agotado";
            const estadoClase = prod.disponible ? "disponible" : "agotado";

            let galeriaHtml = "";
            if(prod.imagenes_extra && prod.imagenes_extra.length > 0){
                prod.imagenes_extra.forEach(imgUrl => {
                    galeriaHtml += `<img src="${imgUrl}" alt="Extra">`;
                });
            }

            const card = document.createElement("div");
            card.classList.add("tarjeta-producto");
            card.innerHTML = `
                <div class="tarjeta-interna">
                    <div class="cara-frontal">
                        <img src="${prod.imagen}" alt="${prod.titulo}">
                        <div class="info-prod">
                            <h3>${prod.titulo}</h3>
                            <p class="precio">${prod.precio}</p>
                            <div><span class="status ${estadoClase}">${estadoTexto}</span></div>
                        </div>
                    </div>
                    <div class="cara-posterior">
                        <div class="gif-container">
                            <img src="${prod.gif}" alt="Vista GIF">
                        </div>
                        <div class="botones-posterior">
                            <button class="btn-saber-mas" data-id="${prod.id}">
                                <i class="fas fa-info-circle"></i> Saber más
                            </button>
                            <a href="https://wa.me/59112345678?text=Hola!%20Me%20interesa%20el%20producto:%20${encodeURIComponent(prod.titulo)}" 
                               target="_blank" class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i> Pedir
                            </a>
                        </div>
                    </div>
                </div>
            `;

            // Lógica de volteo único
            card.addEventListener("click", (e) => {
                if (e.target.closest(".btn-saber-mas") || e.target.closest(".btn-whatsapp")) return;

                const yaVolteada = card.classList.contains("volteada");
                document.querySelectorAll(".tarjeta-producto").forEach(t => t.classList.remove("volteada"));
                
                if (!yaVolteada) {
                    card.classList.add("volteada");
                }
            });

            // Botón saber más -> abre modal
            card.querySelector(".btn-saber-mas").addEventListener("click", () => {
                abrirDetallesProducto(prod);
            });

            contenedor.appendChild(card);
        });
    }

    function abrirDetallesProducto(prod) {
        document.getElementById("modal-titulo").innerText = prod.titulo;
        document.getElementById("modal-precio").innerText = prod.precio;
        document.getElementById("modal-descripcion").innerText = prod.descripcion;
        document.getElementById("modal-img-principal").src = prod.imagen;
        document.getElementById("modal-whatsapp").href = `https://wa.me/59112345678?text=Hola!%20Vengo%20de%20ver%20los%20detalles%20de:%20${encodeURIComponent(prod.titulo)}`;

        const galeria = document.getElementById("modal-galeria");
        galeria.innerHTML = ""; 

        const imgPrincipalThumb = document.createElement("img");
        imgPrincipalThumb.src = prod.imagen;
        imgPrincipalThumb.addEventListener("click", () => document.getElementById("modal-img-principal").src = prod.imagen);
        galeria.appendChild(imgPrincipalThumb);

        if(prod.imagenes_extra && prod.imagenes_extra.length > 0) {
            prod.imagenes_extra.forEach(url => {
                const imgThumb = document.createElement("img");
                imgThumb.src = url;
                imgThumb.addEventListener("click", () => document.getElementById("modal-img-principal").src = url);
                galeria.appendChild(imgThumb);
            });
        }

        modalContainer.classList.add("mostrar");
    }
});
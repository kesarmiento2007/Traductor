// Variables

const contenedorMensaje = document.querySelector(".contenedor-msj");
const divMensaje = document.querySelector(".mensaje");
const selectFrom = document.querySelector("#from");
const selectTo = document.querySelector("#to");
const microBtn = document.querySelector(".microfono-btn");

let recognition;


document.addEventListener("DOMContentLoaded", () => {

    microBtn.addEventListener("click", () => {
        if(microBtn.classList.contains("activado")) {
            escuchar(true);
            return;
        }
        escuchar();
    });
});


// Funciones

function escuchar(activado=false) {

    microBtn.classList.toggle("activado");

    if(activado) {
        recognition.stop();
    } else {
        const SpeechRecognition = webkitSpeechRecognition;
        recognition = new SpeechRecognition();

        recognition.start();
    }

    recognition.onstart = function() {
        divMensaje.classList.add("hidden");

        microBtn.children[0].name = "stop-circle-outline";

        const contenedorTraduccion = document.querySelector(".contenedor-traduccion");
        if(contenedorTraduccion) {
            contenedorTraduccion.remove();
        }

        const spinner = document.querySelector(".contenedor-spinner");
        if(!spinner) {

            const spinner = document.createElement("DIV");
            spinner.classList.add("contenedor-spinner");

            spinner.innerHTML = `
                <div class="spinner">
                    <div class="rect1"></div>
                    <div class="rect2"></div>
                    <div class="rect3"></div>
                    <div class="rect4"></div>
                    <div class="rect5"></div>
                </div>
            `;

            contenedorMensaje.appendChild(spinner);
        }
    }

    recognition.onspeechend = function() {
        recognition.stop();
    }

    recognition.onresult = function(e) {
        microBtn.children[0].name = "mic-outline";

        contenedorMensaje.removeChild(contenedorMensaje.lastChild);

        const { transcript } = e.results[0][0];

        if(!transcript) {
            mostrarError("No se Escuchó o se Entendió tu Mensaje");
            return;
        }

        traducirTexto(transcript);
    }
}

function traducirTexto(texto) {

    const traduccionFrom = selectFrom.value;
    const traduccionTo = selectTo.value;

    const apiUrl = `https://api.mymemory.translated.net/get?q=${texto}&langpair=${traduccionFrom}|${traduccionTo}`;
    fetch(apiUrl)
        .then( res => res.json() )
        .then( data => {
            mostrarTraduccion(data.responseData.translatedText);
            textoAVoz(data.responseData.translatedText);
        })
}

function mostrarTraduccion(texto) {

    const contenedorTraduccion = document.createElement("DIV");
    contenedorTraduccion.classList.add("contenedor-traduccion");

    const megafono = document.createElement("DIV");
    megafono.classList.add("megafono");

    const megafonoBtn = document.createElement("BUTTON");
    megafonoBtn.classList.add("megafono-btn");
    megafonoBtn.innerHTML = `<ion-icon name="volume-high-outline"></ion-icon>`;
    megafonoBtn.onclick = function() {
        textoAVoz(texto);
    }

    const textoTraducido = document.createElement("DIV");
    textoTraducido.classList.add("traduccion-texto");
    textoTraducido.textContent = texto;

    megafono.appendChild(megafonoBtn);
    contenedorTraduccion.appendChild(megafono);
    contenedorTraduccion.appendChild(textoTraducido);
    contenedorMensaje.appendChild(contenedorTraduccion);
}

function textoAVoz(texto) {

    const voz = new SpeechSynthesisUtterance();
    voz.rate = 0.7;

    const synth = window.speechSynthesis;

    voz.text = texto;
    synth.speak(voz);
}


function mostrarError(mensaje) {
    const error = contenedorMensaje.querySelector(".error");

    if(!error) {
        // Crear alerta
        const error = document.createElement("DIV");

        error.classList.add("error");
        error.textContent = mensaje;

        contenedorMensaje.appendChild(error);

        setTimeout(() => {
            error.remove();
            divMensaje.classList.remove("hidden");
        }, 2000);
    }
}
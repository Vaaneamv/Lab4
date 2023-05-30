// ==UserScript==
// @name         Descifrado de mensajes y obtener llave de cifrado en Tampermonkey
// @namespace    http://your-namespace
// @version      1.0
// @description  Descifra los mensajes de la clase "M1", "M2", etc. en la página web "https://cripto.tiiny.site" utilizando la llave de cifrado obtenida. Evita las palabras "3DES", "ECB" y "DES". Muestra la llave de cifrado, la cantidad de mensajes y los IDs descifrados en la consola.
// @author       Your Name
// @match        https://cripto.tiiny.site/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Agrega la URL del archivo CryptoJS descargado
    var cryptoJSUrl = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js';
    // Agrega el valor del hash SRI correspondiente al archivo CryptoJS descargado
    var cryptoJSSRI = 'sha256-6rXZCnFzbyZ685/fMsqoxxZz/QZwMnmwHg+SsNe+C/w=';

    // Función para cargar el archivo CryptoJS con SRI
    function loadCryptoJS() {
        return new Promise(function(resolve, reject) {
            var script = document.createElement('script');
            script.src = cryptoJSUrl;
            script.integrity = cryptoJSSRI;  // Agrega el atributo integrity con el valor del hash SRI
            script.crossOrigin = 'anonymous';  // Agrega el atributo crossOrigin para solicitar el recurso de forma anónima
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Función para calcular la contraseña desde la primera oración de la clase Parrafo
    function calcularContraseña() {
        var primerParrafo = document.querySelector('.Parrafo');
        var contenido = primerParrafo.textContent;
        var contraseña = '';

        // Obtener la primera mayúscula de la clase Parrafo
        var mayusculaInicial = contenido.match(/[A-Z]/)[0];
        contraseña += mayusculaInicial;

        // Buscar las mayúsculas al principio de cada oración
        var matches = contenido.match(/([.!?]+\s+)([A-Z])/g);
        if (matches) {
            for (var j = 0; j < matches.length; j++) {
                var match = matches[j];
                var mayuscula = match.charAt(match.length - 1);
                contraseña += mayuscula;
            }
        }

        return contraseña;
    }

    // Función principal para descifrar los mensajes
    function descifrarMensajes() {
        // Verificar si CryptoJS está definido
        if (typeof CryptoJS === 'undefined') {
            console.error('CryptoJS no está definido. Verifica la URL del archivo CryptoJS.');
            return;
        }

        var cantidadMensajes = document.querySelectorAll('[class^="M"]').length;

        // Calcular la contraseña desde la primera oración de la clase Parrafo
        var contraseña = calcularContraseña();
        console.log("La contraseña es: " + contraseña);

        console.log("Cantidad de mensajes: " + cantidadMensajes);

        for (var j = 1; j <= cantidadMensajes; j++) {
            var mensajeCifradoBase64 = document.querySelector('.M' + j).id;
            var mensajeCifrado = CryptoJS.enc.Base64.parse(mensajeCifradoBase64);
            var llaveCifrado = CryptoJS.enc.Utf8.parse(contraseña);
            var mensajeDescifrado = CryptoJS.TripleDES.decrypt({ ciphertext: mensajeCifrado }, llaveCifrado, { mode: CryptoJS.mode.ECB }).toString(CryptoJS.enc.Utf8);
            console.log(mensajeCifradoBase64 + " " + mensajeDescifrado);

            // Imprimir el mensaje en texto plano en la página web
            document.querySelector('.M' + j).textContent = mensajeDescifrado;
        }
    }

    // Cargar CryptoJS con SRI y luego descifrar los mensajes
    loadCryptoJS().then(function() {
        descifrarMensajes();
    }).catch(function(error) {
        console.error('Error al cargar CryptoJS:', error);
    });
})();


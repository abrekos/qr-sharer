// ==UserScript==
// @name         QR sharer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет кнопку для показа QR-кода с адресом текущей страницы
// @author       Abrekos
// @match        http://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
    	scripts: [
    		'https://raw.githubusercontent.com/abrekos/qr-sharer/master/src/vk-qr.min.js'
    	]
    }

    const STYLES = `
		.qr-sharer__button {
			position: absolute;
			top: 20px;
			right: 20px;
			z-index: 1000
		}

    `

    loadScript = ( url, callback ) => {
    	let script = window.document.createElement( 'script' )
    	script.src = url
    	script.onload = callback

    	window.document.head.appendChild( script )
    }

    buildButton = () => {
    	let button = window.document.createElement( 'div' )
    	button.classList = 'qr-sharer__button'

    	window.document.body.appendChild( button )
    }


})();
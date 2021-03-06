// ==UserScript==
// @name         QR sharer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Добавляет кнопку для показа QR-кода с адресом текущей страницы
// @author       Abrekos
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function( window ) {
    'use strict';

    if ( window.self != window.top) {
        return;
    }

    const STYLES = `
	    @import url('https://fonts.googleapis.com/css?family=Roboto:300,500&subset=cyrillic');

		.qr-sharer__button {
			position: fixed;
			top: 10px;
			right: 10px;
			z-index: 99999;
			width: 24px;
			height: 24px;
			cursor: pointer;
			color: rgba( 0, 0, 0, 0.3 );
			padding: 5px;
			border-radius: 5px;
		}
		
		.qr-sharer__button:hover {
			color: rgba( 0, 0, 0, 1 );
			background: #fff;
		}

		.qr-sharer__popup-cover {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba( 0, 0, 0, 0.3 );
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 1000;
		}

		.qr-sharer__popup {
			top: 10px;
			right: 10px;
			padding: 30px;
			max-width: 100%;
			box-sizing: border-box;
			background: #fff;
			color: #000;
			border-radius: 8px;
			width: 300px;
		    font-family: 'Roboto';
		    text-align: center;
		}

		.qr-sharer__popup h2 {
			font-size: 18px;
			margin: 0;
			margin-bottom: 20px;
			font-weight: 500;
		}

		.qr-sharer__qr {
			width: 150px;
			height: 150px;
			margin: 20px auto;
		}

		.qr-sharer__close-button {
			width: 100%;
			padding: 8px 15px;
			box-sizing: border-box;
			color: #fff;
			background: #121212;
			border-radius: 8px;
			cursor: pointer;
			margin-top: 10px;
		}

		.qr-sharer__close-button:hover {
			background: #000;
		}
    `
    const QR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="qr_24"><g fill="none" fill-rule="evenodd"><path d="M0 0h24v24H0z"></path><path d="M19.5 19H21a.5.5 0 0 1 .5.5V21a.5.5 0 0 1-.5.5h-1.5a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5zM14 19h1.5a.5.5 0 0 1 .5.5V21a.5.5 0 0 1-.5.5H14a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5zm2.75-2.75h1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5zm2.75-2.75H21a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a.5.5 0 0 1-.5-.5V14a.5.5 0 0 1 .5-.5zm-5.5 0h1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5H14a.5.5 0 0 1-.5-.5V14a.5.5 0 0 1 .5-.5zM4.5 13h4a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 8.5 22h-4A2.5 2.5 0 0 1 2 19.5v-4A2.5 2.5 0 0 1 4.5 13zm.25 1.75a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-3.5zm1 1.5h1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5zM15.5 2h4A2.5 2.5 0 0 1 22 4.5v4a2.5 2.5 0 0 1-2.5 2.5h-4A2.5 2.5 0 0 1 13 8.5v-4A2.5 2.5 0 0 1 15.5 2zm.25 1.75a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-3.5zm1 1.5h1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5zM4.5 2h4A2.5 2.5 0 0 1 11 4.5v4A2.5 2.5 0 0 1 8.5 11h-4A2.5 2.5 0 0 1 2 8.5v-4A2.5 2.5 0 0 1 4.5 2zm.25 1.75a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-3.5zm1 1.5h1.5a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-.5.5h-1.5a.5.5 0 0 1-.5-.5v-1.5a.5.5 0 0 1 .5-.5z" fill="currentColor"></path></g></svg>'


    function addStyles() {
    	let style = window.document.createElement( 'style' )
    	style.innerText = STYLES

    	window.document.head.appendChild( style )
    }

    function buildButton() {
    	let button = window.document.createElement( 'div' )
    	button.className = 'qr-sharer__button'
    	button.innerHTML = QR_ICON

    	button.onclick = function( event ) {
    		event.currentTarget.remove()
    		buildPopup()
    	}

    	window.document.body.appendChild( button )
    }

    function buildPopup() {
    	let wrapper = window.document.createElement( 'div' )
    	wrapper.className = 'qr-sharer__popup-cover'

    	let popup = window.document.createElement( 'div' )
    	popup.className = 'qr-sharer__popup'

    	let h2 = window.document.createElement( 'div' )
    	h2.innerText = 'QR-код'

    	let qr = window.document.createElement( 'div' )
    	qr.className = 'qr-sharer__qr'
    	qr.innerHTML = createQR( window.location.href, {
			qrSize: 150,
			isShowLogo: false
		} )

		let site = window.document.createElement( 'div' )
    	site.innerText = window.document.title

    	let close_button = window.document.createElement( 'div' )
    	close_button.className = 'qr-sharer__close-button'
    	close_button.innerText = 'Закрыть'

    	close_button.onclick = function () {
    		wrapper.remove()
    		buildButton()
    	}

    	popup.appendChild( h2 )
    	popup.appendChild( qr )
    	popup.appendChild( site )
    	popup.appendChild( close_button )

    	wrapper.appendChild( popup )
    	window.document.body.appendChild( wrapper )
    }


    function init() {
    	console.log( 'QR sharer v1.0' )
    	addStyles()
    	buildButton()
    }

    // --------- VK QR code generator --------------

    var QrOptions={qrSize:"number",className:"string",isShowLogo:"boolean",isShowBackground:"boolean",backgroundColor:"string",foregroundColor:"string",logoColor:"string",logoData:0,suffix:"string"};class QrCode{constructor(a,b,c,d){if(this.version=a,this.errorCorrectionLevel=b,this.mask=d,this.modules=[],this.isFunction=[],a<QrCode.MIN_VERSION||a>QrCode.MAX_VERSION)throw"Version value out of range";if(-1>d||7<d)throw"Mask value out of range";this.size=4*a+17;let e=[];for(let f=0;f<this.size;f++)e.push(!1);for(let f=0;f<this.size;f++)this.modules.push(e.slice()),this.isFunction.push(e.slice());this.drawFunctionPatterns();const f=this.addEccAndInterleave(c);if(this.drawCodewords(f),-1==d){let a=1e9;for(let b=0;8>b;b++){this.applyMask(b),this.drawFormatBits(b);const c=this.getPenaltyScore();c<a&&(d=b,a=c),this.applyMask(b)}}if(0>d||7<d)throw"Assertion error";this.mask=d,this.applyMask(d),this.drawFormatBits(d),this.isFunction=[]}static encodeText(a,b){const c=QrSegment.makeSegments(a);return QrCode.encodeSegments(c,b)}static encodeBinary(a,b){const c=QrSegment.makeBytes(a);return QrCode.encodeSegments([c],b)}static encodeSegments(a,b,c=1,d=40,e=-1,f=!0){if(!(QrCode.MIN_VERSION<=c&&c<=d&&d<=QrCode.MAX_VERSION)||-1>e||7<e)throw"Invalid value";let g,h;for(g=c;;g++){const c=8*QrCode.getNumDataCodewords(g,b),e=QrSegment.getTotalBits(a,g);if(e<=c){h=e;break}if(g>=d)throw"Data too long"}for(const i of[QrCode.Ecc.MEDIUM,QrCode.Ecc.QUARTILE,QrCode.Ecc.HIGH])f&&h<=8*QrCode.getNumDataCodewords(g,i)&&(b=i);let i=new BitBuffer;for(const h of a){i.appendBits(h.mode.modeBits,4),i.appendBits(h.numChars,h.mode.numCharCountBits(g));for(const a of h.getData())i.array.push(a)}if(i.array.length!=h)throw"Assertion error";const j=8*QrCode.getNumDataCodewords(g,b);if(i.array.length>j)throw"Assertion error";if(i.appendBits(0,Math.min(4,j-i.array.length)),i.appendBits(0,(8-i.array.length%8)%8),0!=i.array.length%8)throw"Assertion error";for(let g=236;i.array.length<j;g^=253)i.appendBits(g,8);let k=[];for(;8*k.length<i.array.length;)k.push(0);return i.array.forEach((a,b)=>k[b>>>3]|=a<<7-(7&b)),new QrCode(g,b,k,e)}getModule(a,b){return 0<=a&&a<this.size&&0<=b&&b<this.size&&this.modules[b][a]}drawCanvas(a,b,c){if(0>=a||0>b)throw"Value out of range";const d=(this.size+2*b)*a;c.width=d,c.height=d;let e=c.getContext("2d");for(let d=-b;d<this.size+b;d++)for(let c=-b;c<this.size+b;c++)e.fillStyle=this.getModule(c,d)?"#000000":"#FFFFFF",e.fillRect((c+b)*a,(d+b)*a,a,a)}toSvgString(a){if(0>a)throw"Border must be non-negative";let b=[];for(let c=0;c<this.size;c++)for(let d=0;d<this.size;d++)this.getModule(d,c)&&b.push(`M${d+a},${c+a}h1v1h-1z`);return`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${this.size+2*a} ${this.size+2*a}" stroke="none">
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  <path d="${b.join(" ")}" fill="#000000"/>
</svg>
`}drawFunctionPatterns(){for(let a=0;a<this.size;a++)this.setFunctionModule(6,a,0==a%2),this.setFunctionModule(a,6,0==a%2);this.drawFinderPattern(3,3),this.drawFinderPattern(this.size-4,3),this.drawFinderPattern(3,this.size-4);const a=this.getAlignmentPatternPositions(),b=a.length;for(let c=0;c<b;c++)for(let d=0;d<b;d++)(0!=c||0!=d)&&(0!=c||d!=b-1)&&(c!=b-1||0!=d)&&this.drawAlignmentPattern(a[c],a[d]);this.drawFormatBits(0),this.drawVersion()}drawFormatBits(a){const b=this.errorCorrectionLevel.formatBits<<3|a;let c=b;for(let b=0;10>b;b++)c=c<<1^1335*(c>>>9);const d=21522^(b<<10|c);if(0!=d>>>15)throw"Assertion error";for(let b=0;5>=b;b++)this.setFunctionModule(8,b,getBit(d,b));this.setFunctionModule(8,7,getBit(d,6)),this.setFunctionModule(8,8,getBit(d,7)),this.setFunctionModule(7,8,getBit(d,8));for(let b=9;15>b;b++)this.setFunctionModule(14-b,8,getBit(d,b));for(let b=0;8>b;b++)this.setFunctionModule(this.size-1-b,8,getBit(d,b));for(let b=8;15>b;b++)this.setFunctionModule(8,this.size-15+b,getBit(d,b));this.setFunctionModule(8,this.size-8,!0)}drawVersion(){if(7>this.version)return;let a=this.version;for(let b=0;12>b;b++)a=a<<1^7973*(a>>>11);const c=this.version<<12|a;if(0!=c>>>18)throw"Assertion error";for(let d=0;18>d;d++){const e=getBit(c,d),f=this.size-11+d%3,a=Math.floor(d/3);this.setFunctionModule(f,a,e),this.setFunctionModule(a,f,e)}}drawFinderPattern(a,b){for(let c=-4;4>=c;c++)for(let d=-4;4>=d;d++){const e=Math.max(Math.abs(d),Math.abs(c)),f=a+d,g=b+c;0<=f&&f<this.size&&0<=g&&g<this.size&&this.setFunctionModule(f,g,2!=e&&4!=e)}}drawAlignmentPattern(a,b){for(let c=-2;2>=c;c++)for(let d=-2;2>=d;d++)this.setFunctionModule(a+d,b+c,1!=Math.max(Math.abs(d),Math.abs(c)))}setFunctionModule(a,b,c){this.modules[b][a]=c,this.isFunction[b][a]=!0}addEccAndInterleave(a){const b=this.version,c=this.errorCorrectionLevel;if(a.length!=QrCode.getNumDataCodewords(b,c))throw"Invalid argument";const d=QrCode.NUM_ERROR_CORRECTION_BLOCKS[c.ordinal][b],e=QrCode.ECC_CODEWORDS_PER_BLOCK[c.ordinal][b],f=Math.floor(QrCode.getNumRawDataModules(b)/8),g=d-f%d,h=Math.floor(f/d);let l=[];const m=new ReedSolomonGenerator(e);for(let b,c=0,f=0;c<d;c++){b=a.slice(f,f+h-e+(c<g?0:1)),f+=b.length;const d=m.getRemainder(b);c<g&&b.push(0),l.push(b.concat(d))}let k=[];for(let b=0;b<l[0].length;b++)for(let a=0;a<l.length;a++)(b!=h-e||a>=g)&&k.push(l[a][b]);if(k.length!=f)throw"Assertion error";return k}drawCodewords(a){if(a.length!=Math.floor(QrCode.getNumRawDataModules(this.version)/8))throw"Invalid argument";let b=0;for(let c=this.size-1;1<=c;c-=2){6==c&&(c=5);for(let d=0;d<this.size;d++)for(let e=0;2>e;e++){const f=c-e,g=0==(2&c+1),h=g?this.size-1-d:d;!this.isFunction[h][f]&&b<8*a.length&&(this.modules[h][f]=getBit(a[b>>>3],7-(7&b)),b++)}}if(b!=8*a.length)throw"Assertion error"}applyMask(a){if(0>a||7<a)throw"Mask value out of range";for(let b=0;b<this.size;b++)for(let c=0;c<this.size;c++){let d;switch(a){case 0:d=0==(c+b)%2;break;case 1:d=0==b%2;break;case 2:d=0==c%3;break;case 3:d=0==(c+b)%3;break;case 4:d=0==(Math.floor(c/3)+Math.floor(b/2))%2;break;case 5:d=0==c*b%2+c*b%3;break;case 6:d=0==(c*b%2+c*b%3)%2;break;case 7:d=0==((c+b)%2+c*b%3)%2;break;default:throw"Assertion error";}!this.isFunction[b][c]&&d&&(this.modules[b][c]=!this.modules[b][c])}}getPenaltyScore(){let a=0;for(let b=0;b<this.size;b++){let c=[0,0,0,0,0,0,0],d=!1,e=0;for(let f=0;f<this.size;f++)this.modules[b][f]==d?(e++,5==e?a+=QrCode.PENALTY_N1:5<e&&a++):(QrCode.addRunToHistory(e,c),!d&&QrCode.hasFinderLikePattern(c)&&(a+=QrCode.PENALTY_N3),d=this.modules[b][f],e=1);QrCode.addRunToHistory(e,c),d&&QrCode.addRunToHistory(0,c),QrCode.hasFinderLikePattern(c)&&(a+=QrCode.PENALTY_N3)}for(let b=0;b<this.size;b++){let c=[0,0,0,0,0,0,0],d=!1,e=0;for(let f=0;f<this.size;f++)this.modules[f][b]==d?(e++,5==e?a+=QrCode.PENALTY_N1:5<e&&a++):(QrCode.addRunToHistory(e,c),!d&&QrCode.hasFinderLikePattern(c)&&(a+=QrCode.PENALTY_N3),d=this.modules[f][b],e=1);QrCode.addRunToHistory(e,c),d&&QrCode.addRunToHistory(0,c),QrCode.hasFinderLikePattern(c)&&(a+=QrCode.PENALTY_N3)}for(let b=0;b<this.size-1;b++)for(let c=0;c<this.size-1;c++){const d=this.modules[b][c];d==this.modules[b][c+1]&&d==this.modules[b+1][c]&&d==this.modules[b+1][c+1]&&(a+=QrCode.PENALTY_N2)}let b=0;for(const a of this.modules)for(const c of a)c&&b++;const c=this.size*this.size,d=Math.ceil(Math.abs(20*b-10*c)/c)-1;return a+=d*QrCode.PENALTY_N4,a}getAlignmentPatternPositions(){if(1==this.version)return[];else{const a=Math.floor(this.version/7)+2,b=32==this.version?26:2*Math.ceil((this.size-13)/(2*a-2));let c=[6];for(let d=this.size-7;c.length<a;d-=b)c.splice(1,0,d);return c}}static getNumRawDataModules(a){if(a<QrCode.MIN_VERSION||a>QrCode.MAX_VERSION)throw"Version number out of range";let b=(16*a+128)*a+64;if(2<=a){const c=Math.floor(a/7)+2;b-=(25*c-10)*c-55,7<=a&&(b-=36)}return b}static getNumDataCodewords(a,b){return Math.floor(QrCode.getNumRawDataModules(a)/8)-QrCode.ECC_CODEWORDS_PER_BLOCK[b.ordinal][a]*QrCode.NUM_ERROR_CORRECTION_BLOCKS[b.ordinal][a]}static addRunToHistory(a,b){b.pop(),b.unshift(a)}static hasFinderLikePattern(a){const b=a[1];return 0<b&&a[2]==b&&a[4]==b&&a[5]==b&&a[3]==3*b&&Math.max(a[0],a[6])>=4*b}}QrCode.MIN_VERSION=1,QrCode.MAX_VERSION=40,QrCode.PENALTY_N1=3,QrCode.PENALTY_N2=3,QrCode.PENALTY_N3=40,QrCode.PENALTY_N4=10,QrCode.ECC_CODEWORDS_PER_BLOCK=[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]],QrCode.NUM_ERROR_CORRECTION_BLOCKS=[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]];function getBit(a,b){return 0!=(1&a>>>b)}class QrSegment{constructor(a,b,c){if(this.mode=a,this.numChars=b,this.bitData=c,0>b)throw"Invalid argument";this.bitData=c.slice()}static makeBytes(a){let c=new BitBuffer;for(const d of a)c.appendBits(d,8);return new QrSegment(QrSegment.Mode.BYTE,a.length,c.array)}static makeNumeric(a){if(!this.NUMERIC_REGEX.test(a))throw"String contains non-numeric characters";let b=new BitBuffer;for(let c=0;c<a.length;){const d=Math.min(a.length-c,3);b.appendBits(parseInt(a.substr(c,d),10),3*d+1),c+=d}return new QrSegment(QrSegment.Mode.NUMERIC,a.length,b.array)}static makeAlphanumeric(a){if(!this.ALPHANUMERIC_REGEX.test(a))throw"String contains unencodable characters in alphanumeric mode";let b,c=new BitBuffer;for(b=0;b+2<=a.length;b+=2){let d=45*QrSegment.ALPHANUMERIC_CHARSET.indexOf(a.charAt(b));d+=QrSegment.ALPHANUMERIC_CHARSET.indexOf(a.charAt(b+1)),c.appendBits(d,11)}return b<a.length&&c.appendBits(QrSegment.ALPHANUMERIC_CHARSET.indexOf(a.charAt(b)),6),new QrSegment(QrSegment.Mode.ALPHANUMERIC,a.length,c.array)}static makeSegments(a){return""==a?[]:this.NUMERIC_REGEX.test(a)?[QrSegment.makeNumeric(a)]:this.ALPHANUMERIC_REGEX.test(a)?[QrSegment.makeAlphanumeric(a)]:[QrSegment.makeBytes(QrSegment.toUtf8ByteArray(a))]}static makeEci(a){let b=new BitBuffer;if(0>a)throw"ECI assignment value out of range";else if(a<128)b.appendBits(a,8);else if(a<16384)b.appendBits(2,2),b.appendBits(a,14);else if(1e6>a)b.appendBits(6,3),b.appendBits(a,21);else throw"ECI assignment value out of range";return new QrSegment(QrSegment.Mode.ECI,0,b.array)}getData(){return this.bitData.slice()}static getTotalBits(a,b){let c=0;for(const d of a){const a=d.mode.numCharCountBits(b);if(d.numChars>=1<<a)return 1/0;c+=4+a+d.bitData.length}return c}static toUtf8ByteArray(a){a=encodeURI(a);let b=[];for(let c=0;c<a.length;c++)"%"==a.charAt(c)?(b.push(parseInt(a.substr(c+1,2),16)),c+=2):b.push(a.charCodeAt(c));return b}}QrSegment.NUMERIC_REGEX=/^[0-9]*$/,QrSegment.ALPHANUMERIC_REGEX=/^[A-Z0-9 $%*+.\/:-]*$/,QrSegment.ALPHANUMERIC_CHARSET="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";class ReedSolomonGenerator{constructor(a){if(this.coefficients=[],1>a||255<a)throw"Degree out of range";let b=this.coefficients;for(let c=0;c<a-1;c++)b.push(0);b.push(1);let c=1;for(let d=0;d<a;d++){for(let a=0;a<b.length;a++)b[a]=ReedSolomonGenerator.multiply(b[a],c),a+1<b.length&&(b[a]^=b[a+1]);c=ReedSolomonGenerator.multiply(c,2)}}getRemainder(a){let c=this.coefficients.map(()=>0);for(const d of a){const a=d^c.shift();c.push(0),this.coefficients.forEach((b,d)=>c[d]^=ReedSolomonGenerator.multiply(b,a))}return c}static multiply(a,b){if(0!=a>>>8||0!=b>>>8)throw"Byte out of range";let c=0;for(let d=7;0<=d;d--)c=c<<1^285*(c>>>7),c^=(1&b>>>d)*a;if(0!=c>>>8)throw"Assertion error";return c}}class BitBuffer{constructor(){this.array=[]}appendBits(a,b){if(0>b||31<b||0!=a>>>b)throw"Value out of range";for(let c=b-1;0<=c;c--)this.array.push(1&a>>>c)}}(function(a){class b{constructor(a,b){this.ordinal=a,this.formatBits=b}}b.LOW=new b(0,1),b.MEDIUM=new b(1,0),b.QUARTILE=new b(2,3),b.HIGH=new b(3,2),a.Ecc=b})(QrCode||(QrCode={})),function(a){class b{constructor(a,b){this.modeBits=a,this.numBitsCharCount=b}numCharCountBits(a){return this.numBitsCharCount[Math.floor((a+7)/17)]}}b.NUMERIC=new b(1,[10,12,14]),b.ALPHANUMERIC=new b(2,[9,11,13]),b.BYTE=new b(4,[8,16,16]),b.KANJI=new b(8,[8,10,12]),b.ECI=new b(7,[0,0,0]),a.Mode=b}(QrSegment||(QrSegment={}));const MULTI=1,QR_BORDER=7,TILE_SIZE=96,INC_TILE_SIZE=96,SMALL_QR_SIZE=25,getPixel=(a,b,c,d,e)=>{if(a<QR_BORDER&&b<QR_BORDER)return!1;if(a>=c-QR_BORDER&&b<QR_BORDER)return!1;if(a<QR_BORDER&&b>=c-QR_BORDER)return!1;if(e){let e=QR_BORDER+2;c<=SMALL_QR_SIZE&&e--;let f=(c-2*QR_BORDER-e)/2-1;return c<=SMALL_QR_SIZE&&f++,!(a>QR_BORDER+f&&a<c-QR_BORDER-f-1&&b>QR_BORDER+f&&b<c-QR_BORDER-f-1)&&0<=a&&a<c&&0<=b&&b<c&&d[b][a]}return d[b]&&d[b][a]},getNeighbors=(a,b,c,d,e=!0)=>({l:getPixel(a-1,b,c,d,e),r:getPixel(a+1,b,c,d,e),t:getPixel(a,b-1,c,d,e),b:getPixel(a,b+1,c,d,e),current:getPixel(a,b,c,d,e)}),convertSegmentsToSvgString=(a,b)=>{if("number"!=typeof b.qrSize)throw new Error("Size should be a number");if("string"!=typeof b.className)throw new Error("Classname should be a string");const c=12.8*MULTI,d=14.7*MULTI,e=14.8*MULTI,f=28.6*MULTI,g=30.5*MULTI,h=84.7776815*MULTI,i=42.9*MULTI,j=85.2*MULTI,k=85.3*MULTI,l=69.5*MULTI,m=98,n=100,o=[];let p=0,q=0,r=0,s=0;for(let c=0;c<a.size;c++){p=0;for(let d=0;d<a.size;d++){r=d+p,p+=TILE_SIZE,s=c+q;const e=getNeighbors(d,c,a.size,a.modules,b.isShowLogo);let f="",g="";(e.current?(g=g||e.l||e.r||e.t||e.b?"":"empty",g=!g&&e.l&&e.r||e.t&&e.b?"rect":"",!g&&(g+=e.l?"l":e.r?"r":"",g+=e.t?"t":e.b?"b":"",!g&&(g="empty"))):(g=!g&&e.l&&e.t&&getPixel(d-1,c-1,a.size,a.modules,b.isShowLogo)?"n_lt":"",g=!g&&e.l&&e.b&&getPixel(d-1,c+1,a.size,a.modules,b.isShowLogo)?"n_lb":"",g=!g&&e.r&&e.t&&getPixel(d+1,c-1,a.size,a.modules,b.isShowLogo)?"n_rt":"",g=!g&&e.r&&e.b&&getPixel(d+1,c+1,a.size,a.modules,b.isShowLogo)?"n_rb":""),!!g)&&(f=`<use xlink:href="#${g}-${b.suffix}"/>`,o.push(`<g transform="translate(${r},${s})">${f}</g>`))}q+=TILE_SIZE}let t="",u=(a.size-3*QR_BORDER)/2*TILE_SIZE+TILE_SIZE*QR_BORDER-10;a.size<=SMALL_QR_SIZE&&(t="scale(0.85)",u+=50);const v=(a.size-QR_BORDER)*INC_TILE_SIZE;o.push(`<use fill-rule="evenodd" transform="translate(0,0)" xlink:href="#point-${b.suffix}"/>`),o.push(`<use fill-rule="evenodd" transform="translate(${v},0)" xlink:href="#point-${b.suffix}"/>`),o.push(`<use fill-rule="evenodd" transform="translate(0,${v})" xlink:href="#point-${b.suffix}"/>`),b.isShowLogo&&(b.logoData?o.push(`
        <image 
          style="width: 750px; height: 750px;" width="750" height="750" 
          transform="translate(${u},${u}) ${t}" 
          xlink:href="${b.logoData}" 
        />
      `):o.push(`
        <use style="width: 750px; height: 750px;" width="750" height="750" 
          fill="none" 
          fill-rule="evenodd" 
          transform="translate(${u},${u}) ${t}" xlink:href="#vk_logo-${b.suffix}"
        />
      `));const w=99*a.size;let x="",y="translate(0,0)";if(b.isShowBackground){const a=(b.qrSize-40)/b.qrSize,c=21*(w/b.qrSize),d=Math.ceil(w/(b.qrSize/36));x=`
      <rect 
        x="0" 
        width="${w}" 
        height="${w}" 
        rx="${d}" 
        fill="${b.backgroundColor}"
      />`,y=`translate(${c}, ${c}) scale(${a})`}const z=`M0,0 L66,0 C${h},-3.44940413e-15 ${n},15.2223185 ${n},34 L${n},66 C${n},${h} \
${h},${n} 66,${n} L0,${n} L0,0 Z`,A=`M0,0 L${n},0 L${n},66 C${n},${h} ${h},${n} 66,${n} L0,${n} L0,0 Z`;return`
  <svg 
    version="1.1" 
    viewBox="0 0 ${w} ${w}" 
    width="${b.qrSize}px" 
    height="${b.qrSize}px"
    ${b.className?`class="${b.className}"`:""} 
    xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <rect id="rect-${b.suffix}" width="100" height="100" fill="${b.foregroundColor}"/>
      <path 
        id="empty-${b.suffix}" 
        d="M0,${f}v${i}C0,${87.3*MULTI},${c},${n},${f},${n}h${i}c${15.9*MULTI},0,${f}-${c},\
${f}-${f}V${f}C${n},${12.7*MULTI},${87.2*MULTI},0,${71.4*MULTI},0H${f} C${c},0,0,${c},0,${f}z"
        fill="${b.foregroundColor}"
      />
      <path id="b-${b.suffix}" d="${z}" transform="rotate(-90 50 50)" fill="${b.foregroundColor}"/>
      <path id="r-${b.suffix}" d="${z}" transform="rotate(-180 50 50)" fill="${b.foregroundColor}"/>
      <path id="l-${b.suffix}" d="${z}" fill="${b.foregroundColor}"/>
      <path id="t-${b.suffix}" d="${z}" transform="rotate(90 50 50)" fill="${b.foregroundColor}"/>
      <path id="l-${b.suffix}" d="${A}" transform="rotate(-90 50 50)" fill="${b.foregroundColor}"/>
      <path id="lt-${b.suffix}" d="${A}" fill="${b.foregroundColor}"/>
      <path id="lb-${b.suffix}" d="${A}" transform="rotate(-90 50 50)" fill="${b.foregroundColor}"/>
      <path id="rb-${b.suffix}" d="${A}" transform="rotate(-180 50 50)" fill="${b.foregroundColor}"/>
      <path id="rt-${b.suffix}" d="${A}" transform="rotate(90 50 50)" fill="${b.foregroundColor}"/>
      <path 
        id="n_lt-${b.suffix}" 
        d="M${g},${2}V0H0v${g}h${2}C${2},${d},${e},${2},${g},${2}z" 
        fill="${b.foregroundColor}"
      />
      <path 
        id="n_lb-${b.suffix}"
        d="M${2},${l}H0V${n}h${g}v-${2}C${d},${m},${2},${j},${2},${l}z" 
        fill="${b.foregroundColor}"
      />
      <path 
        id="n_rt-${b.suffix}" 
        d="M${m},${g}h${2}V0H${l}v${2}C${k},${2},${m},${e},${m},${g}z" 
        fill="${b.foregroundColor}"
      />
      <path id="n_rb-${b.suffix}" 
        d="M${l},${m}v${2}H${n}V${l}h-${2}C${m},${k},${j},${m},${l},${m}z" 
        fill="${b.foregroundColor}"
      />
      <path 
        id="point-${b.suffix}" 
        fill="${b.foregroundColor}"
        d="M600.001786,457.329333 L600.001786,242.658167 C600.001786,147.372368 587.039517,124.122784 \
581.464617,118.535383 C575.877216,112.960483 552.627632,99.9982143 457.329333,99.9982143 \
L242.670667,99.9982143 C147.372368,99.9982143 124.122784,112.960483 118.547883,118.535383 \
C112.972983,124.122784 99.9982143,147.372368 99.9982143,242.658167 L99.9982143,457.329333 \
C99.9982143,552.627632 112.972983,575.877216 118.547883,581.464617 C124.122784,587.027017 \
147.372368,600.001786 242.670667,600.001786 L457.329333,600.001786 C552.627632,600.001786 \
575.877216,587.027017 581.464617,581.464617 C587.039517,575.877216 600.001786,552.627632 \
600.001786,457.329333 Z M457.329333,0 C653.338333,0 700,46.6616668 700,242.658167 C700,438.667167 \
700,261.332833 700,457.329333 C700,653.338333 653.338333,700 457.329333,700 C261.332833,700 438.667167,700 \
242.670667,700 C46.6616668,700 0,653.338333 0,457.329333 C0,261.332833 0,352.118712 0,242.658167 \
C0,46.6616668 46.6616668,0 242.670667,0 C438.667167,0 261.332833,0 457.329333,0 Z M395.996667,200 \
C480.004166,200 500,220.008332 500,303.990835 C500,387.998334 500,312.001666 500,395.996667 \
C500,479.991668 480.004166,500 395.996667,500 C312.001666,500 387.998334,500 304.003333,500 C220.008332,500 \
200,479.991668 200,395.996667 C200,312.001666 200,350.906061 200,303.990835 C200,220.008332 220.008332,200 \
304.003333,200 C387.998334,200 312.001666,200 395.996667,200 Z" 
      />
      <g id="vk_logo-${b.suffix}">
        <path 
          fill="${b.logoColor}" 
          d="M253.066667,0 C457.466667,0 272.533333,0 476.933333,0 C681.333333,0 730,48.6666667 730,253.066667 \
C730,457.466667 730,272.533333 730,476.933333 C730,681.333333 681.333333,730 476.933333,730 C272.533333,730 \
457.466667,730 253.066667,730 C48.6666667,730 0,681.333333 0,476.933333 C0,272.533333 0,367.206459 \
0,253.066667 C0,48.6666667 48.6666667,0 253.066667,0 Z"/><path fill="#FFF" d="M597.816744,251.493445 \
C601.198942,240.214758 597.816746,231.927083 581.719678,231.927083 L528.490512,231.927083 \
C514.956087,231.927083 508.716524,239.08642 505.332448,246.981031 C505.332448,246.981031 \
478.263599,312.960647 439.917002,355.818719 C427.510915,368.224806 421.871102,372.172112 \
415.10389,372.172112 C411.720753,372.172112 406.822917,368.224806 406.822917,356.947057 \
L406.822917,251.493445 C406.822917,237.95902 402.895137,231.927083 391.615512,231.927083 \
L307.969678,231.927083 C299.511836,231.927083 294.425223,238.208719 294.425223,244.162063 \
C294.425223,256.99245 313.597583,259.951287 315.573845,296.043086 L315.573845,374.428788 \
C315.573845,391.614583 312.470184,394.730425 305.702972,394.730425 C287.658011,394.730425 \
243.763595,328.456052 217.730151,252.620844 C212.628223,237.881107 207.511068,231.927083 \
193.907178,231.927083 L140.678012,231.927083 C125.469678,231.927083 122.427826,239.08642 \
122.427826,246.981031 C122.427826,261.079625 140.473725,331.006546 206.452402,423.489903 \
C250.437874,486.648674 312.410515,520.885417 368.803012,520.885417 C402.638134,520.885417 \
406.823845,513.28125 406.823845,500.183098 L406.823845,452.447917 C406.823845,437.239583 \
410.029185,434.204421 420.743703,434.204421 C428.638315,434.204421 442.172739,438.151727 \
473.753063,468.603713 C509.843923,504.694573 515.79398,520.885417 536.094678,520.885417 \
L589.323845,520.885417 C604.532178,520.885417 612.136345,513.28125 607.749619,498.274853 \
C602.949226,483.318593 585.717788,461.619053 562.853283,435.89599 C550.446258,421.234166 \
531.837128,405.444943 526.197316,397.548454 C518.302704,387.399043 520.558441,382.88663 \
526.197316,373.864619 C526.197316,373.864619 591.049532,282.508661 597.816744,251.493445 Z"
        />
      </g>
    </defs>

    ${x}

    <g transform="${y}">
      ${o.join("\n")}
    </g>
  </svg>`},DEFAULT_SIZE=128,BACKGROUND_COLOR_DEFAULT="#ffffff",FOREGROUND_COLOR_DEFAULT="#000000",LOGO_COLOR_DEFAULT="#4680c2";function createQR(a,b,c,d){if("string"!=typeof a)throw new TypeError("Enter text for encoding");const e=Object.assign({},"object"==typeof b&&null!==b?b:{},"object"==typeof d&&null!==d?d:{},{qrSize:"object"==typeof b&&null!==b&&"number"==typeof b.qrSize?b.qrSize:b,className:"object"==typeof b&&null!==b&&"string"==typeof b.className?b.className:c}),f={qrSize:"number"==typeof e.qrSize?e.qrSize:DEFAULT_SIZE,className:"string"==typeof e.className?e.className:c||"",isShowLogo:!!e.isShowLogo||!1,isShowBackground:!!e.isShowBackground||!1,foregroundColor:"string"==typeof e.foregroundColor?e.foregroundColor:FOREGROUND_COLOR_DEFAULT,backgroundColor:"string"==typeof e.backgroundColor?e.backgroundColor:BACKGROUND_COLOR_DEFAULT,logoColor:"string"==typeof e.logoColor?e.logoColor:LOGO_COLOR_DEFAULT,suffix:e.suffix?e.suffix.toString():"0",logoData:"string"==typeof e.logoData?e.logoData:null},g=QrSegment.makeSegments(a),h=QrCode.encodeSegments(g,QrCode.Ecc.QUARTILE,1,40,-1,!0),i=convertSegmentsToSvgString(h,f);return i}


  	// start app
    init()
})( window );
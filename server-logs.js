const fs = require('fs')
const util = require('util')
const path = require('path')

const esc = '\u001b'
const csi = esc + '['
const sgr = (...N) => csi + N.map(n => n === undefined ? '' : n).join(';') + 'm'

const colors = [
	'black',
	'red',
	'green',
	'yellow',
	'blue',
	'magenta',
	'cyan',
	'white'
]

function rgb(n) {
	return (r, g, b) => n + ';2;' + (r >>> 0) + ';' + (g >>> 0) + ';' + (b >>> 0)
}

function highColor(n) {
	return (m) => n + ';5;' + (m >>> 0)
}

const fg = {rgb: rgb(38), highColor: highColor(38)}
const bg = {rgb: rgb(48), highColor: highColor(48)}

colors.forEach((color, i) => {
	const brightColor = 'bright' + color[0].toUpperCase() + color.slice(1)
	fg[color] = 30 + i
	bg[color] = 40 + i
	fg[brightColor] = 90 + i
	bg[brightColor] = 100 + i
})



function hslToRgb(h, s, l) {
	var r, g, b;
	if (s == 0) {
		r = l
		g = l
		b = l
	} else {
		function hue2rgb(p, q, t) {
			if (t < 0) {
				t += 1
			}
			if (t > 1) {
				t -= 1
			}
			if (t < 1/6) {
				return p + (q - p) * 6 * t
			}
			if (t < 1/2) {
				return q
			}
			if (t < 2/3) {
				return p + (q - p) * (2/3 - t) * 6
			}
			return p
		}
		
		var q
		if (l < 0.5) {
			q = l * (1 + s)
		} else {
			q = l + s - l * s
		}
		var p = 2 * l - q
		r = hue2rgb(p, q, h + 1/3)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h - 1/3)
	}
	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const phi = 1.618033988749895

function goldenHue(n) {
	return (n * phi) % 1
}



function pad(num, n) {
	return String(num).padStart(n, '0')
}

function format(msg) {
	return util.inspect(msg, {colors: true})
}

function formatDate(date) {
	return (
		pad(date.getFullYear(), 4) + 
		'-' +
		pad(date.getMonth()+1, 2) + 
		'-' +
		pad(date.getDate(), 2)
	)
}

function formatTime(date) {
	return (
		'\[' +
		pad(date.getHours(), 2) + 
		':' +
		pad(date.getMinutes(), 2) + 
		':' +
		pad(date.getSeconds(), 2) + 
		'.' +
		pad(date.getMilliseconds(), 3) +
		'\]'
	)
}

function formatDateAndTime(date) {
	return formatDate(date) + ' ' + formatTime(date)
}



const logDate = new Date()
const logName = formatDateAndTime(logDate).replace(/:/g, ';') + '.log';
const logPath = path.resolve(__dirname, 'server-logs', logName);
const logFile = fs.createWriteStream(logPath, {flags : 'w'});



function Log(processId) {
	return function log(msg, fileOnly) {
		if (typeof msg !== 'string') {
			msg = format(msg)
		}
		
		const processRgb = hslToRgb(goldenHue(Number(processId)), 0.85, 0.59)
		
		const processPrefix = sgr(bg.rgb(...processRgb), fg.rgb(0,0,0)) + '[' + processId + ']' + sgr(0) + ' '
		const processIndent = ' '.repeat(('[' + processId + '] ').length)
		
		msg = processPrefix + msg.replace(/\n^/gm, '\n' + processIndent)
		
		const date = new Date()
		
		if (!fileOnly) {
			const terminalPrefix = formatTime(date) + ' '
			const terminalIndent = ' '.repeat(terminalPrefix.length)
			const terminalMsg = terminalPrefix + msg.replace(/\n^/gm, '\n' + terminalIndent)

			console.log(terminalMsg)
		}
		
		const filePrefix = formatDateAndTime(date) + ' '
		const fileIndent = ' '.repeat(filePrefix.length)
		const fileMsg = filePrefix + msg.replace(/\r?\n^/gm, '\r\n' + fileIndent).replace(/(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/g, '')
		
		logFile.write(fileMsg + '\r\n')
	}
}



const Logs = {
	sgr,
	fg, bg,
	Log
}

module.exports = Logs
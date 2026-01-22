
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Detectar modo dry-run desde argumentos o variable de entorno
const isDryRun = process.argv.includes('--dry-run') || 
                 process.argv.includes('--dry') || 
                 process.env.DRY_RUN === 'true' ||
                 process.env.NODE_ENV === 'development';

// Configuración de estilos avanzados con más diseño
const estilos = {
    titulo: chalk.bold.yellowBright,
    subtitulo: chalk.bold.cyan,
    advertencia: chalk.bold.bgRed,
    advertenciaLight: chalk.yellow,
    exito: chalk.bold.green,
    exitoLight: chalk.cyan,
    info: chalk.blue,
    infoLight: chalk.cyan,
    fondoDestacado: chalk.bgMagenta.black,
    fondoExito: chalk.bgGreen.black,
    fondoAdvertencia: chalk.bgYellow.black,
    seccion: chalk.bold.magentaBright,
    decoracion: chalk.gray,
    link: chalk.underline.cyan,
    emoji: chalk.bold,
    tabulador: '   '
};

// Función para crear líneas decorativas
const linea = (char = '═', width = 50) => estilos.decoracion(char.repeat(width));

// Mostrar indicador de modo dry-run si está activo
if (isDryRun) {
    console.log(estilos.fondoAdvertencia('  ⚡ DRY-RUN MODE: No files will be deleted / MODO SIMULACIÓN: No se eliminarán archivos  '));
    console.log();
}

// Mensaje de bienvenida ultra mejorado con diseño
console.clear();
console.log(estilos.decoracion('╔' + '═'.repeat(60) + '╗'));
console.log(estilos.fondoDestacado('                  🚀 WELCOME TO FLYXNODES 🚀                   '));
console.log(estilos.decoracion('║' + ' '.repeat(60) + '║'));
console.log(estilos.decoracion('║') + estilos.titulo('   ¡Bienvenido a FlyxNodes - Your Cloud Development Hub!   ') + estilos.decoracion('║'));
console.log(estilos.decoracion('╚' + '═'.repeat(60) + '╝'));

console.log('\n' + estilos.seccion('📋 GETTING STARTED / PARA EMPEZAR:\n'));

console.log(estilos.tabulador + estilos.emoji('▶') + '  ' + estilos.infoLight('File Management / Gestión de Archivos'));
console.log(estilos.tabulador.repeat(2) + estilos.info('• Use SFTP to upload your files'));
console.log(estilos.tabulador.repeat(2) + estilos.info('• Usa SFTP para subir tus archivos\n'));

console.log(estilos.tabulador + estilos.emoji('▶') + '  ' + estilos.infoLight('Repository Integration / Integración de Repositorio'));
console.log(estilos.tabulador.repeat(2) + estilos.info('• Link GitHub/GitLab for automatic updates'));
console.log(estilos.tabulador.repeat(2) + estilos.info('• Vincula GitHub/GitLab para actualizaciones automáticas\n'));

console.log(estilos.tabulador + estilos.emoji('▶') + '  ' + estilos.infoLight('Need Help? / ¿Necesitas Ayuda?'));
console.log(estilos.tabulador.repeat(2) + estilos.info('• Open a ticket on: ' + estilos.link('discord.gg/flyxnodes')));
console.log(estilos.tabulador.repeat(2) + estilos.info('• Abre un ticket en: ' + estilos.link('discord.gg/flyxnodes')));

// ⚠️ Aviso importante sobre eliminación de archivos con diseño mejorado
console.log('\n' + estilos.decoracion('┌' + '─'.repeat(58) + '┐'));
console.log(estilos.decoracion('│') + estilos.advertenciaLight('  ⚠️  WARNING / ADVERTENCIA  ⚠️  ').padEnd(59) + estilos.decoracion('│'));
console.log(estilos.decoracion('├' + '─'.repeat(58) + '┤'));
console.log(estilos.decoracion('│') + '  On shutdown, the following files will be deleted: '.padEnd(59) + estilos.decoracion('│'));
console.log(estilos.decoracion('│') + '  Al apagar, se eliminarán los siguientes archivos: '.padEnd(59) + estilos.decoracion('│'));
console.log(estilos.decoracion('│' + ' '.repeat(58) + '│'));
console.log(estilos.decoracion('│') + estilos.advertenciaLight('  ✗ index.js').padEnd(59) + estilos.decoracion('│'));
console.log(estilos.decoracion('│') + estilos.advertenciaLight('  ✗ package.json & package-lock.json').padEnd(59) + estilos.decoracion('│'));
console.log(estilos.decoracion('│') + estilos.advertenciaLight('  ✗ node_modules/ & .npm/').padEnd(59) + estilos.decoracion('│'));
console.log(estilos.decoracion('└' + '─'.repeat(58) + '┘\n'));

// Bucle mejorado con mensaje animado
let contador = 0;
const simbolos = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const intervalo = setInterval(() => {
    contador++;
    const spinner = simbolos[contador % simbolos.length];
    const tiempo = new Date().toLocaleTimeString();
    process.stdout.write(`\r${estilos.emoji(spinner)} [${estilos.infoLight(tiempo)}] ${estilos.info('🛠️  Service running / Servicio en ejecución...'.padEnd(40))}`);
}, 100);

// Manejo mejorado de SIGINT con interfaz visual mejorada
process.on('SIGINT', () => {
    clearInterval(intervalo);
    console.log('\n\n' + estilos.decoracion('╔' + '═'.repeat(60) + '╗'));
    console.log(estilos.decoracion('║') + estilos.fondoAdvertencia('         🛑 SHUTDOWN INITIATED / APAGUE INICIADO         ') + estilos.decoracion('║'));
    console.log(estilos.decoracion('╚' + '═'.repeat(60) + '╝\n'));

    const filesToDelete = [
        path.resolve(__filename),  // index.js
        path.resolve(path.join(path.dirname(__filename), 'package.json')),
        path.resolve(path.join(path.dirname(__filename), 'package-lock.json')),
        path.resolve(path.join(path.dirname(__filename), 'node_modules')),
        path.resolve(path.join(path.dirname(__filename), '.npm'))
    ];
    
    let deletedFiles = [];
    let errors = [];

    // Verificación adicional de seguridad
    const cwd = process.cwd();
    for (const file of filesToDelete) {
        if (!file.includes(cwd)) {
            console.log(estilos.decoracion('┌─ ') + estilos.advertencia('❌ SECURITY CHECK FAILED / VERIFICACIÓN DE SEGURIDAD FALLIDA'));
            console.log(estilos.decoracion('└─ ') + estilos.info('Unsafe path detected / Ruta insegura detectada\n'));
            process.exit(1);
        }
    }

    console.log(estilos.seccion('📦 DELETING DEFAULT FILES / ELIMINANDO ARCHIVOS POR DEFECTO:\n'));

    // Mostrar modo dry-run si está activo
    if (isDryRun) {
        console.log(estilos.fondoAdvertencia('  🔍 DRY-RUN: Simulating deletion (no files will be removed) / Simulando eliminación (no se eliminarán archivos)  \n'));
    }

    // Función para eliminar recursivamente directorios
    const deleteRecursive = (filePath) => {
        return new Promise((resolve) => {
            const stats = fs.statSync(filePath, { throwIfNoEntry: false });
            
            if (!stats) {
                resolve(true);
                return;
            }

            // En modo dry-run, solo simular
            if (isDryRun) {
                deletedFiles.push(path.basename(filePath));
                console.log(estilos.tabulador + estilos.exitoLight('✓ [DRY-RUN] ' + path.basename(filePath)));
                resolve(true);
                return;
            }
            
            if (stats.isDirectory()) {
                fs.rm(filePath, { recursive: true, force: true }, (err) => {
                    if (err) {
                        errors.push({ name: path.basename(filePath), error: err.message });
                        console.log(estilos.tabulador + estilos.advertenciaLight('✗ ' + path.basename(filePath)) + estilos.info(` (${err.message})`));
                    } else {
                        deletedFiles.push(path.basename(filePath));
                        console.log(estilos.tabulador + estilos.exito('✓ ' + path.basename(filePath)));
                    }
                    resolve(!err);
                });
            } else {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        errors.push({ name: path.basename(filePath), error: err.message });
                        console.log(estilos.tabulador + estilos.advertenciaLight('✗ ' + path.basename(filePath)) + estilos.info(` (${err.message})`));
                    } else {
                        deletedFiles.push(path.basename(filePath));
                        console.log(estilos.tabulador + estilos.exito('✓ ' + path.basename(filePath)));
                    }
                    resolve(!err);
                });
            }
        });
    };

    // Eliminar todos los archivos
    Promise.all(filesToDelete.map(deleteRecursive)).then(() => {
        console.log('\n' + estilos.decoracion('╔' + '═'.repeat(60) + '╗'));
        
        if (isDryRun) {
            console.log(estilos.decoracion('║') + estilos.fondoAdvertencia('      🔍 DRY-RUN SIMULATION COMPLETED / SIMULACIÓN COMPLETADA      ') + estilos.decoracion('║'));
        } else if (errors.length === 0) {
            console.log(estilos.decoracion('║') + estilos.fondoExito('           ✨ SELF-DESTRUCTION COMPLETE ✨           ') + estilos.decoracion('║'));
        } else {
            console.log(estilos.decoracion('║') + estilos.fondoAdvertencia('         ⚠️  DELETION COMPLETED WITH ERRORS  ⚠️        ') + estilos.decoracion('║'));
        }
        
        console.log(estilos.decoracion('╚' + '═'.repeat(60) + '╝\n'));
        
        if (deletedFiles.length > 0) {
            const label = isDryRun 
                ? '🔍 SIMULATED FILES / ARCHIVOS SIMULADOS:\n' 
                : '✅ SUCCESSFULLY DELETED / ELIMINADOS CORRECTAMENTE:\n';
            console.log(estilos.seccion(label));
            deletedFiles.forEach(file => console.log(estilos.tabulador + (isDryRun ? estilos.exitoLight : estilos.exito)('  • ' + file)));
        }
        
        if (errors.length > 0) {
            console.log('\n' + estilos.seccion('⚠️  ERRORS DURING DELETION / ERRORES DURANTE LA ELIMINACIÓN:\n'));
            errors.forEach(e => console.log(estilos.tabulador + estilos.advertenciaLight('  • ' + e.name + ': ') + estilos.info(e.error)));
        }
        
        console.log('\n' + estilos.decoracion('─'.repeat(62)) + '\n');
        process.exit(0);
    });
});

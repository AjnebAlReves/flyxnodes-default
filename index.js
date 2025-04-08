const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// Configuración de estilos
const estilos = {
    titulo: chalk.bold.yellowBright,
    subtitulo: chalk.green,
    advertencia: chalk.bold.red,
    exito: chalk.bold.cyan,
    info: chalk.blue,
    fondoDestacado: chalk.bgMagenta.black
};

// Mensaje de bienvenida mejorado
console.log(estilos.titulo(`
===========================
🚀 Bienvenido a FlyxNodes 🚀
===========================
`));
console.log(estilos.subtitulo("Para empezar:"));
console.log(estilos.info("- Usa SFTP o el explorador de archivos en el panel."));
console.log(estilos.info("- Vincula tu repositorio GitHub/GitLab para auto-actualización."));
console.log(estilos.exito("¿Problemas? Abre un ticket en nuestro Discord.\n"));

// Bucle más eficiente con setInterval
const intervalo = setInterval(() => {
    console.log(estilos.info("🛠️ Servicio en ejecución..."));
}, 100000);

// Manejo mejorado de SIGINT
process.on('SIGINT', () => {
    console.log("\n" + estilos.advertencia("🛑 Eliminando el script..."));
    clearInterval(intervalo);

    const scriptPath = path.resolve(__filename);
    
    // Verificación adicional de seguridad
    if (!scriptPath.includes(process.cwd())) {
        console.log(estilos.advertencia("❌ Operación cancelada: Ruta no segura"));
        process.exit(1);
    }

    fs.unlink(scriptPath, (err) => {
        if (err) {
            const mensajeError = err.code === 'EPERM' 
                ? "Error en Windows: Cierra el IDE o terminal antes de eliminar manualmente."
                : `Error: ${err.message}`;
                
            console.error(estilos.advertencia(mensajeError));
            process.exit(1);
        }
        
        console.log(estilos.exito(`💥 Script eliminado: ${path.basename(scriptPath)}`));
        console.log(estilos.fondoDestacado(" ¡Autodestrucción completada! "));
        process.exit(0);
    });
});

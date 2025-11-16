module.exports = async (params) => {
    const app = params.app;
    const tp = params.tp;

    /*********************************************
     CONFIGURACIÓN — ADAPTADA A TU VAULT
    *********************************************/

    // Carpeta destino donde se crearán los personajes
    const carpetaDestino = "z_Recursos/Fichas PC";

    // Carpeta donde guardas las plantillas Excalidraw de cada arquetipo
    const carpetaPlantillas = "z_Plantillas/Arquetipos";

    /*********************************************
     PREGUNTAR NOMBRE DEL PERSONAJE
    *********************************************/

    const pj = await tp.system.prompt("Nombre del personaje");
    if (!pj) {
        new Notice("Creación cancelada — sin nombre.");
        return;
    }

    /*********************************************
     DETECTAR ARQUETIPOS (carpetas dentro de templates/Arquetipos)
    *********************************************/

    const listaFolders = (await app.vault.adapter.list(carpetaPlantillas)).folders;
    const listaArquetipos = listaFolders.map(f => f.split("/").pop());

    const arquetipo = await tp.system.suggester(listaArquetipos, listaArquetipos);
    if (!arquetipo) {
        new Notice("Creación cancelada — sin arquetipo.");
        return;
    }

    const rutaArquetipo = `${carpetaPlantillas}/${arquetipo}`;

    /*********************************************
     CREAR CARPETA PARA EL PERSONAJE
    *********************************************/

    const carpetaPJ = `${carpetaDestino}/${pj}`;
    await app.vault.adapter.mkdir(carpetaPJ);

    /*********************************************
     COPIAR TODAS LAS PLANTILLAS EXCALIDRAW
    *********************************************/

    const archivos = (await app.vault.adapter.list(rutaArquetipo)).files;

    for (const archivo of archivos) {
        if (!archivo.endsWith(".excalidraw")) continue;

        const nombreBase = archivo.split("/").pop().replace(".excalidraw", "");
        const destino = `${carpetaPJ}/${pj}_${nombreBase}.excalidraw`;

        const contenido = await app.vault.adapter.read(archivo);
        await app.vault.adapter.write(destino, contenido);
    }

    new Notice(`✅ Personaje creado para ${pj} — Arquetipo: ${arquetipo}`);
};

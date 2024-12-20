import Ftp from "../controller/ftpController.js";

const ftpRoute = async (fastify, options) => {

    const ftpController = new Ftp()  // Crie uma instância do controlador

    // Rota para listar arquivos no FTP
    fastify.get('/ftp/files', async (request, reply) => {
        try {
            const files = await ftpController.listFtpFiles()
            return { files }
        } catch (error) {
            reply.status(500).send({ error: error.message })
        }
    })

    // Rota para enviar um arquivo para o servidor FTP
    fastify.get('/ftp/upload', async (request, reply) => {
        try {
            const result = await ftpController.uploadFileToFtp()
            return result
        } catch (error) {
            reply.status(500).send({ error: error.message })
        }
    })

    fastify.post('/ftp/verify-directory', async (request, reply) =>{

        const {folders, releaseNote } = request.body

        try{
            const result = await ftpController.createDirectoryAndSubdirectories(folders, releaseNote)
            return result
        }catch (error) {
            reply.status(500).send({ error: error.message })
        }
    })

    // Rota para criar um diretório no FTP
    fastify.post('/ftp/create-directory', async (request, reply) => {
        const { directoryName } = request.body
        
        try {
            const result = await ftpController.createDirectoryOnFtp(directoryName)
            return result
        } catch (error) {
            reply.status(500).send({ error: error.message })
        }
    })

    //Rota que pega o nome da pasta e cria o arquivo.
    fastify.post('/ftp/create-directory-file', async (request, reply) => {
        const {fileContent, directoryName, fileName} = request.body
    
        try {
            const result = await ftpController.createDirectoryAndUploadFile(directoryName, fileName, fileContent)
            return result
        } catch (error) {
            reply.status(500).send({ error: error.message })
        }
    })
    
}

export default ftpRoute
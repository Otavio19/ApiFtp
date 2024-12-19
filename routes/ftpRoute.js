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

    // Rota para criar um diretório no FTP
    fastify.get('/ftp/create-directory/:directoryName', async (request, reply) => {
        const { directoryName } = request.params
        try {
            const result = await ftpController.createDirectoryOnFtp(directoryName)
            return result
        } catch (error) {
            reply.status(500).send({ error: error.message })
        }
    })

    fastify.post('/ftp/create-directory-file/:directoryName/:fileName', async (request, reply) => {
        const { directoryName, fileName } = request.params
        const {fileContent} = request.body;
    
        try {
            const result = await ftpController.createDirectoryAndUploadFile(directoryName, fileName, fileContent)
            return result
        } catch (error) {
            reply.status(500).send({ error: error.message })
        }
    })
    
}

export default ftpRoute
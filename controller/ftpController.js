import { Client } from 'basic-ftp'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

const ftpConfig = {
    server: "ftp.dlptest.com",
    username: "dlpuser",
    password: "rNrKYTX9g7z3RgJRmxWuGHbeu"
}

class Ftp {

    async getCurrentDateFormatted() {
        const today = new Date()

        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')

        return `${year}${month}${day}`
    }

    async conectServer() {
        const client = new Client()

        try {
            await client.access({
                host: ftpConfig.server,
                user: ftpConfig.username,
                password: ftpConfig.password
            })
            return client
        } catch (error) {
            throw new Error('Erro ao se conectar ao servidor FTP: ' + error.message)
        }
    }

    // Função para listar arquivos no FTP
    async listFtpFiles() {
        let client
        try {
            client = await this.conectServer()
            const files = await client.list()
            return files
        } catch (error) {
            throw new Error('Erro ao listar arquivos no servidor FTP: ' + error.message)
        } finally {
            client.close()
        }
    }

    async uploadFileToFtp(directoryName, fileName, fileContent) {
        let client;
        try {
            client = await this.conectServer();

            await client.ensureDir(directoryName)

            const buffer = Buffer.from(fileContent)
            const stream = Readable.from(buffer)

            await client.uploadFrom(stream, fileName)

            return { message: `Arquivo "${fileName}" enviado com sucesso para o diretório "${directoryName}" no servidor FTP!` };
        } catch (error) {
            throw new Error('Erro ao enviar o arquivo para o servidor FTP: ' + error.message);
        } finally {
            if (client) {
                client.close();
            }
        }
    }

    //Função responsável por pegar o caminho e inserir o arquivo dentro.
    async uploadFileToDirectory(path, fileName, fileContent) {
        let client
        try {
            client = await this.conectServer()
            await client.cd(path)
            let caminho = await client.pwd()

            const buffer = Buffer.from(fileContent)
            const stream = Readable.from(buffer)

            await client.uploadFrom(stream, fileName)
            console.log('CAMINHO ACESSADO: ' + caminho)
            console.log('NOME ACESSADO: ' + fileName)
            console.log('FILECONTENT ACESSADO: ' + fileContent)
        } catch (e) {
            throw new Error('Erro ao acessar o diretório no servidor FTP: ' + e.message)
        } finally {
            if (client) {
                client.close()
            }
        }
    }

    // Função para criar uma pasta no servidor FTP
    async createDirectoryOnFtp(directoryName) {

        let client

        try {
            client = await this.conectServer()

            await client.ensureDir(directoryName) // ensureDir cria o diretório no servidor.

            return { message: `Diretório "${directoryName}" criado com sucesso no servidor FTP!` }
        } catch (error) {
            throw new Error('Erro ao criar o diretório no servidor FTP: ' + error.message)
        } finally {
            if (client) {
                client.close()
            }
        }
    }

    async createDirectoryAndSubdirectories(folders, releaseNote) {

        const directoryName = await this.getCurrentDateFormatted()
        let client;

        try {
            client = await this.conectServer()
            let caminho = await client.pwd()

            // Cria o diretório principal com o nome da data
            await client.ensureDir(directoryName) //EnsureDir cria o diretorio.
            await client.cd('/' + directoryName)

            for(let i = 0; i < folders.length ; i++){
                await client.ensureDir(folders[i].directoryName)
                caminho = await client.pwd()

                for(let c = 0; c < folders[i].folderContent.length; c++){
                    this.uploadFileToDirectory(caminho, folders[i].folderContent[c].fileName, folders[i].folderContent[c].fileContent)
                }
                await client.cd('..')

            }

            caminho = await client.pwd()
            this.uploadFileToDirectory(caminho, releaseNote.fileName,  releaseNote.fileContent)

            return { message: 'Pastas Criadas.' }

        } catch (error) {
            throw new Error('Erro ao verificar ou criar os diretórios no servidor FTP: ' + error.message)
        } finally {
            if (client) {
                client.close()
            }
        }
    }

    // Função para criar diretório e enviar arquivo TXT dentro dele
    async createDirectoryAndUploadFile(directoryName, fileName, fileContent) {
        //const createDirResult = await this.createDirectoryOnFtp(directoryName)

        const uploadResult = await this.uploadFileToFtp(directoryName, fileName, fileContent)

        return {
            message: `Diretório ${directoryName} e arquivo ${fileName} criados com sucesso!`,
            directoryResult: createDirResult,
            fileResult: uploadResult
        }
    }
}

export default Ftp
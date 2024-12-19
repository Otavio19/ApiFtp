import { Client } from 'basic-ftp'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'  // Importando o módulo stream

const ftpConfig = {
    server: "ftp.dlptest.com",
    username: "dlpuser",
    password: "rNrKYTX9g7z3RgJRmxWuGHbeu"
}

class Ftp {

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

            // Navega até o diretório e cria o diretório, se necessário
            await client.ensureDir(directoryName);  // Garantindo que o diretório exista
            
            // Envolve o conteúdo em um stream
            const buffer = Buffer.from(fileContent);
            const stream = Readable.from(buffer);  // Cria um stream a partir do buffer

            // Envia o conteúdo diretamente para o servidor FTP
            await client.uploadFrom(stream, fileName);  // Envia o arquivo para o diretório

            return { message: `Arquivo "${fileName}" enviado com sucesso para o diretório "${directoryName}" no servidor FTP!` };
        } catch (error) {
            throw new Error('Erro ao enviar o arquivo para o servidor FTP: ' + error.message);
        } finally {
            if (client) {
                client.close();
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

    // Função para criar diretório e enviar arquivo TXT dentro dele
    async createDirectoryAndUploadFile(directoryName, fileName, fileContent) {
        const createDirResult = await this.createDirectoryOnFtp(directoryName)

        const uploadResult = await this.uploadFileToFtp(directoryName, fileName, fileContent)

        return {
            message: `Diretório ${directoryName} e arquivo ${fileName} criados com sucesso!`,
            directoryResult: createDirResult,
            fileResult: uploadResult
        }
    }
}

export default Ftp
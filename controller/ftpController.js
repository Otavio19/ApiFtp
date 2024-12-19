import { Client } from 'basic-ftp'
import fs from 'fs'
import path from 'path'

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
        let client
        const currentDir = process.cwd()  // Diretório atual
        const filePath = path.join(currentDir, fileName)  // Caminho do arquivo temporário
    
        try {
            // Acessa o arquivo e insere conteúdo no mesmo.
            fs.writeFileSync(filePath, fileContent)
    
            console.log('Arquivo criado em: ', filePath)
    
            client = await this.conectServer()
    
            // Navega até o diretório e cria o arquivo lá
            await client.ensureDir(directoryName)  // Garantindo que o diretório exista
            await client.uploadFrom(filePath, fileName)  // Envia o arquivo para o diretório
    
            return { message: `Arquivo "${fileName}" enviado com sucesso para o diretório "${directoryName}" no servidor FTP!` }
        } catch (error) {
            throw new Error('Erro ao enviar o arquivo para o servidor FTP: ' + error.message)
        } finally {
            if (client) {  
                client.close()  
            }
    
            // Verifica se o arquivo existe antes de tentar excluí-lo
            if (fs.existsSync(filePath)) {
                console.log('Removendo o arquivo temporário:', filePath)
                fs.unlinkSync(filePath)  // Remove o arquivo temporário local após o envio
            } else {
                console.log('Arquivo não encontrado para exclusão:', filePath)
            }
        }
    }    

    // Função para criar uma pasta no servidor FTP
    async createDirectoryOnFtp(directoryName) {
        let client

        try {
            client = await this.conectServer()

            await client.ensureDir(directoryName) // ensureDir cria o diretorio no servidor.

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

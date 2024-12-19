import Fastify from 'fastify'
import ftpRoute from './routes/ftpRoute.js'
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true
})

fastify.register(cors, {
  origin: "*",
});

fastify.register(ftpRoute)

async function start() {
  try {
    await fastify.listen({ 
      host: "0.0.0.0",
      port: process.env.PORT ?? 3333,
     })
    fastify.log.info('Servidor rodando na porta 3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

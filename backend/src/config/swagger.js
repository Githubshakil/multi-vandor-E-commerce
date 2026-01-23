const { version } = require('mongoose')
const swaggerJsdoc = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multivendor E-commerce API',
            version: '1.0.0',
            description: 'API for large scale multivendor ecommerce (MERN Stack)',
            contact: {
                name: 'Md Shakil Mahmud',
                email: 'shakilmahmud007@gmail.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 5000}`,
                description: 'Development server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
}

const specs = swaggerJsdoc(options)

module.exports = specs
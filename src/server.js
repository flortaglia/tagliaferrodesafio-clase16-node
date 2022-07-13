
const express = require('express')
const app = express()

const puerto =process.env.PORT||8080     
const path = require('path')

const database=require('./db_config_sqlite')
const dbMariadb = require('./db_config_mariadb')

const { Server: IOServer } = require('socket.io')
const {engine}= require("express-handlebars")

const Contenedor = require('../controllers/Contenedor')
const productosContenedor = new Contenedor(dbMariadb, "producto")
const ContainerMessages = require('../controllers/ContainerMessages')
const messagesContainer = new ContainerMessages(database, "mensaje")

const expressServer= app.listen(puerto, (err) => {
    if(err) {
        console.log(`Se produjo un error al iniciar el servidor: ${err}`)
    } else {
        console.log(`Servidor escuchando puerto: ${puerto}`)
    }
})

const io = new IOServer(expressServer)

// const messages= []
// const productos= []

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname,'/public')))
// app.engine(
//     "hbs",
//     engine({
//         extname:".hbs",
//         defaultLayout:'index.hbs',
//         layoutsDir:__dirname + "/views/layouts",
//         partialsDir:__dirname + '/views/partials/'

//     })
// );
// app.set('views', path.join(__dirname, './views'))
// app.set('view engine', 'hbs')

// app.use('/api', rutas)

const error404= (req, res,next)=>{
    let mensajeError={
        error : "-2",
        descripcion: `ruta: ${req.url} método: ${req.method} no implementado`
    }
    res.status(404).json( mensajeError)
    next()
} 
//Ruta NO encontrada
app.use(error404)

// async function escribir(){

//     try{
//         await database.schema.dropTableIfExists('mensaje');
//         console.log('drop')
//         await database.schema.createTable('mensaje', table=>{
//             table.increments('id').primary()
//             table.string('mail',50)
//             table.string('tiempochat')
//             table.string('message')
//         });
//         console.log('se creo la tabla mensaje')
//         console.log(messages)
//         await database.from('mensaje').insert(messages);
//         console.log('inserto mensajes tabla')
//         let rows= await database.from('mensaje').select("*");
//         rows.forEach((article)=>{ console.log(`${article['id']} ${article['mail']} ${article['tiempochat']}: ${article['message']}`) });
        
        
//     }catch(err){
//         console.log('no se pudo guardar el chat', err)
        
//     }

// }
// async function escribirProductos(){

//     try{
//         await dbMariadb.schema.dropTableIfExists('productos');
//         console.log('drop')
//         await database.schema.createTable('productos', table=>{
//             table.increments('id').primary()
//             table.string('title',50)
//             table.decimal('price')
//             table.string('thumbnail')
//         });
//         console.log('se creo la tabla productosx formulario')
//         console.log(productos)
//         await dbMariadb.from('productos').insert(productos);
//         console.log('inserto productos tabla x formulario')
//         let rows= await dbMariadb.from('productos').select("*");
//         rows.forEach((article)=>{ console.log(`${article['id']} ${article['title']} ${article['price']}: ${article['thumbnail']}`) });
        
        
//     }catch(err){
//         console.log('no se pudo guardar el productos tabla x formulario', err)
        
//     }

// }
// LADO SERVIDOR
io.on('connection', async socket=>{
    console.log('se conecto un usuario')
    const productos= await productosContenedor.getAll()

    io.emit('serverSend:Products', productos) //envio todos los productos

    socket.on('client:enterProduct', async (productInfo)=>{
        const {title, price, thumbnail} = productInfo
        await productosContenedor.newProduct(title, price, thumbnail) //recibo productos
        const productos= await productosContenedor.getAll()
        io.emit('serverSend:Products', productos)//emito productos recibidos a los usuarios
    })
    // PARTE CHAT _ LADO SERVIDOR
   const messages= await messagesContainer.getAllMessages() 
    io.emit('serverSend:message',messages) //envio CHATS a todos los usuarios

    socket.on('client:message', async(messageInfo)=>{
        const {mail,tiempochat,message} = messageInfo
        await messagesContainer.newMessages(mail, tiempochat, message)  //RECIBO mensaje y lo anido
        const messages= await messagesContainer.getAllMessages() 
        io.emit('serverSend:message', messages)//EMITO CHATS
    })
})




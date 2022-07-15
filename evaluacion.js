//4 - importar librerias
const express = require('express');
const {Pool}= require('pg');
const chalk=require("chalk");
const moment=require("moment");
const bodyParser=require("body-parser");


// 4.1 - inicializar
//conexion a bd, cambiar el password
const configuracion={
    user: "postgres",
    host:"localhost",
    database:"bancosolar",
    password:"12345"
}
const pool= new Pool(configuracion);

//4.1 - inicializar express
const app = express()
const port = 3000

//ruta  inicial
app.get('/', function(req, res) {
    res.sendFile(__dirname+"/html/index.html");
})

//ruta get usuarios
app.get('/usuarios',async function(req,res){
    console.log(chalk.yellow.inverse("nuevo request:GET/usuarios"));
    try {
        const consulta="SELECT id,nombre,balance FROM usuarios";
        const datos=await pool.query(consulta);            
        res.send(datos.rows);
    } catch (error) {
        console.log(chalk.red.inverse("Error get/usuarios:" + error.message));
        res.status(500);
        res.send("Error en la consulta");
    }
})
//rut a post usuarios
app.use(express.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.post('/usuario', async function (req, res) {
    console.log(chalk.yellow.inverse("nuevo request:POST/usuario"));
    //obtener los datos
    console.log(req.body);
    parametros=[req.body.nombre,req.body.balance];
    try {
        const consulta="INSERT INTO usuarios(nombre,balance) VALUES ($1,$2)";
        const datos=await pool.query(consulta,parametros);            
        console.log(chalk.blueBright.inverse(datos));
        res.send("OK");
    } catch (error) {
        console.log(chalk.red.inverse("Error post/usuarios:" + error.message));
        res.status(500);
        res.send("Error en la consulta");
    }
})

//get de las transferencias
app.get('/transferencias',async function(req,res){
    console.log(chalk.yellow.inverse("nuevo request:GET/transferencias"));
    try {
        let consulta='SELECT t.id,t.emisor,u1.nombre AS "nombreEmisor",t.receptor,u2.nombre AS "nombreReceptor",t.monto,t.fecha FROM transferencias t ';
        consulta+=" JOIN usuarios u1 ON u1.id=t.emisor "
        consulta+=" JOIN usuarios u2 ON u2.id=t.receptor "
        const datos=await pool.query(consulta);           
        let respuesta=[]
        for (let i = 0; i < datos.rows.length; i++) {           
            let fila=[datos.rows[i].nombreEmisor,datos.rows[i].nombreReceptor,datos.rows[i].monto,datos.rows[i].fecha];
            respuesta.push(fila);
        }
        res.send(respuesta);
    } catch (error) {
        console.log(chalk.red.inverse("Error get/usuarios:" + error.message));
        res.status(500);
        res.send("Error en la consulta");
    }
})


app.delete('',function (req,res) {
    //con req.query buscar el id y usarlo para eliminar
    //no se pueden eliminar usuario que tengan tansferencias asociadas.
})

app.put('',function(req,res){
    //para editar (update) un usuario
    //id viene del query
    //los nuevos datos vienen en el body
})

app.post('',function(req,res){
    //datos vienen en el body
    //para insertar una transferencia
    //OJO: no se peude transferir mas dinero que el que le queda al usuario
    //OJO: cuando transfieran dinero, se debe descontar del saldo del emisor
    //OJO: cuando se transfiera dinero, se debe sumar al receptor.
    //OJO: usar trasnsaccion para ejecutar ambas querys
})


//iniciar servidor
app.listen(port, () => console.log(`servidor iniciado en puerto ${port}!`))
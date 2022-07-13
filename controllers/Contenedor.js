
class Contenedor{
    constructor(dbMariadb, tableName ){
        try{
            this.dbMariadb=dbMariadb
            this.tableName=tableName
            dbMariadb.schema.hasTable(tableName).then(function(exists) {
                if (!exists) {
                  return dbMariadb.schema.createTable(tableName, table=>{
                    table.increments('id').primary()
                    table.string('title',50)
                    table.float('price')
                    table.string('thumbnail')
                  });
                }})  
                console.log('tabla creada', tableName)
        }catch(err){
            console.log('error constructor',err)    
        }
    }
   
    async getById(id_prod){
        const elemento = await this.dbMariadb.from(this.tableName).where('id','=',id_prod)
        console.log(elemento)
        return elemento   
    }
    async getAll(){
        let rows= await this.dbMariadb.from(this.tableName).select("*")
        rows.forEach((article)=>{ console.log(`${article['id']}`) })
        return rows
    }

    async deleteById(id_prod){
        await this.dbMariadb.from(this.tableName).select("*").where('id' ,'=',id_prod).del()
        
    }
    
    async update(id, title,  price, thumbnail){
        
        await this.dbMariadb.from(this.tableName).where('id' ,'=',id).update({
            title:title,
            price:price,
            thumbnail:thumbnail,
            // description:description,
            // code:code,
            // stock:stock,
            // timestamp:Date.now()

        })
              
    }
    async newProduct(title, price, thumbnail){
        const elemento = {
            title,
            price,
            thumbnail,
            // description, 
            // code,
            // stock,
            // timestamp:Date.now()
        }
        const product= await this.dbMariadb.from(this.tableName).insert(elemento)
        return product
    }

}

module.exports= Contenedor
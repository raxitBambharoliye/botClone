const mongoose=require('mongoose');

const url = "mongodb+srv://raxitbambharoliya:raxit08@cluster0.h789rwv.mongodb.net/e__com";

const db={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,db)
    .then( () => {
        console.log('Connected to the database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. n${err}`);
    })

module.exports=db;
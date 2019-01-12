const {relevanUser} = require('../service/top10User')


async function sendAllRespond(req,res){
    try{
        let data = await relevanUser(req.query)
        if(data){
            res.status(data.statusCode).json({
                message : data.message,
                peopleLikeYou : data.result
            })
        }else{
            res.status(500).json({
                message: `Error get data`
            })
        }
    }catch(err){
        res.status(500).json({
            message: `${err}`,
        })
     }
}

module.exports = sendAllRespond
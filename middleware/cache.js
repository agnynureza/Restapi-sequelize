const redis = require('redis')
const client = redis.createClient();

const cache = (req,res,next) => {
    let params = JSON.stringify(req.query)
    client.get(`bambu:${params}`, (err,found) => {
    let parse = JSON.parse(found)
    if (parse) {
      let info
      parse.length > 0 ? info ="Data found" : info = "Data not found"
        res.status(200).json({
          message: info,
          peopleLikeYou: parse
        })
      return
    }else{
      next()
    }
  })
}

module.exports = cache
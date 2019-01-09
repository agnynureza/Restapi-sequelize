const redis = require('redis')
const client = redis.createClient();

const cache = (req,res,next) => {
    let params = JSON.stringify(req.query)
    client.get(`bambu:${params}`, (err,found) => {
    if (found) {
      res.status(200).json({
        message: `Get data success`,
        data: JSON.parse(found)
      })
      return
    } else {
      next()
    }
  })
}

module.exports = cache
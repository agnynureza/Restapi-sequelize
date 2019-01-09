const {Data} = require('../models')
const sequelize = require('sequelize')
const redis = require('redis')
const client = redis.createClient();

class People{
    static  handleParams(query){
        return new Promise(resolve => {
            Data.findAll({
               raw:true, 
               attributes: [
                   [sequelize.fn('max', sequelize.col('age')), 'ageMax'],
                   [sequelize.fn('max', sequelize.cast(sequelize.col('latitude'),'decimal')), 'latitudeMax'],
                   [sequelize.fn('max', sequelize.cast(sequelize.col('longitude'),'decimal')), 'longitudeMax'],
                   [sequelize.fn('max', sequelize.col('monthlyIncome')), 'monthlyIncomeMax'],
                   [sequelize.fn('min', sequelize.col('age')), 'ageMin'],
                   [sequelize.fn('min', sequelize.cast(sequelize.col('latitude'),'decimal')), 'latitudeMin'],
                   [sequelize.fn('min', sequelize.cast(sequelize.col('longitude'),'decimal')), 'longitudeMin'],
                   [sequelize.fn('min', sequelize.col('monthlyIncome')), 'monthlyIncomeMin']
               ]
           }).then(params=>{
               let {ageMax,ageMin,latitudeMax,latitudeMin,longitudeMax,longitudeMin,monthlyIncomeMax,monthlyIncomeMin} = params[0]
               let nAge = ageMax - ageMin
               let nLatitude = latitudeMax - latitudeMin
               let nLongitude = longitudeMax - longitudeMin
               let nMonthlyIncome = monthlyIncomeMax - monthlyIncomeMin
               Data.findAll({
                   raw:true,
                   attributes: ['name', 'age', 'latitude', 'longitude', 'monthlyIncome', 'experienced']
               }).then(temp =>{
                   temp.map(x=>{
                       let tempScore = 0
                       let length = 0
                       if(Object.keys(query).length){
                           for(let key in query){
                               length++
                               if(key == 'age' && query[key] <= ageMax){
                                    let count = People.algorithma(nAge,Number(query[key]),x.age)
                                    tempScore += count
                               }else if(key =='latitude' && Number(query[key]) <= latitudeMax){
                                    let count = People.algorithma(nLatitude,Number(query[key]),Number(x.latitude))
                                    tempScore += count
                               }else if(key == 'longitude' && Number(query[key]) <= longitudeMax){
                                    let count = People.algorithma(nLongitude,Number(query[key]),Number(x.longitude)) 
                                    tempScore += count
                               }else if (key == 'monthlyIncome' && query[key] <= monthlyIncomeMax){
                                    let count = People.algorithma(nMonthlyIncome,Number(query[key]),Number(x.monthlyIncome))
                                   tempScore += count
                               }else if(key == 'experienced'){
                                   if(x.experienced != query[key]){
                                       tempScore += 1
                                   }else{
                                       tempScore += 0.5
                                   }
                               }else{
                                   tempScore += 0
                               }
                           } 
                       }else{
                           tempScore = 0
                           length = 1
                       }
                       let score = tempScore/length
                       x.score = score
                   })
                   let result = temp.sort(function(a,b){ return b.score - a.score}).slice(0,10)
                   client.set(`bambu:${JSON.stringify(query)}`, JSON.stringify(result))
                   client.expire(`bambu:${JSON.stringify(query)}`, 60)
                   
                   resolve(result)
               })
           })
        })
    }
    static algorithma(range,entry,value){
        let score;    
        if(entry > value){
            score = (range-(entry-value))/range
        }else{
            score = (range-(value-entry))/range
        }
        return score
    }
    static async sendAllRespond(req,res){
        try{
            let result = await People.handleParams(req.query).then(yeah=>{
                res.status(200).json({
                    message: 'data found',
                    peopleLikeYou: yeah
                })
            })
            
        }catch(err){
            res.status(500).json({
                message : `Error : ${err}`
            })
        }
    }
}

module.exports = People
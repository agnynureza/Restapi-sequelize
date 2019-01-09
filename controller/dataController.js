const {Data} = require('../models')
const sequelize = require('sequelize')
const redis = require('redis')
const client = redis.createClient()

async function handleParams(){
    try{
        let params =  await Data.findAll({
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
        })
        let {ageMax,ageMin,latitudeMax,latitudeMin,longitudeMax,longitudeMin,monthlyIncomeMax,monthlyIncomeMin} = params[0],
            nAge = ageMax - ageMin,
            nLatitude = latitudeMax - latitudeMin,
            nLongitude = longitudeMax - longitudeMin,
            nMonthlyIncome = monthlyIncomeMax - monthlyIncomeMin
        return  range = {nAge,nLatitude,nLongitude, nMonthlyIncome, ageMax,longitudeMax,latitudeMax,monthlyIncomeMax}
    }catch(err){
        res.status(500).json({
            message: `Error handlePrams: ${err}`,
            peopleLikeYou: []
        })
    }
}

async function handleQuery(query){
    try{
        let params = await handleParams()
        let data = await Data.findAll({
            raw:true,
            attributes: ['name', 'age', 'latitude', 'longitude', 'monthlyIncome', 'experienced']
        })
        data.map(person => {
            let tempScore = 0
            let length = 0
            for(let key in query){
                let count = 0
                length++
                switch(typeof(key) == 'string'){
                    case key == 'age':
                        count = algorithm(params.nAge,Number(query[key]),person.age)
                        tempScore += count
                        break
                    case key =='latitude':
                        count = algorithm(params.nLatitude,Number(query[key]),Number(person.latitude))
                        tempScore += count
                        break
                    case key == 'longitude':
                        count = algorithm(params.nLongitude,Number(query[key]),Number(person.longitude)) 
                        tempScore += count  
                        break
                    case key == 'monthlyIncome':
                        count = algorithm(params.nMonthlyIncome,Number(query[key]),Number(person.monthlyIncome))
                        tempScore += count
                        break
                    case key == 'experienced':
                        switch(String(person.experienced) == query[key].toLowerCase()){
                            case true:
                                tempScore += 1
                                break
                            case false: 
                                query[key].toLowerCase() == 'true' ||  query[key].toLowerCase() == 'false' ? tempScore += 0.5 : tempScore += 0
                                break
                        }
                        break   
                    default:
                        tempScore = 0
                        length = 1
                        break
                }
            }
            let score;
            length != 0 ? score = tempScore/length : score = 1
            person['score'] = score
        })
        result = data.sort(function(a,b){ return b.score - a.score}).slice(0,10)
        result.map(x=>{return Number(x['score']) < 0.95 ? x['score'] = Number(x['score'].toFixed(1)): x['score']= 0.9})
        return result
    }catch(err){
        res.status(500).json({
            message: `Error handleQuery:${err}`,
            peopleLikeYou: []
        })
    }
}

function algorithm(range,entry,value){
    if(entry > value){
        score = (range-(entry-value))/range
    }else{
        score = (range-(value-entry))/range
    }
    score > 1 || score < 0 || isNaN(score) ? score = 0 : score
    return score
}

async function sendAllRespond(req,res){
    try{
        let key =`bambu:${JSON.stringify(req.query)}`
        let result = await handleQuery(req.query)
        let check = 0 
        if(result){
            result.map(x=>{ return check += x['score'] })
            check != 0 ? client.set(key, JSON.stringify(result)) : client.set(key, JSON.stringify([]))
            client.expire(key, 3600)
            if(check != 0){
                res.status(200).json({
                        message: 'Data found',
                        peopleLikeYou: result
                })
            }else{
                res.status(202).json({
                    message: `Data not found`,
                    peopleLikeYou: []
                })
            }
        }    
    }catch(err){
        res.status(500).json({
            message: `data not found, Error:${err}`,
            peopleLikeYou: []
        })
    }   
   
} 


module.exports = sendAllRespond
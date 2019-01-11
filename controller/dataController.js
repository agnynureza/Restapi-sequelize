const {Data} = require('../models')
const sequelize = require('sequelize')
const redis = require('redis')
const client = redis.createClient()

async function handleParams(req,res){
    try{
        let params =  await Data.findAll({
            raw:true,
            attributes: [
                sequelize.literal(
                `max("age") - min("age") AS "rangeAge", 
                max(CAST("latitude" AS DECIMAL)) - min(CAST("latitude" AS DECIMAL)) AS "rangeLatitude",
                max(CAST("longitude" AS DECIMAL)) - min(CAST("longitude" AS DECIMAL)) AS "rangeLongitude", 
                max("monthlyIncome") - min("monthlyIncome")  AS "rangeMonthlyIncome"`)]
        })
        return {rangeAge,rangeLatitude,rangeLongitude,rangeMonthlyIncome} = params[0] 
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
        let {rangeAge,rangeLatitude,rangeLongitude,rangeMonthlyIncome} = params
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
                        count = algorithm(rangeAge,Number(query[key]),person.age)
                        tempScore += count
                        break
                    case key =='latitude':
                        count = algorithm(rangeLatitude,Number(query[key]),Number(person.latitude))
                        tempScore += count
                        break
                    case key == 'longitude':
                        count = algorithm(rangeLongitude,Number(query[key]),Number(person.longitude)) 
                        tempScore += count  
                        break
                    case key == 'monthlyIncome':
                        count = algorithm(rangeMonthlyIncome,Number(query[key]),person.monthlyIncome)
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
        result.map(x=>{return x['score'] < 0.95 ? x['score'] = Number(x['score'].toFixed(1)): x['score'] == 1 ? '' : x['score']= Number((x['score']-0.05).toFixed(1))})
        return result
    }catch(err){
        console.log(err)
    }
}

function algorithm(range,entry,value){
    let score;
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
        result.map(x=>{ return check += x['score'] })
        client.expire(key, 3600)
        if(check != 0){
            client.set(key, JSON.stringify(result))
            res.status(200).json({
                    message: 'Data found',
                    peopleLikeYou: result
            })
        }else{
            client.set(key, JSON.stringify([]))
            res.status(202).json({
                message: `Data not found`,
                peopleLikeYou: []
            })
        }
    }catch(err){
        res.status(500).json({
            message: `data not found, Error:${err}`,
            peopleLikeYou: []
        })
    }   
   
} 


module.exports = sendAllRespond
const {algorithm} = require('../helper/algoritm')
const handleParameters = require('../dataAccess/handleParameters')
const redis = require('redis')
const client = redis.createClient()

async function handleQuery(query){
    try{
        let dataAccess = await handleParameters()
        let {rangeAge,rangeLatitude,rangeLongitude,rangeMonthlyIncome} = dataAccess.params
        let {data} = dataAccess
        for(let person = 0 ; person < data.length ; person++){
            let tempScore = 0
            let length = 0
            for(let key in query){
                let count = 0
                length++
                switch(typeof(key) == 'string'){
                    case key == 'age':
                        count = algorithm(rangeAge,Number(query[key]),data[person].age)
                        tempScore += count
                        break
                    case key =='latitude':
                        count = algorithm(rangeLatitude,Number(query[key]),Number(data[person].latitude))
                        tempScore += count
                        break
                    case key == 'longitude':
                        count = algorithm(rangeLongitude,Number(query[key]),Number(data[person].longitude)) 
                        tempScore += count  
                        break
                    case key == 'monthlyIncome':
                        count = algorithm(rangeMonthlyIncome,Number(query[key]),data[person].monthlyIncome)
                        tempScore += count
                        break
                    case key == 'experienced':
                        switch(String(data[person].experienced) == query[key].toLowerCase()){
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
            data[person]['score'] = score
        }
        result = data.sort(function(a,b){ return b.score - a.score}).slice(0,10)
        result.forEach(x=>{return x['score'] < 0.95 ? x['score'] = Number(x['score'].toFixed(1)): x['score'] == 1 ? '' : x['score']= Number((x['score']-0.05).toFixed(1))})
        return result
    }catch(err){
        throw new Error(err)
    }
}

async function relevanUser (query) {
    try{
        let key =`bambu:${JSON.stringify(query)}`
        let result = await handleQuery(query)
        let check = 0 
        result.forEach(x=>{ return check += x['score'] })
        if(check != 0){
            client.setex(key, 3600,  JSON.stringify(result) )
            return {result,statusCode:200, message:'Data found'};
        }else{
            client.setex(key, 3600, JSON.stringify([]))
            return {result:[],statusCode:202, message:'Data not found'};
        }
    }catch(err){
        throw new Error(err)
    }
}   

module.exports = {
    relevanUser,
    handleQuery
}
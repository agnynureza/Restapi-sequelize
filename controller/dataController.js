const {Data} = require('../models')
const sequelize = require('sequelize')

class People{
    static  handleParams(query){
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
                    for(let key in query){
                        if(key == 'age'){
                           let count = People.algorithma(nAge,Number(query[key]),x.age)
                           tempScore += count
                        }else if(key =='latitude'){
                            let count = People.algorithma(nLatitude,Number(query[key]),Number(x.latitude))
                           tempScore += count
                        }else if(key == 'longitude'){
                            let count = People.algorithma(nLongitude,Number(query[key]),Number(x.longitude))
                            tempScore += count
                        }else if (key == 'monthlyIncome'){
                            let count = People.algorithma(nMonthlyIncome,Number(query[key]),Number(x.monthlyIncome))
                            tempScore += count
                        }else if(key == 'experienced'){
                            if(x.experienced != query[key]){
                                tempScore += 0.5
                            }else{
                                tempScore += 1
                            }
                        }else{
                            tempScore += 0
                        }
                    } 
                    let score = tempScore/5
                    x.score = score
                })
                console.log(temp.sort(function(a,b){ return b.score - a.score}).slice(0,10))
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
    static sendAllRespond(req,res){
        People.handleParams(req.query)

    }
}

module.exports = People
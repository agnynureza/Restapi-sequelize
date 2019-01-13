const {Data} = require('../models')
const sequelize = require('sequelize')

async function handleParameters(req,res){
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
        let data = await Data.findAll({
            raw:true,
            attributes: ['name', 'age', 'latitude', 'longitude', 'monthlyIncome', 'experienced']
        })
        return{params:params[0],data}
    }catch(err){
        res.status(500).json({
            message: `Error handlePrams: ${err}`
        })
    }
}

module.exports = handleParameters 


const chai = require('chai')
    ,chaiHttp = require('chai-http')
    ,chaiSorted = require('chai-sorted')
const {algorithm} = require('../helper/algoritm')
const service = require('../service/top10User')

chai.use(chaiHttp)
chai.use(chaiSorted)

const expect = chai.expect
const URL = `http://postgres-server.agnynureza.online`

describe('Read all data people', ()=> {
    it('should show ten people with age 20',(done)=>{
        chai.request(URL)
        .get('/people-like-you')
        .query({age:20})
        .end((err,res)=>{
            if(!err){
                expect(res).to.be.json;
                expect(res).to.have.status(200)
                expect(res.body.message).to.be.a('string')
                expect(res.body).to.have.own.property('message').to.include('Data found')
                expect(res.body).to.have.own.property('peopleLikeYou')
                expect(res.body.peopleLikeYou).to.be.an('array')
                expect(res.body.peopleLikeYou[0].name).to.be.an('string')
                expect(res.body.peopleLikeYou[0].age).to.be.an('number')
                expect(res.body.peopleLikeYou[0].latitude).to.be.an('string')
                expect(res.body.peopleLikeYou[0].longitude).to.be.an('string')
                expect(res.body.peopleLikeYou[0].monthlyIncome).to.be.an('number')
                expect(res.body.peopleLikeYou[0].experienced).to.be.an('boolean')
                expect(res.body.peopleLikeYou[0].score).to.be.an('number')
                expect(res.body.peopleLikeYou[0]).to.be.an('object').to.include.keys('name','age','latitude', 'longitude','monthlyIncome','experienced','score')
                expect(res.body.peopleLikeYou).to.be.sortedBy('score',true)
                done()
            }
        })
    })
})

describe('algoritm for give score', ()=>{
    it('should return score when score range in 0 - 1', (done) => {
        let result = algorithm(100,50,30)
        expect(result).to.equal(0.8)
        expect(result).to.be.a('number')
        done()
    })
    it('should return score = 0 when  0>score>1 or NaN', (done)=>{
        let result = algorithm(100,50,300)
        expect(result).to.equal(0)
        expect(result).to.be.a('number')
        result = algorithm(100,50,NaN)
        expect(result).to.equal(0)
        expect(result).to.be.a('number')
        done()
    })
})

describe('relevan user based on score',()=>{
    it('should be return top 10 relevan user',async ()=>{
        let result = await service.relevanUser({age:30})
        expect(result).to.be.an('object')
        expect(result).to.have.all.keys('result','message', 'statusCode')
        expect(result.result).to.be.an('array').to.have.lengthOf(10)
        expect(result).to.have.a.property('message').to.include('Data found')
        expect(result).to.have.a.property('statusCode').to.equal(200)
    })

    it('should be return [] and data not found', async () =>{
        let result = await service.relevanUser({age:500})
        expect(result).to.be.an('object')
        expect(result.result).to.be.an('array')
        expect(result).to.have.a.property('message').to.include('Data not found')
        expect(result).to.have.a.property('statusCode').to.equal(202)
    })
})

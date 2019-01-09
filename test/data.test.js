const chai = require('chai')
    ,chaiHttp = require('chai-http')
    ,chaiSorted = require('chai-sorted')

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
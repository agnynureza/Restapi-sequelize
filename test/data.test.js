const chai = require('chai')
    ,chaiHttp = require('chai-http')
    ,chaiSorted = require('chai-sorted')

chai.use(chaiHttp)
chai.use(chaiSorted)

const expect = chai.expect
const URL = `http://localhost:3000`

describe('Read all data people', ()=> {
    it('should show ten people with age 20',(done)=>{
        chai.request(URL)
        .get('/people-like-you')
        .query({age:20})
        .end((err,res)=>{
            if(!err){
                expect(res).to.have.status(200)
                expect(res.body.message).to.be.a('string')
                expect(res.body.peopleLikeYou).to.be.an('array')
                expect(res.body.peopleLikeYou).to.be.sortedBy('score',true)
                done()
            }
        })
    })
})
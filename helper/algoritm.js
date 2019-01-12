module.exports = {

    algorithm:(range,entry,value)=>{
        let score;
        if(entry > value){
            score = (range-(entry-value))/range
        }else{
            score = (range-(value-entry))/range
        }
        score > 1 || score < 0 || isNaN(score) ? score = 0 : score
        return score
    }
    
}
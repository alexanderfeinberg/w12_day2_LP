// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import model(s)
const { Student } = require('../db/models');
const { Op } = require("sequelize");

const checkPageSize = (query, errorResult) => {
    let { page, size } = query
    const res = {page:1, size:10}
    if(page){
        if(parseInt(page)>=0){
            res.page = parseInt(page)
        }else {
            if(!res.error){
            res.error = true
            errorResult.errors.push('Requires valid page and size params')
            }
        }
    }
    if(size){
        if(parseInt(size)>=0){
            res.size=parseInt(size)
        }else{
            if(!res.error){
                res.error = true
                errorResult.errors.push('Requires valid page and size params')
                }
        }

    }

    return res
}

// List
router.get('/', async (req, res, next) => {
    let errorResult = { errors: [], count: 0, pageCount: 0 };

    // Phase 2A: Use query params for page & size
    // Your code here
    let { page, size } = checkPageSize(req.query, errorResult)

    let query = {}
    if(page>0){
        query.offset = size*(page-1)
    }
    if(size>0){
        query.limit = size
    }

    // Phase 2B: Calculate limit and offset
    // Phase 2B (optional): Special case to return all students (page=0, size=0)
    // Phase 2B: Add an error message to errorResult.errors of
        // 'Requires valid page and size params' when page or size is invalid
    // Your code here

    // Phase 4: Student Search Filters
    /*
        firstName filter:
            If the firstName query parameter exists, set the firstName query
                filter to find a similar match to the firstName query parameter.
            For example, if firstName query parameter is 'C', then the
                query should match with students whose firstName is 'Cam' or
                'Royce'.

        lastName filter: (similar to firstName)
            If the lastName query parameter exists, set the lastName query
                filter to find a similar match to the lastName query parameter.
            For example, if lastName query parameter is 'Al', then the
                query should match with students whose lastName has 'Alfonsi' or
                'Palazzo'.

        lefty filter:
            If the lefty query parameter is a string of 'true' or 'false', set
                the leftHanded query filter to a boolean of true or false
            If the lefty query parameter is neither of those, add an error
                message of 'Lefty should be either true or false' to
                errorResult.errors
    */
    const where = {};

    // Your code here
    if(req.query.firstName){
        where.firstName = {
            [Op.like]:req.query.firstName
        }
    }

    if(req.query.lastName){
        where.lastName = {
            [Op.like]:`%${req.query.lastName}%`
        }
    }

    if(req.query.lefty){
        let lefty  = req.query.lefty
        console.log(lefty)
        if(lefty !== 'true' && lefty!=='false'){
            errorResult.errors.push("Lefty should be either true or false")
        }else{
            if(lefty === 'true'){
                where.leftHanded=true
            }else{
                where.leftHanded=false
            }
        }
    }



    // Phase 2C: Handle invalid params with "Bad Request" response
    // Phase 3C: Include total student count in the response even if params were
        // invalid
        /*
            If there are elements in the errorResult.errors array, then
            return a "Bad Request" response with the errorResult as the body
            of the response.

            Ex:
                errorResult = {
                    errors: [{ message: 'Grade should be a number' }],
                    count: 267,
                    pageCount: 0
                }
        */
    // Your code here

    let result = {};
    result.page=page>0 ? page : 1

    if(errorResult.errors.length){
        let totalCount = await Student.count()
        errorResult.count = totalCount
        res.status(400)
        res.json(errorResult)
    }

    // Phase 3A: Include total number of results returned from the query without
    // limits and offsets as a property of count on the result
    // Note: This should be a new query

    result.count = await Student.count({
        where:where
    })

    result.pageCount = Math.ceil(result.count/size)




    result.rows = await Student.findAll({
        attributes: ['id', 'firstName', 'lastName', 'leftHanded'],
        where:where,
        // Phase 1A: Order the Students search results
        order:[["lastName","ASC"],["firstName","ASC"]],
        ...query
    });

    // Phase 2E: Include the page number as a key of page in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // page to 1
        /*
            Response should be formatted to look like this:
            {
                rows: [{ id... }] // query results,
                page: 1
            }
        */
    // Your code here

    // Phase 3B:
        // Include the total number of available pages for this query as a key
            // of pageCount in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // pageCount to 1
        /*
            Response should be formatted to look like this:
            {
                count: 17 // total number of query results without pagination
                rows: [{ id... }] // query results,
                page: 2, // current page of this query
                pageCount: 10 // total number of available pages for this query
            }
        */
    // Your code here

    if(!errorResult.errors.length) res.json(result);
});

// Export class - DO NOT MODIFY
module.exports = router;

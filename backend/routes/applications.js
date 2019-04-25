var express = require('express');
var router = express.Router();
let db = require('../database');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/', function (req, res) {
    console.log("get all applications");
    db.getApplications((data)=>{
        console.log(data.val())
        return res.status(200).send(data.val());
    });
});

router.post("/create", (req, res) => {
    console.log('sendtest', req.body);
    const {
        name,
        type,
        applicationArchitecture,
        applicationLanguage,
        applicationDescription,
        minSdk,
        maxSdk,
        supportedBrowsers,
    } = req.body;

    const process = [];
    const versions = [];

    var application = {};
    var err = '';
    code_check: {
        if (isEmpty(name)) {
            err = 'Application name is empty';
            break code_check;
        } else if (isEmpty(type)) {
            err = 'Application type is empty';
            break code_check;
        } else if (isEmpty(applicationArchitecture)) {
            err = 'Application architecture is empty';
            break code_check;
        } else if (isEmpty(applicationLanguage)) {
            err = 'Application language is empty';
            break code_check;
        }
    }

    if (err === '') {
        application = {
            name,
            type,
            applicationArchitecture,
            applicationLanguage,
            applicationDescription,
            minSdk,
            maxSdk,
            supportedBrowsers,
            process,
            versions
        }
        db.saveApplication(application, (error) => {
            if(error){
                console.log(err);
                return res.status(400).send(err);
            } else {
                return res.status(200).send(application);
            }
        })
    } else {
        console.log(err);
        return res.status(400).send(err);
    }

});

isEmpty = (str) => {
    return (!str || 0 === str.length);
}

module.exports = router;
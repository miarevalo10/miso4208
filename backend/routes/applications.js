var express = require('express');
var router = express.Router();
let db = require('../database');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/', function (req, res) {
    res.send('Applications home page');
});

router.post("/create", (req, res) => {
    console.log('sendtest', req.body);
    const {
        applicationName,
        applicationType,
        applicationArchitecture,
        applicationLanguage,
        applicationDescription,
        minSdk,
        maxSdk,
        supportedBrowsers,
    } = req.body;

    var application = {};
    var err = '';
    code_check: {
        if (isEmpty(applicationName)) {
            err = 'Application name is empty';
            break code_check;
        } else if (isEmpty(applicationType)) {
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
            applicationName,
            applicationType,
            applicationArchitecture,
            applicationLanguage,
            applicationDescription,
            minSdk,
            maxSdk,
            supportedBrowsers,
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
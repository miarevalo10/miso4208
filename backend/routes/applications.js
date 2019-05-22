var express = require('express');
var router = express.Router();
let db = require('../database');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

router.get('/', function (req, res) {
    //console.log("get all applications");
    db.getApplications((data) => {
        console.log(data.val())
        return res.status(200).send(data.val());
    });
});

router.post("/addVersion", (req, res) => {
    console.log('add version', req.body);
    db.saveVersion(req.body.projectId, req.body.version).then(response => {
        return res.status(200).send(response);
    }).catch(error => {
        console.log(error)
        console.log('error en back', error)
        return res.status(400).send(error);
    });

});


router.post("/create", (req, res) => {
    console.log('sendtest reqbody', req.body);
    const {
        name,
        type,
        applicationArchitecture,
        applicationLanguage,
        applicationDescription,
        minSdk,
        maxSdk,
        supportedBrowsers,
        versions
    } = req.body;

    const process = [];
    //const versions = [];

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
            process
        }
        console.log('app to save', application);
        const projectId = db.saveApplication(application);
        //const projectId = ref.key();
        console.log('PROJECT ID', projectId);
        db.saveVersion(projectId, versions[0]).then(response => {
            //console.log('response en back', response);
            application.projectId = projectId;
            return res.status(200).send(application);
        }).catch(error => {
            console.log(error)
            console.log('error en back', error)
            return res.status(400).send(error);

        });
    } else {
        console.log(err);
        return res.status(400).send(err);
    }

});

isEmpty = (str) => {
    return (!str || 0 === str.length);
}

module.exports = router;
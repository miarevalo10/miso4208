const fs = require('fs')
const path = require('path');
var shell = require('shelljs');
let db = require('./database');
var AWS = require('aws-sdk');
const uuidv1 = require('uuid/v1')


var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();

const PROJECT_PATH = "./mutapk/"
const MUTATION_PATH = './mutation/'
const MUTANTS_PATH = MUTATION_PATH + 'mutants/'
const REPORTS = 'reports/'
const RESULTS = 'results/'
//const REPORTS_FOLDER = BASE_PATH + REPORTS
//const RESULTS_FOLDER = BASE_PATH + 'results/'
const BUCKET_NAME = 'pruebas-autom'
const FOLDER_S3 = 'random/'
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/"

var msg = {
    "projectId": "-LbQxpuXbI9dVHD83BjD",
    "processId": "-Ld45MlKFd75-u5dO_Z2",
    "url": "http://ec2-3-87-196-16.compute-1.amazonaws.com/index.php/admin/authentication/sa/login",
    "seed": 123,
    "events": 10
}

console.log("Inicio de ejecución de Mutation.")
ejecutarMensaje(msg);
console.log("Fin de ejecución de Mutation.")

function ejecutarMensaje(mensaje) {
    let process = db.getProcess(mensaje.projectId, mensaje.processId)
    process.child('state').set("Running")
    resetProject(mensaje)
    generateMutants(mensaje)
}

function resetProject(data) {
    //shell.exec('rm -r ' + MUTATION_PATH)
    //shell.exec('mkdir ' + MUTATION_PATH)
    shell.exec('rm -r ' + MUTANTS_PATH)
    shell.exec('mkdir ' + MUTANTS_PATH)
}

function generateMutants(data) {
    shell.exec('java -jar mutapk/MutAPK-0.0.1.jar mutation/me.kuehle.carreport_79.apk me.kuehle.carreport mutation/mutants/ mutapk/extra/ . true 2 12345').output
    /*shell.exec('npx cypress run .').output
    changeResultsContextAndFolders(data)
    shell.exec('npx mochawesome-report-generator -i ' + RESULTS_FOLDER + 'mochawesome.json -f ' + FILENAME_REPORT + ' -o ' + REPORTS)
    uploadFileToS3(REPORTS + FILENAME_REPORT, s3Path(data) + REPORTS, "text/html");
    updateProcess(data)
    */
}

function changeResultsContextAndFolders(data) {
    let file = RESULTS_FOLDER + 'mochawesome.json'
    let content = fs.readFileSync(file)
    let result = JSON.parse(content)
    let suite = result.suites.suites[0]

    content = fs.readFileSync(RESULTS + 'events.json')
    let events = JSON.parse(content)

    let testContent = JSON.stringify(suite.tests[0]);
    suite.tests = []
    for (let event of events) {
        let s3basePath = s3Path(data)
        let s3ScreenshotsPath = s3basePath + SCREENSHOTS_PROJECT.replace(BASE_PATH, "")
        let screenshotFile = formatted_string('000', event.order, 'l') + '.png'

        let test = JSON.parse(testContent)
        test.title = event.event
        test.fullTitle = event.event
        test.uuid = uuidv1()
        test.code = event.element
        test.context = '{\"title\": \"Detail\",\"value\": \"' + URL_S3 + s3ScreenshotsPath + screenshotFile + '\"}'
        suite.tests.push(test)

        uploadFileToS3(SCREENSHOTS_PROJECT + screenshotFile, s3ScreenshotsPath, "image/png")
    }

    fs.writeFileSync(file, JSON.stringify(result, null, 4))
}

function s3Path(data) {
    return FOLDER_S3 + data.projectId + "/process/" + data.processId + "/"
}

function updateProcess(data) {
    let content = fs.readFileSync(RESULTS_FOLDER + 'mochawesome.json')
    let result = JSON.parse(content)

    let process = db.getProcess(data.projectId, data.processId)
    process.child('result').set(result)
    process.child('report').set(URL_S3 + s3Path(data) + REPORTS_FOLDER.replace(BASE_PATH, "") + 'index.html')
    process.update({ state: "Terminated" })
}

function uploadFileToS3(filePath, s3Path, contentType) {
    var fileName = path.basename(filePath)
    var params = {
        Bucket: BUCKET_NAME,
        Body: fs.createReadStream(filePath),
        Key: s3Path + fileName,
        ContentType: contentType,
        ACL: 'public-read'
    };

    s3.upload(params, function (err, data) {
        if (err) console.error("Error", err);
    });
}

function formatted_string(pad, user_str, pad_pos) {
    if (typeof user_str === 'undefined')
        return pad;
    if (pad_pos == 'l') {
        return (pad + user_str).slice(-pad.length);
    }
    else {
        return (user_str + pad).substring(0, pad.length);
    }
}
/* eslint-disable prefer-template */
const { resolveAndRunStepDefinition } = require("./resolveStepDefinition");

const replaceParameterTags = (rowData, text) =>
  Object.keys(rowData).reduce(
    (value, key) => value.replace(`<${key}>`, rowData[key]),
    text
  );

const stepTest = function (stepDetails, exampleRowData) {
  cy.log(`${stepDetails.keyword} ${stepDetails.text}`);
  resolveAndRunStepDefinition.call(
    this,
    stepDetails,
    replaceParameterTags,
    exampleRowData
  );
  cy.screenshot(cy.state('runnable').title.replace("/", "") + "/" + (stepDetails.index).pad(3) + stepDetails.keyword + stepDetails.text.replace("/", ""))
};

Number.prototype.pad = function (size) {
  var sign = Math.sign(this) === -1 ? '-' : '';
  return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size);
}

function extractIterations(scenarioName) {
  var arr = scenarioName.match(/{(.*)}$/g) || [""]; //could also use null for empty value
  if (arr[0] === "") {
    return 1
  } else {
    let iterationsNumber = Number(arr[0].replace("{", "").replace("}", ""))
    return iterationsNumber > 0 ? iterationsNumber : 1;
  }
}

const createTestFromScenario = (scenario, backgroundSection) => {
  let iterations = extractIterations(scenario.name)
  for (let index = 1; index <= iterations; index++) {
    if (scenario.examples) {
      scenario.examples.forEach(example => {
        const exampleValues = [];

        example.tableBody.forEach((row, rowIndex) => {
          example.tableHeader.cells.forEach((header, headerIndex) => {
            exampleValues[rowIndex] = Object.assign({}, exampleValues[rowIndex], {
              [header.value]: row.cells[headerIndex].value
            });
          });
        });

        exampleValues.forEach((rowData, index) => {
          // eslint-disable-next-line prefer-arrow-callback
          const scenarioName = replaceParameterTags(rowData, (scenario.name.replace("{" + iterations + "}", "")).trim());
          it(`${scenarioName} (example #${index + 1})` + (iterations > 1 ? ` random #${index}` : ''), function () {
            if (backgroundSection) {
              backgroundSection.steps.forEach((step, stepIndex) => {
                step.index = stepIndex;
                stepTest.call(this, step);
              });
            }

            scenario.steps.forEach((step, stepIndex) => {
              const newStep = Object.assign({}, step);
              newStep.text = replaceParameterTags(rowData, newStep.text);
              newStep.index = stepIndex
              stepTest.call(this, newStep, rowData);
            });
          });
        });
      });

    } else {
      it((scenario.name.replace("{" + iterations + "}", "")).trim() + (iterations > 1 ? ` random #${index}` : ""), function () {
        if (backgroundSection) {
          backgroundSection.steps.forEach((step, stepIndex) => { step.index = stepIndex; stepTest.call(this, step) });
        }
        scenario.steps.forEach((step, stepIndex) => { step.index = stepIndex; stepTest.call(this, step) });
      });
    }
  }
};

module.exports = {
  createTestFromScenario
};

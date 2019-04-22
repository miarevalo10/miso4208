const seedrandom = require('seedrandom');
var screenshotIndex = 1
var seed = 123
seedrandom(seed, { global: true });

describe("Site under monkeys' events", function () {
    it("Visit site and survives monkeys' events", function () {
        cy.visit(Cypress.config().baseUrl);
        takeScreenshot()
        cy.wait(1000);
        randomEvent(10);
    })
})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

var events = [
    { element: 'a', event: randomClickLink },
    { element: 'button', event: randomClickButton },
    { element: 'input[type="text"]', event: randomTypeText },
    { element: 'select', event: randomSelect }
];

function randomEvent(monkeysLeft) {
    if (monkeysLeft > 0) {
        let randomChoice = events[getRandomInt(0, events.length)]
        runEvent(randomChoice)
        cy.wait(1000);
        randomEvent(monkeysLeft - 1);
    }
}

function runEvent(randomChoice) {
    cy.get('body').then(($body) => {
        if ($body.find(randomChoice.element).length) {
            randomChoice.event()
        }
    });
}

function randomClickLink() {
    cy.get('a').then($links => {
        var randomLink = $links.get(getRandomInt(0, $links.length));
        if (!Cypress.dom.isHidden(randomLink)) {
            cy.wrap(randomLink).click({ force: true });
            takeScreenshot()
            //cy.wait(1000);
        }
    });

}

function randomClickButton() {
    cy.get('button').then($buttons => {
        var randomButton = $buttons.get(getRandomInt(0, $buttons.length));
        if (!Cypress.dom.isHidden(randomButton)) {
            cy.wrap(randomButton).click({ force: true });
            takeScreenshot()
        }
    });
}

function randomTypeText() {
    cy.get('input[type="text"]').then($inputs => {
        var randomInput = $inputs.get(getRandomInt(0, $inputs.length));
        if (!Cypress.dom.isHidden(randomInput)) {
            cy.wrap(randomInput).click({ force: true }).type("Monkey is typing", { force: true });
            takeScreenshot()
        }
    });
}

function randomSelect() {
    cy.get('select').then($selects => {
        var selectRandom = $selects.get(getRandomInt(0, $selects.length));
        if (!Cypress.dom.isHidden(selectRandom) && selectRandom.options.length > 0) {
            var optionRandom = selectRandom.options[getRandomInt(0, selectRandom.options.length)].value;
            cy.wrap(selectRandom).select(optionRandom, { force: true });
            takeScreenshot()
        }
    });
}

function takeScreenshot() {
    cy.screenshot((screenshotIndex).pad(3));
    screenshotIndex++;
}

Number.prototype.pad = function (size) {
    var sign = Math.sign(this) === -1 ? '-' : '';
    return sign + new Array(size).concat([Math.abs(this)]).join('0').slice(-size);
}
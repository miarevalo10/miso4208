function loadScript(callback) {
  var s = document.createElement('script');
  s.src = 'https://rawgithub.com/marmelab/gremlins.js/master/gremlins.min.js';
  if (s.addEventListener) {
    s.addEventListener('load', callback, false);
  } else if (s.readyState) {
    s.onreadystatechange = callback;
  }
  document.body.appendChild(s);
}

function unleashGremlins(ttl, callback) {
  function stop() {
    horde.stop();
    callback();
  }

  // FormFiller para que solo actue sobre elementos que se pueden llenar.
  var formFiller = window.gremlins.species.formFiller();
  formFiller.canFillElement(function (element) {
    var isTextType = element.type == "text"
      || element.type == "password"
      || element.type == "textarea"
      || element.type == "number"
      || element.type == "email";
    return isTextType && !element.hidden;
  });

  // Para que la specie solo haga clicks en botones o links.
  var clicker = window.gremlins.species.clicker().clickTypes(['click']);
  clicker.canClick(function (element) {
    var elementsToClick = element.type == "button" || element.tagName == "a";
    return elementsToClick && !element.hidden;
  });

  var horde = window.gremlins.createHorde();
  horde.seed(1234);
  horde.gremlin(clicker);
  horde.gremlin(formFiller);
  horde.strategy(window.gremlins.strategies.distribution()
    .delay(30) // Milisegundos entre cada evento
    .distribution([0.5, 0.5]) // Oportunidad que cada gremlin registrado ocurra (70% para clicker y 30% para formFiller).
  );
  horde.after(callback);

  window.onbeforeunload = stop;
  setTimeout(stop, ttl);
  horde.unleash();
}

describe('Monkey testing with gremlins ', function () {

  it('it should not raise any error', function () {
    browser.url('/index.php/admin/index')
    browser.setValue('#user', "admin")
    browser.setValue('#password', "admin")
    browser.element('button[name="login_submit"]').click()
    
    browser.url('/index.php/admin/survey/sa/listsurveys')    

    browser.timeoutsAsyncScript(60000);
    browser.executeAsync(loadScript);

    browser.timeoutsAsyncScript(60000);
    browser.executeAsync(unleashGremlins, 50000);
  });

  afterAll(function () {
    browser.log('browser').value.forEach(function (log) {
      browser.logger.info(log.message.split(' ')[2]);
    });
  });

});
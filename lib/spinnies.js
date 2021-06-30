const Spinnies = require("spinnies");
const cliSpinners = require("cli-spinners");

const spinnies = new Spinnies({
    spinner: cliSpinners.arc,
    succeedColor: "white",
    succeedPrefix: "✔",
    failColor: "white"
});

module.exports = spinnies;

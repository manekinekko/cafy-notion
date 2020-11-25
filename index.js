const { App } = require("@manekinekko/cafy");

const { connect, wait } = require("./utils");

const spinner = require("ora")().start();
spinner.info("Navigate to https://console.neurosity.co/ to access training data.");

(async () => {
  const mind = await connect();
  cafy = new App();

  let confirmationThresholdMax = 50;
  let confirmationThreshold = confirmationThresholdMax;

  spinner.start(`Reading brain data...`);

  mind.kinesis("leftIndexFinger").subscribe(async (intent) => {
    if (intent.confidence >= 0.8) {
      spinner.text = `Command confirming: ${intent.confidence}, ${confirmationThreshold}`;

      // compute confirmation threshold
      confirmationThreshold = Math.max(confirmationThreshold - 1, 0);

      if (confirmationThreshold <= 0) {
        spinner.text = `Your Espresso shot is on its way...`;
        await cafy.sendCommand("Espresso", ["0d1183f001010100140201080000000653d7"]);
        await wait(43); // 43s = brewing + serving the coffee
        
        const { deviceNickname } = await mind.getSelectedDevice();
        await mind.disconnect();
        spinner.succeed(`Disconnected from Notion headset: ${deviceNickname}`);
        spinner.info(`Exiting...`);

        await cafy.disconnect(); // will call process.exit()
      }
    }

    spinner.text = `Command detected. Awaiting confirmation=${confirmationThreshold} (conf=${intent.confidence})`;
  });
})();

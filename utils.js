require("dotenv").config();
const credentials = {
  email: process.env.NEUROSITY_EMAIL || "",
  password: process.env.NEUROSITY_PASSWORD || "",
};
const { Notion } = require("@neurosity/notion");

const spinner = require("ora")().start();

const checkCredentials = () => {
  const isMissing = (env) => {
    return env === "" || env === 0;
  };
  if (isMissing(credentials.email) || isMissing(credentials.password)) {
    spinner.stop("Please verify email and password are in .env file, quitting...");
    process.exit(0);
  }
};

const connect = async () => {
  checkCredentials();
  spinner.start(`${credentials.email} attempting to authenticate`);

  const notion = new Notion();

  await notion
    .login({
      email: credentials.email,
      password: credentials.password,
    })
    .catch((error) => {
      spinner.fail(`Connection to Notion headset failed!`);
      throw new Error(error);
    });

  const { deviceNickname } = await notion.getSelectedDevice();
  spinner.succeed(`Connected to Notion headset: ${deviceNickname}`);

  return notion;
};

const wait = (time) => new Promise((res) => setTimeout(res, time * 1000));

module.exports = {
  connect,
  wait,
};

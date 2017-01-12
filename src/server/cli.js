const crypto = require('crypto');

const commander = require('commander');

const { config } = require('./config');
const checkBrowserVersion = require('./firefox/checkBrowserVersion');
const closeDriver = require('./firefox/closeDriver');
const constructUrl = require('./constructUrl');
const initializeWebdriver = require('./firefox/initializeWebdriver');
const runVisualDiffs = require('./firefox/runVisualDiffs');
const server = require('./server');
const uploadLastResult = require('./uploadLastResult');

function logAndExit(error) {
  console.error(error);
  process.exit(1);
}

commander.command('debug').action(() => {
  server.start().then(() => {
    console.log(`=> ${constructUrl('/debug')}`);
  });
});

commander.command('run').action(() => {
  server.start()
    .then(checkBrowserVersion)
    .then(initializeWebdriver)
    .then((driver) => {
      runVisualDiffs(driver)
        .then(() => {
          closeDriver(driver).then(() => {
            process.exit(0);
          });
        })
        .catch((error) => {
          closeDriver(driver).then(() => {
            logAndExit(error);
          });
        });
    });
});

commander.command('review').action(() => {
  server.start().then(() => {
    console.log(`=> ${constructUrl('/review')}`);
  });
});

commander.command('review-demo').action(() => {
  server.start().then(() => {
    console.log(`=> ${constructUrl('/review-demo')}`);
  });
});

commander.command('upload [<triggeredByUrl>]').action(
  (triggeredByUrl) => {
    uploadLastResult(triggeredByUrl)
      .then((url) => {
        if (url) {
          console.log(url);
        }
      })
      .catch(logAndExit);
  });

commander.command('upload-test').action(() => {
  const uploader = config.uploader();
  uploader.prepare()
    .then(() => {
      uploader.upload({
        body: 'Generated by `happo upload-test`',
        contentType: 'text/plain',
        contentEncoding: 'utf-8',
        fileName: `${crypto.randomBytes(16).toString('hex')}.txt`,
      }).then((url) => {
        console.log(url);
      });
    }).catch(logAndExit);
});

module.exports = function cli(argv) {
  commander.parse(argv);
  if (!argv.slice(2).length) {
    commander.outputHelp();
  }
};

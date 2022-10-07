import S from "./singleton";
import * as Process from "process";
import Utility from "./utility";
import {setValue} from "@wdio/shared-store-service";
import fs from "fs";
import strip from "strip-color";
import path from "path";


class WdioConfHooks {

   constructor() {
      throw new Error('This is a static class');
   }


   static async OnPrepare(config, capabilities) {
      console.log(`process.env.NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}`);
      // make sure the node version is >= 16
      console.log(`DetectedNode version: ${Process.version}`);
      // if using node < 15, then vail
      let nodeVersion = Process.version.split('.');
      nodeVersion = nodeVersion[0].substring(1);
      if (nodeVersion <= 15) {
         console.log(`Node version must be >= 16. Exiting...`);
         await process.exit(1);

      }

      // set path separator for node
      S.getConfig().sep = path.sep;
      let testRunId = await Utility.testRunId();
      await setValue('testRunId', testRunId);
      let testSuiteStartTime = await Utility.timeStamp();
      await setValue('testSuiteStartTime', testSuiteStartTime);

      // create the root folder for all the sessions in the current test run
      let outputDirRoot = `./logs/${testSuiteStartTime}`;
      try {
         if (!fs.existsSync(outputDirRoot)) {
            console.log(`creating outputDirtRoot: ${outputDirRoot}`);
            fs.mkdirSync(outputDirRoot, {recursive: true});
         }
      } catch (err) {
         console.error(err);
      }

      // load the test capability file, if the capabilities are empty
      if (capabilities.length === 0) {
         let testCapabilitiesJson = await S.getConfig().generateTestCapabilitiesJson();
         if (testCapabilitiesJson != null) {
            let testCapabilities = JSON.parse(testCapabilitiesJson);
            for (const element of testCapabilities) {
               capabilities.push(element);
            }
         }
      }

      // hook stdout and stderr to a file
      global.hook_stdout = (callback) => {
         let old_write = process.stdout.write;
         process.stdout.write = (function (write) {
            return function (string, encoding, fd) {
               write.apply(process.stdout, arguments);
               callback(string, encoding, fd);
            };
         })(process.stdout.write);
         return function () {
            process.stdout.write = old_write;
         };
      };

      global.hook_stderr = (callback) => {
         let old_write = process.stderr.write;
         process.stderr.write = (function (write) {
            return function (string, encoding, fd) {
               write.apply(process.stderr, arguments);
               callback(string, encoding, fd);
            };
         })(process.stderr.write);
         return function () {
            process.stderr.write = old_write;
         };
      };

      // eslint-disable-next-line
      global.unhookstdout = global.hook_stdout(function (string, encoding, fd) {
         try {
            let strippedOutput = strip(string.toString());
            fs.writeFileSync(`${outputDirRoot}/stdouterr.txt`, strippedOutput, {flaf: 'a+', encoding: 'utf8'});
         } catch (err) {
            console.error(err);
         }
         ;
      });

      // eslint-disable-next-line
      global.unhookstdout = global.hook_stderr(function (string, encoding, fd) {
         try {
            let strippedOutput = strip(string.toString());
            fs.writeFileSync(`${outputDirRoot}/stdouterr.txt`, strippedOutput, {flaf: 'a+', encoding: 'utf8'});
         } catch (err) {
            console.error(err);
         }
         ;
      });
   }

   // eslint-disable-next-line
   static OnWorkerStart(cid, caps, specs, args, execArgv) {
      console.log(`onWorkerStart: cod = ${cid}, browser = ${caps.browserName}`);
      caps['wdio:cid'] = cid;
   }

   // eslint-disable-next-line
   static async Before(capabilities, specs) {
      // save the capability id into our own config obj
      S.getConfig().cid = capabilities.cid;

      // read from config.json and set baseUrl - this can be handles in the constructor?
      await S.getConfig().loadConfigs();
      // lof what configurations are being used
      await S.getConfig().logConfigs();

      browser.config.outputDir = S.getConfig().outputDir;

      // add focus on element command
      browser.addCommand('focus', async function () {
         await browser.execute(function (domElement) {
            domElement.focus();
         }, this);
      }, true);

      // add scrollIntoView for element command
      browser.addCommand('scrollIntoView', async function (selector) {
         await browser.execute(function (elementSelector) {
            document.querySelector(elementSelector).scrollIntoView({behavior: "smooth"});
         }, selector);
      });
   }

   // eslint-disable-next-line
   static Beforetests(test, context) {
      S.getConfig().test = test;
      let parent = test.parent.replace(/[\W_]+/g, "_");
      if (parent.length > 254) {
         parent = parent.slice(0, 254);
      }
      let title = test.title.replace(/[\W_]+/g, "_");
      if (title.length > 254) {
         parent = title.slice(0, 254);
      }
      S.getConfig().testFolder = `${S.getConfig().outputDir}${parent}/${title}/`;
      S.getConfig().logTest();

   }


}

export default WdioConfHooks;
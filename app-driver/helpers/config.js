import fs from 'fs';
import {getValue} from '@wdio/shared-store-service';
import nconf from 'nconf';
import winston from 'winston';
import {Log} from '../logger';
import Utility from './utility';


/* global console, browser */
class Config {
   constructor() {
      this.log = new Log();
      this.apiCalls = [];

      nconf.argv()
         .env()
         .file({file: './config.json'});

      // to manually set variables
      // nconf.set('database:host', '127.0.0.1');
      // nconf.set('database:port', 5984);

      this.appBaseUrl = null;
      this.cmsBaseUrl = null;

      this.user1 = null;
      this.password1 = null;

      this.test = null;
      this.testSuiteStartTime = null;
      this.localIpAddress = Utility.getIpAddress();
      this.testRunId = null;
      this.outputDirRoot = null; // holds the specific root
      this.outputDir = null; // holds the specific cid-browser folder including root
      this.testFolder = null; // holds the specific IT in parent(describe)/title(it) with root
      this.cid = null;
      this.testCapabilitiesFile = nconf.get('testCapabilities');
      this.testCapabilitiesJson = this.generateTestCapabilitiesJson();

      this.sep = null;
   }

   async generateTestCapabilitiesJson() {
      let testCapabilitiesJson = null;
      try {
         testCapabilitiesJson = fs.readFileSync(`./test-capabilities/${this.testCapabilitiesFile}`, 'utf8', (err, data) => {
            if (err) {
               console.error(err);
               return err.toString();
            }
            console.log(`data: ${data}`);
            return testCapabilitiesJson;
         });
      } catch (err) {
         console.error(err);
         return testCapabilitiesJson;
      }
      return testCapabilitiesJson;
   }

   async finalizeConfig() {
      this.env = nconf.get('ENV');

      this.appBaseUrl = nconf.get('appBaseUrl');

      this.user1 = nconf.get('user1');
      this.password1 = nconf.get('password1');

      if (this.password1.toUpperCase() === 'SECRET') {
         // then get password1 from some online vault
      }
   }

   async loadConfigs() {
      this.testRunId = await getValue('testRunId');
      this.testSuiteStartTime = await getValue('testSuiteStartTime');
      this.cid = browser.options.capabilities['wdio:cid'];
      this.outputDirRoot = `./logs/${this.testSuiteStartTime}/`;
      this.outputDir = `./logs/${this.testSuiteStartTime}/${this.cid}_${browser.capabilities.browserName}/`;
      // create outputDir folder in ./logs/
      try {
         if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, {recursive: true});
         }
         await this.log.info(`created ${this.outputDir}`);
      } catch (error) {
         await this.log.info(error.message);
      }
      // need to append the file transport to winston here
      const logFile = new winston.transports.File({filename: `${this.outputDir}/${this.testSuiteStartTime}_${this.cid}.log`});
      await this.log.AddTransport(logFile);

      switch (nconf.get('ENV')) {
         case 'LOCAL':
            await nconf.set('appBaseUrl', nconf.get('URLS:LOCAL:APP_URL'));
            await this.finalizeConfig();
            break;
         case 'LOCAL_DOCKER':
            await nconf.set('appBaseUrl', nconf.get('URLS:LOCAL_DOCKER:APP_URL'));
            await this.finalizeConfig();
            break;
         case 'DEV':
            await nconf.set('appBaseUrl', nconf.get('URLS:DEV:APP_URL'));
            await this.finalizeConfig();
            break;
         case 'QA1':
            await nconf.set('appBaseUrl', nconf.get('URLS:QA1:APP_URL'));
            await this.finalizeConfig();
            break;
         case 'PROD':
            await nconf.set('appBaseUrl', nconf.get('URLS:PROD:APP_URL'));
            await this.finalizeConfig();
            break;
         default:
      }
   }

   async logConfigs() {
      await this.log.info('-------------------starting config log -------------------');
      await this.log.info(`environment:            ${this.env}`);
      await this.log.info(`appBaseUrl:             ${this.appBaseUrl}`);
      await this.log.info(`user1:                  ${this.user1}`);
      await this.log.info('password1:              *****hidden*****');
      await this.log.info(`testSuiteStartTime:     ${this.testSuiteStartTime}`);
      await this.log.info(`localIpAddress:         ${this.localIpAddress}`);
      await this.log.info(`testRunId:              ${this.testRunId}`);
      await this.log.info(`outputDir:              ${this.outputDir}`);
      await this.log.info(`cid:                    ${this.cid}`);
      await this.log.info(`browserName:            ${browser.capabilities.browserName}`);
      await this.log.info(`browserVersion:         ${browser.capabilities.browserVersion}`);
      await this.log.info(`platformName:           ${browser.capabilities.platformName}`);
      await this.log.info(`capabilities:           ${JSON.stringify(browser.capabilities)}`);
      await this.log.info('-------------------ending config log ---------------------');
   }

   async logTest() {
      await this.log.info('-------------------starting test config log --------------');
      await this.log.info(`testParentTitle:  ${this.test.parent}`);
      await this.log.info(`testTitle:        ${this.test.title}`);
      await this.log.info(`testFile:         ${this.test.file}`);
      await this.log.info('-------------------ending test config log ----------------');
   }
}

export default Config;

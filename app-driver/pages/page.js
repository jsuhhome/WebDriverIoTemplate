import fs from 'fs';
import S from '../helpers/singleton';
import Utility from '../helpers/utility';
import DevTools from "../helpers/dev-tools";

/* global browser, $$, document */
/**
 * main page object containing all methods, selectors and functionality
 * that is shared across all page objects
 */
class Page {
   constructor() {
      this.log = S.getConfig().log;
      this.events = [];
   }

   // this will take a promise 'parentDiv', await it, then return the subelement using the selector
   async getSubElement(parentDiv, selector) {
      return (await parentDiv).$(selector);
   }

   /**
    * generalized click method
    *
    */
   async click(element) {
      let aElement = await element;
      await this.waitForExist(aElement);
      await this.log.info(`clicking: ${aElement.selector}`);
      await aElement.click();
   }

   /**
    * Wait for element to exist then click
    *
    */
   async waitAndClick(element, timeout = 30) {
      let aElement = await element;
      try {
         await aElement.waitForClickable({timeout: timeout * 1000});
      } catch (error) {
         await this.log.info(`element was not clickable: ${error}`);
      }
      await this.click(aElement);
   }

   async InputCtrlADelete(element) {
      await this.waitForPageLoad();
      await element.focus();
      // ctrl-a (select all) and click delete
      await browser.keys(['Meta', 'A']); // select all using command/ctrl and 'A' key. this may need to be changed based on os.
      await browser.keys(['\uE05D']); // // 'META' \uE053 == 'Delete' key
   }

   /**
    * Input text
    * clear : if true, clears the textbox before starting input
    * logText : should be set to false for sensitive text like passwords that we don't want to log
    * delayBetweenKeys : delay in milliseconds between character entries
    */
   async InputText(textBxElement, text, options) {
      const mergedOptions = Object.assign({clear: false, logText: true, delayBetweenKeys: 0}, options);
      textBxElement = await textBxElement;
      await this.waitForPageLoad();

      // this line must exist if we want to use template strings like `here is a ${var}`
      // let evaluatedText = text;
      if (mergedOptions.logText) {
         await this.log.info(`entering: ${text}`);
      } else {
         await this.log.info('entering: *****hidden*****');
      }
      if (mergedOptions.clear) {
         if (!((await textBxElement.getValue()) === '')) {
            await textBxElement.clearValue();
         }
      }
      await textBxElement.waitForClickable({timeout: 30000});
      await this.click(textBxElement);
      if (mergedOptions.delayBetweenKeys === 0) {
         await browser.keys(text);
      } else {
         for (let i = 0; i < text.length; i++) {
            await browser.keys(text.charAt(i));
            await browser.pause(mergedOptions.delayBetweenKeys);
         }
      }
   }

   async PressEnter() {
      await this.log.info('pressing enter key');
      // 'Enter' jey = \uE007
      await browser.keys('\uE007');
   }

   async InputTextThenEnter(textBxElement, text, options) {
      await this.InputText(textBxElement, text, options);
      await this.click(textBxElement);
      await this.PressEnter();
   }

   async InputAceEditorText(textAreaElement, text, options) {
      const mergedOptions = Object.assign({logText: true, append: true, delayBetweenKeys: 0}, options);
      await this.waitForPageLoad();
      if (mergedOptions.logText) {
         await this.log.info(`entering: ${text}`);
      } else {
         await this.log.info('entering: *****hidden*****');
      }
      await textAreaElement.waitForEnabled(5000);
      await textAreaElement.focus();
      await this.log.info(`x :  ${await textAreaElement.getLocation('x')}`);
      await this.log.info(`y :  ${await textAreaElement.getLocation('y')}`);

      // if we are not appending, ctrl-a (select all) and click delete
      // 'META' \uE053
      if (mergedOptions.append === false) {
         await browser.keys(['Meta', 'A']); // select all using command/ctrl and 'A' key. this may need to be changed based on os.
         await browser.keys(['\uE05D']); // 'Delete' key
      }
      await browser.keys(text);
   }

   /**
    * generalized get tag count method
    *
    */
   async getTagCount(TagName) {
      let elements = await $$(TagName);
      return elements.length;
   }

   /**
    * given a selector for an array of parent elements,
    * this will return the specific parent element where the text for a specific
    * child selector within that parent element matches the 'matchingText'.
    *
    * parentsElementSelector : selector of parent
    * childSelector : selector of child. if null, then it will match on text of parent element
    * matchingText : text to match against
    * matchExact : should the matchingText be contained (true) or should the match be exact (false)?
    * isLogged : log extra information for debugging purposes
    */
   async FindChildElement(
      parentsElementSelector,
      childSelector,
      matchingText = null,
      matchExact = false,
      isLogged = false
   ) {
      if ((!matchingText) || !(typeof matchingText === 'string')) {
         throw '"matchingText" needs to be specified!';
      }
      if (typeof parentsElementSelector === 'string') {
         // get all matching parent elements
         return this.FindChildElementByArray(await $$(parentsElementSelector), childSelector, matchingText, matchExact, isLogged);
      }
      if (Array.isArray(parentsElementSelector)) {
         return this.FindChildElementByArray(parentsElementSelector, childSelector, matchingText, matchExact, isLogged);
      }
      throw new Error('"parentsSelector" must be a string/selector or an array of elements!');
   }

   async FindChildElementByArray(
      parentElements,
      childSelector,
      containingText = null,
      matchExact = false,
      isLogged = false
   ) {
      parentElements = await parentElements;
      let iteration = 0; // this is just in case of exception, we can log what iteration the catch happens in
      try {
         // loop through all parent elements until a match is found for the subElement
         for (let i = 0; i < parentElements.length; i++) {
            iteration = i;
            let subElementText = null;
            if (!childSelector) {
               subElementText = await parentElements[i].getText();
               if (isLogged) {
                  await this.log.info(`subElementText (no childSelector) (i:${i}) --> ${subElementText}`);
               }
            } else {
               let subElement = null;
               subElement = await parentElements[i].$(childSelector);
               if (typeof subElement.elementId !== 'undefined') {
                  subElementText = await subElement.getText();
                  if (isLogged) {
                     await this.log.info(`subElementText (i:${i}) --> ${subElementText}`);
                  }
               } else {
                  await this.log.info(`subElement (i:${i}) --> (${childSelector}) not found in: ${await parentElements[i].getHTML()}`);
                  subElementText = '';
               }
            }
            if (matchExact) {
               if (subElementText === containingText) {
                  return parentElements[i];
               }
            } else if (subElementText.includes(containingText)) {
               return parentElements[i];
            }
         }
      } catch (error) {
         await this.log.info(`iteration(i): ${iteration} | exception: ${error}`);
      }
      return null;
   }

   /**
    * Wait for page document to be loaded
    * logText : any additional info to show after the page loads
    * delay : have an artifical delay in ms
    */
   async waitForPageLoad(logText = '', delay = 0) {
      await browser.pause(delay);
      await browser.waitUntil(
         async () => await browser.execute(() => document.readyState === 'complete'),
         {
            timeout: 60 * 1000, // 60 secs
            timeoutMsg: 'page load timed out...'
         }
      );
      await this.log.info(`${this.constructor.name} page loaded---------------------- ${logText}`);
   }

   /**
    * Wait for url to be loaded
    *
    */
   async waitForUrl(expectedUrl) {
      await this.log.info(`waiting for url: ${expectedUrl}`);
      await browser.waitUntil(
         async () => (await browser.getUrl()) === expectedUrl,
         {
            timeout: 60 * 1000, // 60 secs
            interval: 500,
            timeoutMsg: 'expected Url never loaded...'
         }
      );
      await this.log.info(`${this.constructor.name} page loaded----------------------`);
   }

   /**
    * Wait for element to exist in page
    * it will return true if element is found, otherwise false
    */
   async waitForExist(element, timeout = 30) {
      element = await element;

      let status;
      try {
         await browser.waitUntil(
            async () => (await element.isExisting()) === true,
            {
               timeout: timeout * 1000,
               timeoutMsg: 'element still does not exist...'
            }
         );
         await this.log.info(`waitForExist finished: ${element.selector}`);
      } catch (error) {
         status = false;
         await this.log.info(`waitForExist element not found: ${await element.selector}`);
      }
      return status;
   }


   /**
    * Opens a sub page of the page
    * @param path path of the sub page (e.g. /path/to/page.html)
    * `./${path}`
    */
   async open(path) {
      await this.waitForPageLoad();
      await this.log.info(`Navigating to : ${path}`);
      return (await browser.url(path));
   }

   async saveScreen(screenName, delay = null) {
      if (delay) {
         await browser.pause(delay);
      }
      // need to save logs and screenshots based on timestamp
      let fileName = `${Utility.timeStamp()}_${screenName}.png`;
      // get test file name and location after /tests/specs/
      // and use that as the folder after ./logs/
      // check for existing dir and if it doesn't exist, create it based on timestamp
      // let screenShotPath = `${S.getConfig().outputDir}${endPartFilePath}/${S.getConfig().testFolder}/`;
      let screenShotPath = `${S.getConfig().testFolder}`;

      try {
         if (!fs.existsSync(screenShotPath)) {
            fs.mkdirSync(screenShotPath, {recursive: true});
         }
         await browser.saveScreenshot(screenShotPath + fileName);
         await this.log.info(`saved ${screenShotPath}${fileName}`);
      } catch (error) {
         await this.log.info(error.message);
      }
   }

   async saveConsoleEventsStart(delay = 0) {
      await browser.pause(delay);
      // attach to the events
      await DevTools.AttachListeners(this.events, this.log);
   }

   async saveConsoleEventsEnd(delay = 0) {
      await browser.pause(delay);
      // save the events
      for (let i = 0; i < this.events.length; i++) {
         await this.log.info(`${i + 1}: ${this.events[i]}`);
      }
   }

   async startApiCapture() {
      await browser.setupInterceptor();
   }

   async getCmsApiFormPayload(index) {
      let allRequests = await browser.getRequest();
      let cmsApiRequests = allRequests.find((element) => element.url.includes('cms-api'));
      if (Array.isArray(cmsApiRequests)) {
         return cmsApiRequests[index];
      }
      return cmsApiRequests;
   }
}

export default Page;

# Sample Webdriverio template


## Features
* A config.json file that holds all settings/configuration for that specific test run. You would want Jenkins to edit this file before execution.
* A test-capabilities folder that holds all the various browser capabilities to inject into the wdio.conf.js file. This is also where you can specify test spec files to run.
* A devtools helper class that can capture api calls using cdp protocol.
* An example way to organize your page objects.
* A logger system that keeps logs separate on a per worker thread.
* uses nconf to allow test runs to override env variable via the command line

## Install & Setup

### General instructions

#### Repo setup
1. make sure to install and run node version >= 16.
2. run `yarn install` or `npm i`
3. you may want to use NVM (node version manager)
   setup instructions at `https://github.com/coreybutler/nvm-windows/releases/latest`

#### Configure config.json

This is where to store config data

1. You can store usernames/passwords. Ideally, passwords should instead be retrieved via some vault.
2. Any of these config fields can be overridden in the command line --user1 USER1 --password1 PASSWORD1. This will take precedence over the values stored in config.json.
3. Configure the "ENV" to LOCAL/LOCAL_DOCKER/DEV/QA1/PROD.

### Webstorm
Add a debug configuration
1. Open run/debug configuration dialog box via  'run' menu --> 'edit configurations...'
2. Click '+' and choose 'Nodes.js'
3. Enter a name, i.e. 'My Debug Node'
4. Select the node interpreter executable, i.e. `/usr/local/bin/node`
5. Select the working directory. This should be the main folder that holds the repo.
6. Select the javascript file for Node to execute, i.e. `node_modules/@wdio/cli/bin/wdio.js`
7. Enter in application parameters, i.e. `./wdio.conf.js --spec ./test/specs/gmail-tests.js --user1 <some username> --password1 <some password>`
8. This should be enough to run and debug.

### Visual Studio Code
1. Some tips are at `https://webdriver.io/docs/debugging/#debugging-with-visual-studio-code-vscode`
2. Debug by hover over the npm script (in package.json) name and in the popup, you should see 'run script' and 'debug script'. Click 'Debug Script'

### Writing a test (General outline)
1. Create a spec file under ./tests/specs
2. Write a series of function calls in the format of (YourNewPage).(YourNewPageAction)(actionOptions)
3. These series of functions calls should be high level and easy to read/understand
4. There should be no or very little complex logic and this layer. All for loops/if-then-else logic should be handled at the page object layer
5. Write out the page object and implement all the actions written out in step 2 above.

### Upgrading Chromedriver
As new versions of chrome, you will also have to upgrade the chromedriver.
`npm install chromedriver@latest`.  If using selenium grid, make sure to also upgrade the containers such as `selenium/node-chrome` to the relevant tag.

### Running Eslint
1. run `npx eslint './**/*.js'`

## Executing Tests

### Make sure to configure config.json described above

### Running from the Command line
running tests via command line

`<path to local node executable> <path to node_modules/@wdio/cli/bin/wdio.js> ./<wdio conf file> --spec ./<path to spec file> --user1 <user name> --password1 <password> --some_env_variable_name=<some value>`

i.e. `/usr/local/bin/node /<path to folder>/inception-tests/node_modules/@wdio/cli/bin/wdio.js ./wdio.conf.js --spec ./test/specs/gmail-tests.js --user1 <user name> --password1 <password>`

These variables (`--user1 <username> --password1 <password>`) will take precedence over the user1/password1 set in config.json

running tests via npm

`npm run localChrome_D:dev` will run the npm script in package.json


### Configuring to run tests on local machine's browser using the various browser driver services. 
**note: For now, the only way to run tests in Safari (assuming you are also on a MAC)**
1. The specific service ('safaridriver', etc...) should be added to wdio.conf.js under services. The corresponding npm package should also have been installed. Each capability will be executed. 
2. i.e. 3 capabilities x 3 maxInstances x 5 specs = 9 workers. If maxInstances = 10, then it would 15 workers.

- https://www.npmjs.com/package/wdio-chromedriver-service or yarn add wdio-chromedriver-service
- https://www.npmjs.com/package/wdio-safaridriver-service 
- https://www.npmjs.com/package/wdio-geckodriver-service
- https://www.npmjs.com/package/wdio-edgedriver-service
```  
file: wdio.conf.js

      services:[
               'chromedriver',
               'safaridriver',
               'geckodriver'
      ]
```
2. Then add the capability for the named service in wdio.conf.js under capabilities. Each capability will be executed.
```
file: wdio.conf.js

    capabilities: [{
        maxInstances: 2,
        browserName: 'chrome',
        acceptInsecureCerts: true,
    }]
```
3. a mobile version example using Nexus 5 screen size
```
file: wdio.conf.js
    const mobile_emulation = { "deviceName": "Nexus 5" } // outside the config obj
    
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome',
        acceptInsecureCerts: true,
        'goog:chromeOptions': {
            mobileEmulation: mobile_emulation
        }
    }]
```
4. a safari browser capability
```
file: wdio.conf.js
    
    capabilities: [{
       // "safaridriver --enable" must be run on your computer before you can use this driver.
       maxInstances: 1, // safari driver can only handle max of 1 instance
       browserName: 'safari',
       acceptInsecureCerts: true,
    }]
```
#### Alternatively, the capabilities can be places in a separate file in directory `./test-capabilities/`

Specify the file in config.json (`i.e. "testCapabilities" : "chrome-mobile-test.json"`).  The capabilities are listed as an array of capability json objects. This file is then read from OnPrepare() in the wdio.conf.js and injected into the capabilities object (but only injected if the capabilities are empty in wdio.conf.js). 


### Configuring to run tests on local machine's browser using standalone selenium
- https://github.com/webdriverio/selenium-standalone
- https://www.npmjs.com/package/selenium-standalone

### Configuring to run tests in containers using selenium grid 4
- https://www.selenium.dev/documentation/grid/
#### Docker Selenium Grid
- https://github.com/SeleniumHQ/docker-selenium
1. with docker service on your machine started, run the various docker-compose commands to start/stop the selenium grid.
   1. i.e.`docker-compose -f selenium-grid-3.yml up` to create the container network with selenium hub and nodes
   2. or `docker-compose -f selenium-grid-3.yml down` to bring network and containers down
2. View the state of the selenium grid at http://localhost:4444
   1. Configure wdio.conf.js to include the following fields at top level config object
      ```
      config object:
      
         hostname: 'localhost', \\ hostname of where the selenium hub is
         port: 4444, \\ port of selenium hub
         path: '/',
      
         .
         .
         .
      
         // comment out the various drivers in service
         services: ['shared-store', 'devtools', 'intercept',
               // 'chromedriver',
               // 'safaridriver',
               // 'geckodriver',
      
      ```
3. Start running tests on `http://localhost:4444`. Click on "Sessions" on the left pane and then click on the camera icon to view the live view.
   1. `http://localhost:4444/ui/index.html#/sessions`
4. Use the Video containers (uncomment them and create unique ids in .yml) to have video recording containers up.


### Log files
1. logs are written per worker thread in format `./logs/YYYYDDMM_HHMMSS/{worker-thread-id}_{browserName}/YYYYDDMM_HHMMSS_{worker-thread-id}.log`
2. the entire (at least 99%) of console output is captured in stdouterr.txt

### Reporting Test Results using Allure
- https://webdriver.io/docs/allure-reporter
- https://docs.qameta.io/allure/
1. After the tests are run, the results are placed in ./allure-results as *.xml files. Each xml file corresponds to 1 spec file
   1. To view the results, from root directory, use `allure serve ./allure-results`
   2. This will start a webserver with a webpage for the results
2. To generate the report website (not sure how this is different from (1) above), from root directory, use `allure generate` or `allure generate --clean`
   1. This will generate the website in `./allure-reports`
   2. right click ./allure-report/index.html and run it (from webstorm) or another web server. 

---


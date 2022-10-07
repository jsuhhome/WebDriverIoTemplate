### CSS selectors
1. direct child:
div > a

2. descendant child:
div a

3. attribute values:
input[name="continue"][type="button"]

4. substring that starts:
a[id^="beginning_"]

5. substring that contains:
a[id*="middle"]

6. substring that ends with:
a[id$="_ends"]

7. inner text
a:contains('log out')

8. chaining selectors
$('.row .entry:nth-child(2)').$('button*=Add').click()

### Xpath Selectors
1. //button[text()='BUY NOW']
2. //button[contains(text(),'BUY NOW')]


### Steps to view element in chrome devtools that require a hover
1. Hover or click element to reveal desired element(s).
2. Press F8. This will freeze the UI in the browser window until you click again.
3. In the elements tab, use your mouse to hover over the various element text until the desired element(s) are shown.
3.1. If the elements tab if the element is collapse, right click the triangle and click 'expand recursively' and it will expand the child elements.
4. for elements that disappear, you can also 'break' on 'subtree modification'. Go step by step until you see the elements appear.

### Debug
1. use browser.debug() command. This will pause the execution and you can try $('div') and test out your selectors.
2. use this.log.info(`x: ${x}`) to view the state of the variables.
3. make sure to set time out in wdio.conf.js under mochaOpts -> timeout to a high value. i.e. 9999999

### Session \ locaStorage clearing
let result = await browser.execute(() => window.localStorage.clear()
); // clear local storage
let result2 = await browser.execute(() => window.sessionStorage.clear()
); // clear local storage

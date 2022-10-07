import LoginGmailPage from '../../app-driver/pages/login.gmail.page';
import S from "../../app-driver/helpers/singleton";

/* global browser, describe, it, expect */
describe('login to gmail', () => {
   it('Verify gmail login page shows privacy link', async () => {
      // go to gmail login page
      await LoginGmailPage.GoTo();
      await browser.pause(1000);
      await LoginGmailPage.saveScreen(`gmail username login`);

      // verify foot text is correct
      expect(await LoginGmailPage.getPrivacy()).toHaveTextContaining(
         'Privacy'
      );
   }, 2);

   // it('Verify correct username and password logs you in', async () => {
   //    // go to home page
   //    await LoginGmailPage.GoTo();
   //    await browser.pause(500);
   //    await LoginGmailPage.saveScreen('homePage');
   //    // click sign in
   //    // await LoginGmailPage.waitAndClick(LoginGmailPage.btnSignIn);
   //    await LoginGmailPage.enterEmailAndNext(S.getConfig().user1);
   //    await LoginGmailPage.enterEmailAndNext(S.getConfig().password1);
   //    await browser.pause(1000);
   //
   // }, 2);
});

import Singleton from '../helpers/singleton';
import Page from "./page";

/* global $ */
/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoginGmailPage extends Page {
   /**
    * define selectors using getter methods
    */
   get privacy() {
      return $('a[href^="https://accounts.google.com/TOS"]');
   }

   get btnSignIn() {
      return $('a[data-action="sign in"]');
   }

   get txtBxEmailOrPhone() {
      return $('input[type="email"][aria-label="Email or phone"]');
   }

   get txtBxPassword() {
      return $('input[type="password"][aria-label="Enter your password"]');
   }


   /**
    * a method to encapsule automation code to interact with the page
    * e.g. to login using username and password
    */
   async getPrivacy() {
      await this.waitForPageLoad();
      let text = await this.privacy.getText();
      await this.log.info(`privacy text is : ${text}`);
      return text;
   }

   async enterEmailAndNext(emailOrPhone) {
      await this.waitAndClick(this.txtBxEmailOrPhone);
      await this.InputTextThenEnter(this.txtBxEmailOrPhone, emailOrPhone);
   }

   async enterPassword(password) {
      await this.waitAndClick(this.txtBxPassword);
      await this.InputTextThenEnter(this.txtBxPassword, password);
   }

   /**
    * overwrite specific options to adapt it to page object
    */
   async GoTo() {
      return super.open(Singleton.getConfig().appBaseUrl);
   }
}

export default new LoginGmailPage();

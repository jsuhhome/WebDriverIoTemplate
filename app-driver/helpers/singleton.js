import Config from './config';

class Singleton {
   static #configInstance = null;

   constructor() {
      throw new Error('Use Singleton.getXXXXXX()');
   }

   static getConfig() {
      if (Singleton.configInstance) {
         return Singleton.configInstance;
      }
      Singleton.configInstance = new Config();
      return Singleton.configInstance;
   }
}

export default Singleton;

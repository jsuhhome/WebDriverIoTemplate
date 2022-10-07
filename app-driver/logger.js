const winston = require('winston');
/* global Intl, process, module */
const {combine, timestamp} = winston.format;

class Log {
   constructor() {
      const timeZone = () => {
         let currentDate = new Date();
         let formatter = new Intl.DateTimeFormat('en-us', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            fractionalSecondDigits: 3,
            hour12: false,
            timeZone: 'America/Chicago'
         });
         return formatter.format(currentDate);
      };

      this.myFormat = winston.format.printf(({level, message, timestamp}) => (`${timestamp} - ${level}: ${message}`));

      this.logger = winston.createLogger({
         level: process.env.LOG_LEVEL || 'info',
         format: combine(
            timestamp({format: timeZone}),
            this.myFormat
         ),
         transports: [
            new winston.transports.Console()
         ],
      });
   }

   // most severe and lowest level
   error(errorText) {
      this.logger.log({level: 'error', message: errorText});
   }

   warn(warnText) {
      this.logger.log({level: 'warn', message: warnText});
   }

   info(infoText) {
      this.logger.log({level: 'info', message: infoText});
   }

   debug(debugText) {
      this.logger.log({level: 'debug', message: debugText});
   }

   AddTransport(logFile) {
      this.logger.add(logFile);
   }
}

module.exports = {
   Log
};

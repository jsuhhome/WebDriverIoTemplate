import {networkInterfaces} from 'os';
import {parse, TextNode} from 'node-html-parser';


class Utility {
   constructor() {
      throw new Error('This is a static class');
   }

   static timeStamp() {
      let currentDate = new Date();
      let timeDate = `${currentDate.getFullYear().toString()
      + (currentDate.getMonth() + 1).toString().padStart(2, '0')
      + currentDate.getDate().toString().padStart(2, '0')}_${currentDate.getHours().toString().padStart(2, '0')
      }${currentDate.getMinutes().toString().padStart(2, '0')
      }${currentDate.getSeconds().toString().padStart(2, '0')}`;
      return timeDate;
   }

   /*
     *   Generates a unique id for this test run.
     *   Can be used to append to data so that the data is unique across all tests being run.
     *
     * */
   static testRunId() {
      // get seconds since Jan 1st, 2022. Convert to base 36 to shrink size.
      // get local ip address. Convert to base 36.
      // then concatenate both these and this will be ths testRunId
      // this should be unique for every test run

      let secondsSinceJan1st2022 = Math.floor(Math.abs(new Date('01/01/2022 12:00 AM') - new Date()) / 1000);
      let ipV4 = this.getIpAddress();
      let parts = ipV4.split('.');
      // let partsBin = new Array(4);
      let partsHex = new Array(4);
      for (let i = 0; i < parts.length; i++) {
         // partsBin[i] = parseInt(parts[i]).toString(2).padStart(8, '0');//.toString().padStart(8, '0');
         partsHex[i] = parseInt(parts[i]).toString(16).padStart(2, '0');
      }
      // let binaryIPv4 = partsBin[0] + partsBin[1] + partsBin[2] + partsBin[3];
      // let convertedBin = parseInt(binaryIPv4, 2);
      let hexIPv4 = partsHex[0] + partsHex[1] + partsHex[2] + partsHex[3];
      let convertedHex = parseInt(hexIPv4, 16);

      return secondsSinceJan1st2022.toString(36) + convertedHex.toString(36);
   }

   static getIpAddress() {
      const nets = networkInterfaces();
      const results = Object.create(null); // Or just '{}', an empty object
      let ipv4Address = '';
      try {
         for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
               // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
               if (net.family === 'IPv4' && !net.internal) {
                  if (!results[name]) {
                     results[name] = [];
                  }
                  results[name].push(net.address);
               }
            }
         }
         ipv4Address = results.en0[0];
      } catch (error) {
         return '127.0.0.1';
      }
      return (ipv4Address === '' ? '127.0.0.1' : ipv4Address);
   }

   static GetTxtWithoutChildElements(html) {
      let root = parse(html);
      let final = '';
      let current = null;
      let totalChildren = root.childNodes.length;
      for (let i = 0; i < totalChildren; i++) {
         current = root.firstChild;
         if (current instanceof TextNode) {
            // then get the text
            final = final + current.rawText + '||';
         }
         root = root.removeChild(current);
      }
      return final;
   }


   static removeHTML(html) {
      if ((html === null) || (html === '')) {
         return false;
      }
      html = html.toString();
      return html.replace(/(<([^>]+)>)/ig, '');
   }

   static GetParam(url, paramId, log = null) {
      let index = url.indexOf('?');
      if (index === -1) {
         throw Error('no query string found.');
      }
      let queryString = url.substring(index);
      const params = new URLSearchParams(queryString);
      if (log !== null) {
         log.info(`queryString: ${queryString} | params: ${params.get(paramId)}`);
      }
      return params.get(paramId);
   }

}

export default Utility;

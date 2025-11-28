"use strict"

import "dotenv/config"
import { generateLockerImage } from "./generateLocker.js";

const accesToken = ""
const accountid = ""
const type = "all" //you can chose different types

if (!accestoken ?? accountid) {

console.error("set the credentials in the top of the js");
process.exit(1);
}

generateLockerImage({ accesToken, accountId, type, savePath: ''/*chose a path to save the image like ./images*/})
    .then(result => {
        if (result.success) {
            console.log('succes')
            process.exit(0);
        } else {
            console.error('error');
            process.exit(1);
        }
    })
    .catch(() => {
        console.error('❌ peneDeMono ❌') //fatal error
        process.exit(1);
    }
    );





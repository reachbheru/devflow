export class Validator {
  jsonValidator(jsObject) {
  try {
    if (typeof jsObject === "object" && jsObject !== null) {
      for (const value of Object.values(jsObject)) {
        if (typeof value === "object" && value !== null) {
          if (!this.jsonValidator(value)) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

  // jsonValidator(jsObject) {
  //   try {
  //     if (
  //       typeof jsObject === "object" &&
  //       jsObject !== null &&
  //       !Array.isArray(jsObject) &&
  //       Object.keys(jsObject).length !== 0
  //     ) {
  //       for(const value of Object.values(jsObject)){
  //         if(typeof value === "object"){
  //           if(!this.jsonValidator(value)){
  //             return false;
  //           }
  //         }
  //       };
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     return false;
  //   }
  // }
}

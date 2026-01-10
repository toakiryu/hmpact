
const logger = {
  info: (message?: any, ...optionalParams: any[]) => {
    console.log(message, ...optionalParams);
  },
  warn: (message?: any, ...optionalParams: any[]) => {
    console.warn(message, ...optionalParams);
  },
  error: (message?: any, ...optionalParams: any[]) => {
    console.error(message, ...optionalParams);
  },
  debug: (message?: any, ...optionalParams: any[]) => {
    if (process.env.hmpact_DEBUG === "true") {
      console.debug(message, ...optionalParams);
    }
  },
};

export default logger;

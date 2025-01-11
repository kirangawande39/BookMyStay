class ExpressError extends Error{
    constructor(statusCode, ErrorMsg){
        super();
        this.statusCode=statusCode;
        this.ErrorMsg=ErrorMsg;
    }
}

module.exports=ExpressError;
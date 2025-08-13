// validate request middleware
export const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); 
    if (error) {
        return res.status(400).json({ success: false, message: "❌ Validation error", errors: error.details.map((d) => d.message) }); 
    }
    next();
};


export const validateRequestFormat = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

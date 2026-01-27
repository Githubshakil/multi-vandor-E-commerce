const validate = (schema) => async (req, res, next) => {

    try {
        await schema.parseAsync(req.body)
        next()
    } catch (error) {
        
        if (error instanceof z.ZodError) {
            const formattedErrors = error.errors.map(err=>({
                    field: err.path.join('_'),
                    message: err.message
            }))

            return res.status(400).json({
                success: false,
                message: "Validation errors",
                errors: formattedErrors
            })
        }

        next(error)
    }
}

module.exports = validate
    

/**
 * Form Validations - 
 * when we enter data in the form,
 * the browser and/or the web server will 
 * check to see that the data is in the correct format
 * and within the contrainst set by the applications.
 */

const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.object({
            filename: Joi.string().allow("", null),
            url: Joi.string().allow("", null),
        }), // Ensure image is required as it's an object,
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});
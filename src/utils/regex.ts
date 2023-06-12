export const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g

/**
 * Must start with a letter
 * Can contain uppercase, lowercase characters and digits
 * Can contain hyphens
 * Must be between 2 and 16 characters long
 */
export const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/

/**
 * Must contain one uppercase character
 * Must contain one lowercase character
 * Must contain one digit
 * Can contain special characters
 * Must be at least 8 characters
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\S]{8,}$/

// Support unicode characters
export const NAME_REGEX = /^[\p{L}'-]{1,50}$/u

export const INVENTORY_NAME_REGEX = /^[a-zA-Z][a-z-A-Z0-9\s]{, 29}/
require('colors');

/**
 * Store custom error strings with the HTML Response code associated
 * It's not meant to be instantiated since its unique method is static as well
 */
class ErrorUtility {
  // User errors
  /**
   * The user was not found in the database
   */
  static get USER_NOT_FOUND() {
    return {
      statusCode: 404,
      message: 'User not found',
    };
  }

  /**
   * The user was not found in the database
   */
  static get STATS_NOT_FOUND() {
    return {
      statusCode: 404,
      message: 'Statistics not found',
    };
  }

  /**
   * The login information provided are not correct
   */
  static get WRONG_CREDENTIALS() {
    return {
      statusCode: 401,
      message: 'Authentication error.',
    };
  }

  /**
   * The password set for the registration is too short. passwords must be 6 characters or longer
   */
  static get PASSWORD_TOO_SHORT() {
    return {
      statusCode: 400,
      message: 'Password too short.',
    };
  }

  /**
   * The password set for the registration is too long. passwords must be shorter than 150 character
   */
  static get PASSWORD_TOO_LONG() {
    return {
      statusCode: 400,
      message: 'Password too long.',
    };
  }

  /**
   * Users have restrictions of what operations they can do based on their role.
   */
  static WRONG_ROLE(role) {
    return {
      statusCode: 401,
      message: `A user with your role (${role}) cannot access this feature.`,
    };
  }

  /**
   * The provided role is not expected (invalid or does not exist)
   */
  static get UNEXPECTED_ROLE() {
    return {
      statusCode: 400,
      message: 'The role you provided is not valid.',
    };
  }

  /**
   * The user cannot be cancelled since its assigned to a table!
   */
  static get USER_ASSIGNED_TO_TABLE() {
    return {
      statusCode: 400,
      message: 'This user is currently assigned to a table as a waiter.',
    };
  }

  /**
   * The user is an admin already
   */
  static get ADMIN_ALREADY() {
    return {
      statusCode: 400,
      message: 'This user is an admin already.',
    };
  }

  /**
   * The provided type is not expected (invalid or does not exist)
   */
  static get UNEXPECTED_TYPE() {
    return {
      statusCode: 400,
      message: 'The type you provided is not valid.',
    };
  }

  // Table errors
  /**
   * The table searched for was not found
   */
  static get TABLE_NOT_FOUND() {
    return {
      statusCode: 404,
      message: 'Table not found',
    };
  }

  /**
   * The table is currently occupied
   */
  static get TABLE_OCCUPIED() {
    return {
      statusCode: 400,
      message: 'The table is occupied',
    };
  }

  /**
   * The table is currently free
   */
  static get TABLE_FREE() {
    return {
      statusCode: 400,
      message: 'The table is free',
    };
  }

  // Order

  /**
   * The given order was not found in the db
   */
  static get ORDER_NOT_FOUND() {
    return {
      statusCode: 404,
      message: 'Order not found',
    };
  }

  /**
   * The order is completed already
   */
  static get ORDER_COMPLETED() {
    return {
      statusCode: 400,
      message: 'This order is completed already',
    };
  }

  /**
   * The given element was not found in the db
   */
  static get ELEMENT_NOT_FOUND() {
    return {
      statusCode: 404,
      message: 'Element not found',
    };
  }

  /**
   * The given element is not of type food
   */
  static get NOT_FOOD() {
    return {
      statusCode: 400,
      message: 'A food element is required',
    };
  }

  /**
   * The given element is not of type beverage
   */
  static get NOT_BEVERAGE() {
    return {
      statusCode: 400,
      message: 'A beverage element is required',
    };
  }

  /**
   * The given element is not of type beverage
   */
  static get ELEMENT_COMPLETED_ALREADY() {
    return {
      statusCode: 400,
      message: 'The element has already been completed',
    };
  }

  /**
   * The provided status is not expected (invalid or does not exist)
   */
  static get UNEXPECTED_STATUS() {
    return {
      statusCode: 400,
      message: 'The status you provided is not valid.',
    };
  }

  // Notification errors
  /**
   * The notification searched for was not found
   */
  static get NOTIFICATION_NOT_FOUND() {
    return {
      statusCode: 404,
      message: 'Notification not found',
    };
  }

  /**
   * The notification searched for is not meant to be accessed by other users.
   */
  static get NOTIFICATION_NOT_YOURS() {
    return {
      statusCode: 401,
      message: 'You can access only your notifications.',
    };
  }

  // Generic errors
  /**
   * The request is missing some required parameters
   */
  static get INCOMPLETE_REQUEST() {
    return {
      statusCode: 400,
      message: 'Missing parameters.',
    };
  }

  /**
   * The id given is not a valid mongoose ObjectId
   */
  static get INVALID_ID() {
    return {
      statusCode: 400,
      message: 'Invalid id.',
    };
  }

  /**
   * The query parameters are not accepted
   */
  static get WRONG_QUERY() {
    return {
      statusCode: 400,
      message: 'The query parameters are not valid.',
    };
  }

  /**
   * The username provided is not valid or it's already in the database
   */
  static get INVALID_USERNAME() {
    return {
      statusCode: 400,
      message: 'The username is already taken or invalid.',
    };
  }

  // Admin errors
  /**
   * The functionality is meant to be used only by admins
   */
  static get ADMIN_RESERVED() {
    return {
      statusCode: 403,
      message: 'You do not have the necessary permissions.',
    };
  }


  // Internal or db errors
  /**
   * Something went wrong on our side!
   */
  static get SERVER_ERROR() {
    return {
      statusCode: 500,
      message: 'Internal Server error!',
    };
  }

  /**
  * Used only in case the error code is wrong/missing
  */
  static get DEFAULT_ERROR() {
    return this.SERVER_ERROR;
  }

  /**
   * Used to create a custom error
   */
  static CUSTOM_ERROR(code, message) {
    return {
      statusCode: code,
      message: message,
    };
  }

  /**
   * Prepare a message to be sent in case of error.
   * If the error name doesn't exist a default one is returned.
   * @param {string} error the name of the error as defined in this class
   */
  static errorMessage(error) {
    if (!error) {
      console.log('[Warning] wrong error code, returning the default error!'.red);
      error = this.DEFAULT_ERROR;
    }
    return {
      statusCode: error.statusCode,
      error: true,
      message: error.message,
    };
  }
}

module.exports = ErrorUtility;

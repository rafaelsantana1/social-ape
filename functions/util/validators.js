const isEmail = (email) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; 
    if(email.match(emailRegEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}


exports.validateSignupData = (newUser) => {
      let errors = {};
      if(isEmpty(newUser.email)){
          errors.email = 'Email must not be empty'
      } else if(!isEmail(newUser.email)){
          errors.email = 'Must be a valid email address'
      }
      if(isEmpty(newUser.password))                       errors.password = 'Password must not be empty'
      if(newUser.confirmPassword !== newUser.password)    errors.confirmPassword = 'Passwords must match'
      if(isEmpty(newUser.handle))                         errors.handle = 'Handle must not be empty'

      return {
          errors,
          valid: Object.keys(errors).length === 0 ? true : false
      }
}

exports.validateLoginData = (data) => {
    let errors = {};
    if (isEmpty(data.email)) errors.email = "Must not be empty";
    if (isEmpty(data.password)) errors.password = "Must not be empty";
    // if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.reduceUserDetails = (data) => {
    let userDetails = {};

    if(!isEmpty(data.bio.trim())) userDetails.bio = data.bio;
    if(!isEmpty(data.website.trim())){
        //https://website.com
        if(data.website.trim().substring(0, 4) !== 'http'){
            userDetails.website = `http://${data.website.trim()}`;
        } else userDetails.website = data.website;
    }
    if(!isEmpty(data.location.trim())) userDetails.location = data.location;

    return userDetails;
}
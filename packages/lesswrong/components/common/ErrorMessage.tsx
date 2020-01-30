import React from 'react';
import { registerComponent } from 'meteor/vulcan:core';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  errorText: {
    color: theme.palette.error.main,
  }
})

const ErrorMessage = ({message, classes}) => {
  return <Typography
    className={classes.errorText}
    align="center"
    variant="body1"
  >
    Error: {message}
  </Typography>
}

const ErrorMessageComponent = registerComponent("ErrorMessage", ErrorMessage, {styles});

declare global {
  interface ComponentTypes {
    ErrorMessage: typeof ErrorMessageComponent
  }
}

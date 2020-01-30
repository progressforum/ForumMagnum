import { registerComponent } from 'meteor/vulcan:core';
import React from 'react';

const styles = theme => ({
  root: {
    height: 150,
  }
});

const Footer = ({classes}) => {
  return (
    <div className={classes.root} />
  )
}

const FooterComponent = registerComponent('Footer', Footer, {styles});

declare global {
  interface ComponentTypes {
    Footer: typeof FooterComponent
  }
}

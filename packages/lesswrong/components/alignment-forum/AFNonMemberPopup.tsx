
import { Components, registerComponent } from '../../lib/vulcan-lib';
import React, { useState } from 'react';
import Card from "@material-ui/core/Card";
import { useTagBySlug } from '../tagging/useTag';
import { commentBodyStyles } from '../../themes/stylePiping';
import { useUpdateCurrentUser } from '../hooks/useUpdateCurrentUser';
import { useMessages } from '../common/withMessages';

const styles = (theme: ThemeType): JssStyles => ({
  dialog: {
    zIndex: theme.zIndexes.tagCTAPopup
  },
  body: {
    ...commentBodyStyles(theme),
  },
  popupCard: {
    padding: "20px",
    display: "flex",
    flexDirection: "column"
  }
});

// Makes its child a link (wrapping it in an <a> tag) which opens a login
// dialog.
const AFNonMemberPopup = ({initialWarning=true, onClose, classes}: {
  initialWarning: boolean,
  onClose: ()=>void,
  classes: ClassesType,
}) => {
  const updateCurrentUser = useUpdateCurrentUser();
  const { flash } = useMessages();
  const [open, setOpen] = useState(true)
  const { ContentItemBody, LWDialog, Button } = Components
  const { tag } = useTagBySlug(initialWarning ? "af-non-member-popup-first" : "af-non-member-popup-submission", "TagFragment")
  
  const handleClose = () => {
    setOpen(false)
    onClose()
  };

  return (
    <LWDialog
      open={open}
      onClose={handleClose}
      className={classes.dialog}
      dialogClasses={{
        paper: classes.paper
      }}
    >
      <Card className={classes.popupCard}>
        <ContentItemBody
          className={classes.body}
          dangerouslySetInnerHTML={{__html: tag?.description?.html || ""}}
          description={`tag ${tag?.name}`}
        />
        <Button className={classes.understandConfirmation} onClick={() => {
          if (initialWarning) { //not sure of best syntax. Ternary within updateCurrentUser didn't seem to work
            void updateCurrentUser({hideAFNonMemberInitialWarning: true}) 
           } else {
            void updateCurrentUser({hideAFNonMemberSubmissionWarning: true})
          }
          flash({messageString: "Alignment Forum posting policy acknowledged"});
          handleClose()
        }}>
          <strong>I understand.</strong>
        </Button>
      </Card>
    </LWDialog>
  );
}

const AFNonMemberPopupComponent = registerComponent('AFNonMemberPopup', AFNonMemberPopup, {styles});

declare global {
  interface ComponentTypes {
    AFNonMemberPopup: typeof AFNonMemberPopupComponent
  }
}

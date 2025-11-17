import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  scrollBox: {
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    flex: 1,
    maxHeight: "100%", // ensures proper growth
    padding: theme.spacing(1),
  },
  tab: {
    textTransform: "none",
    fontWeight: 500,
  },
}));

export default useStyles
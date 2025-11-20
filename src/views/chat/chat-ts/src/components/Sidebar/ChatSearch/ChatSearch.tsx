import { Box, Input } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
// import useStyles from './styles';
import { SearchWrapper } from './styles';

interface Props {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}

const ChatSearch = ({ search, setSearch }: Props) => {
  // const classes = useStyles();

  return (
    // <Box className={classes.search} m={2}>
    <SearchWrapper m={2}>
      <Input fullWidth disableUnderline placeholder="Search chat" onInput={(e) => setSearch(e.target.value)} value={search} />
    </SearchWrapper>
  );
};

export default ChatSearch;

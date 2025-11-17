import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { ConfigContext } from '../../../../contexts/ConfigContext';
import * as actionType from '../../../../store/actions';

import Logo from '../../../../assets/images/MaSLogo.png';

const NavLogo = () => {
  const configContext = useContext(ConfigContext);
  const { collapseMenu } = configContext.state;
  const { dispatch } = configContext;

  let toggleClass = ['mobile-menu'];
  if (collapseMenu) {
    toggleClass = [...toggleClass, 'on'];
  }

  return (
    <React.Fragment>
      <div className="navbar-brand header-logo">
        <Link to="#" className="b-brand">
          <div className="b-bg" >
            <img src={Logo} alt="Movers & Shakers" className="feather icon-trending-up" style={{ width: 'inherit' }} />
          </div>

          <span className="b-title">Movers & Shakers</span>
        </Link>
        <Link
          className={toggleClass.join(' ')}
          id="mobile-collapse"
          onClick={() => dispatch({ type: actionType.COLLAPSE_MENU })}
        >
          <span />
        </Link>
      </div>
    </React.Fragment>
  );
};

export default NavLogo;

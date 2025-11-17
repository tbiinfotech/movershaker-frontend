import React from 'react';
import PropTypes from 'prop-types';

const CustomDialog = ({ show, title, children, onCancel, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h2>{title}</h2>
        <div className="dialog-content">{children}</div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

CustomDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default CustomDialog;

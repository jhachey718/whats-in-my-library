import React from "react";
import { Modal, Button } from "react-bootstrap";

function CustomModal({ show, close, title, bodyContent }) {
  return (
    <Modal show={show} onHide={close} className="custom-modal">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{bodyContent}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomModal;

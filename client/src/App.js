import React, { Fragment, useState, useEffect } from "react";
import Modal from "react-modal";

function App() {
  const [file, setFile] = useState(null);
  const [imageList, setimageList] = useState([]);
  const [listUpdated, setListUpdated] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  useEffect(() => {
    Modal.setAppElement("body");

    fetch("http://localhost:9000/images/get")
      .then((res) => res.json())
      .then((res) => {
        setimageList(res);
      })
      .catch((err) => {
        console.log(err);
      });

    setListUpdated(false);
  }, [listUpdated]);

  const selectedHandler = (e) => {
    setFile(e.target.files[0]);
  };

  const sendHandler = () => {
    if (!file) {
      alert("You must upload file");
      return;
    }

    const formdata = new FormData();
    formdata.append("image", file);

    fetch("http://localhost:9000/images/post", {
      method: "POST",
      body: formdata,
    })
      .then((res) => res.text())
      .then((res) => setListUpdated(true))
      .catch((err) => {
        console.log(err);
      });

    document.getElementById("fileinput").value = null;

    setFile(null);
  };

  const modalHandler = (isOpen, image) => {
    setModalIsOpen(isOpen);
    setCurrentImage(image);
  };

  const deleteHandler = () => {
    fetch("http://localhost:9000/images/delete/" + currentImage.id, {
      method: "DELETE",
    })
      .then((res) => res.text())
      .then((res) => setListUpdated(true))
      .catch((err) => {
        console.log(err);
      });

    setModalIsOpen(false);
  };

  return (
    <Fragment>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <a href="#!" className="navbar-brand">
            Image App
          </a>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="card p-3">
          <div className="row">
            <div className="col-10">
              <input
                id="fileinput"
                onChange={selectedHandler}
                className="form-control"
                type="file"
              />
            </div>
            <div className="col-2">
              <button
                onClick={sendHandler}
                type="button"
                className="btn btn-primary col-12"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="container mt-3"
        style={{ display: "flex", flexWrap: "wrap" }}
      >
        {imageList.map((image) => (
          <div key={image.id} className="card m-2">
            <img
              src={"http://localhost:9000/" + image.name}
              alt=""
              className="card-img-top"
              style={{ height: "200px", width: "300px" }}
            />
            <div className="card-body">
              <button
                onClick={() => modalHandler(true, image)}
                className="btn btn-dark"
              >
                Click to View
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        style={{ content: { right: "20%", left: "20%", bottom: "20%" } }}
        isOpen={modalIsOpen}
        onRequestClose={() => modalHandler(false, null)}
      >
        <div className="card">
          {currentImage && (
            <img
              src={"http://localhost:9000/" + currentImage.name}
              alt="..."
              style={{ height: "600px" }}
            />
          )}
          <div className="card-body">
            <button onClick={() => deleteHandler()} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </Fragment>
  );
}

export default App;

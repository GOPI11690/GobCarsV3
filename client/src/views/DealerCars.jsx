import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import "./DealerCars.css";
import { Table, Thead, Tbody, Tr, Th, Td } from 'react-super-responsive-table'
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css'

import { ConfirmActionsPopup } from "../components/authModel/ConfirmActionsPopup";
import { DeleteCar, GetDealerCars } from "../utils/ApiCalls";
import Spinner from "../components/loading/Spinner";

function DealerCars() {
  const user = useSelector((state) => state.user.user);
  const [cars, setCars] = useState([]);
  const [carToDelete, setCarToDelete] = useState(null);
  const [isPopupDeleteVisible, setIsPopupDeleteVisible] = useState(false);
    const [messageSuccess, setMessageSuccess] = useState("");
    const [messageFailed, setMessageFailed] = useState("");
    const [isLoading, setIsLoading] = useState(true);

  const DATE_OPTIONS = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  

  const isUserAuthenticated = useSelector(
    (state) => state.user.isUserAuthenticated
  );

 
  useEffect(() => {
    if (!isUserAuthenticated) {
      return <Navigate to="/" />;
    }
    else{
    getDealerCar();
    }
  }, [isUserAuthenticated]);
  async function getDealerCar() {
    const response = await GetDealerCars(user._id);
    
    if(response.data.Cars.cars.length<1){
        setMessageFailed(response.data.message);
          setTimeout(() => setMessageFailed(""), 3000);
    }
    
    setCars(response.data.Cars.cars);
    setIsLoading(false);
    setMessageSuccess("Your Cars fetched sucessfully");
          setTimeout(() => setMessageSuccess(""), 3000);

  }
  const deleteMessage = carToDelete && (
    <p>
      Do you want to permanently delete car?
      <br />
      <span>
        (id: <strong>{carToDelete._id}</strong>)
      </span>
    </p>
  );
  const handleDelete = async (car) => {
    setCarToDelete(car);
    setIsPopupDeleteVisible(true);
  };
  const handleConfirmDelete = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await DeleteCar(carToDelete._id);
      setCars((prevCars) =>
        prevCars.filter((car) => car._id !== carToDelete._id)
      );
      setIsPopupDeleteVisible(false);
      setMessageSuccess("Your Car deleted sucessfully");
                        setTimeout(() => setMessageSuccess(""), 3000);
    } catch (error) {
      setMessageFailed("Something Wrong");
      setTimeout(()=>setMessageFailed(""),3000);
      throw new Error("Error deleting car: " + error.message);
    }
  };
  const handleButtonCancel = () => {
    setIsPopupDeleteVisible(false);
  };
  return (
    <div className="shadow-lg rounded-2xl w-full dark:text-white p-5">
      <div>
        <h1>Your Cars</h1>
      </div>
      {isLoading?<Spinner/>:
      <div className="wrapper">
        <Table className="table-auto border-collapse border border-gray-400 userTable">
          <Thead>
            <Tr>
              <Th>Sl.No</Th>
              <Th>Created At</Th>
              <Th>Car ID</Th>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th className="deleteCell">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {cars.length==0?<Tr><Td colspan={6}>You don't have any Cars</Td></Tr>:cars.map((car, index) => (
              <Tr key={car._id}>
                <Td>{index + 1}</Td>
                <Td>
                  {new Date(car.createdAt).toLocaleString(
                    "en-US",
                    DATE_OPTIONS
                  )}
                </Td>
                <Td>{car._id}</Td>
                <Td>{car.brand +" "+car.name}</Td>
                <Td>{car.status}</Td>
                <Td className="deleteData">
                  <button
                    className="deleteButton"
                    onClick={() => handleDelete(car)}
                  >
                    Delete
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {isPopupDeleteVisible && carToDelete && (
          <ConfirmActionsPopup
          btnName={"Delete"}
            message={deleteMessage}
            onConfirm={handleConfirmDelete}
            onCancel={() => handleButtonCancel("delete")}
          />
        )}
        {messageSuccess && (
            <span className="text-green-500">{messageSuccess}</span>
          )}
          {messageFailed && (
            <span className="text-red-500">{messageFailed}</span>
          )}
      </div>}
    </div>
  );
}

export default DealerCars;

import { useState, useEffect } from 'react';  // Importing useState for managing state in the component
import TableRow from '../components/TableRow';
import CreatePersonForm from '../components/CreatePersonForm';
import UpdatePersonForm from '../components/UpdatePersonForm';


function BSGPeople({ backendURL }) {

    // Set up a state variable `people` to store and display the backend response
    const [people, setPeople] = useState([]);
    const [homeworlds, setHomeworlds] = useState([]);


    const getData = async function () {
        try {
            // Make a GET request to the backend
            const response = await fetch(backendURL + '/bsg-people');

            // Convert the response into JSON format
            const {people, homeworlds} = await response.json();

            // Update the people state with the response data
            setPeople(people);
            setHomeworlds(homeworlds);

        } catch (error) {
            // If the API call fails, print the error to the console
            console.log(error);
        }

    };

    // Load table on page load
    useEffect(() => {
        getData();
    }, []);

    return (
        <>
            <h1>BSG People</h1>

            <table>
                <thead>
                <tr>
                    {people.length > 0 && Object.keys(people[0]).map((header, index) => (
                        <th key={index}>{header}</th>
                    ))}
                    <th></th>
                </tr>
                </thead>

                <tbody>
                {people.map((person, index) => (
                    <TableRow key={index} rowObject={person} backendURL={backendURL} refreshPeople={getData}/>
                ))}

                </tbody>
            </table>

            <CreatePersonForm homeworlds={homeworlds} backendURL={backendURL} refreshPeople={getData} />
            <UpdatePersonForm people={people} homeworlds={homeworlds} backendURL={backendURL} refreshPeople={getData} />
        </>
    );

} export default BSGPeople;
const UpdatePersonForm = ({ people, homeworlds, backendURL, refreshPeople }) => {

    return (
        <>
            <h2>Update a Person</h2>
            <form className='cuForm'>
                <label htmlFor="update_person_id">Person to Update: </label>
                <select
                    name="update_person_id"
                    id="update_person_id"
                >
                    <option value="">Select a Person</option>
                    {people.map((person) => (
                        <option key={person.id} value={person.id}>
                            {person.id} - {person.fname} {person.lname}
                        </option>
                    ))}
                </select>

                <label htmlFor="update_person_homeworld">Homeworld: </label>
                <select
                    name="update_person_homeworld"
                    id="update_person_homeworld"
                >
                    <option value="">Select a Planet</option>
                    <option value="NULL">&lt; None &gt;</option>
                    {homeworlds.map((homeworld) => (
                        <option key={homeworld.id} value={homeworld.id}>
                            {homeworld.name}
                        </option>
                    ))}
                </select>

                <label htmlFor="update_person_age">Age: </label>
                <input
                    type="number"
                    name="update_person_age"
                    id="update_person_age"
                />

                <input type="submit" />
            </form>
        </>
    );
};

export default UpdatePersonForm;
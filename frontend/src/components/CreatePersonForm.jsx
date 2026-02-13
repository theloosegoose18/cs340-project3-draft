const CreatePersonForm = ({ homeworlds, backendURL, refreshPeople }) => {

    return (
        <>
            <h2>Create a Person</h2>

            <form className='cuForm'>
                <label htmlFor="create_person_fname">First Name: </label>
                <input
                    type="text"
                    name="create_person_fname"
                    id="create_person_fname"
                />

                <label htmlFor="create_person_lname">Last Name: </label>
                <input
                    type="text"
                    name="create_person_lname"
                    id="create_person_lname"
                />

                <label htmlFor="create_person_homeworld">Homeworld: </label>
                <select
                    name="create_person_homeworld"
                    id="create_person_homeworld"
                >
                    <option value="">Select a Planet</option>
                    <option value="NULL">&lt; None &gt;</option>
                    {homeworlds.map((homeworld, index) => (
                        <option value={homeworld.id} key={index}>{homeworld.name}</option>
                    ))}
                </select>

                <label htmlFor="create_person_age">Age: </label>
                <input
                    type="number"
                    name="create_person_age"
                    id="create_person_age"
                />

                <input type="submit" />
            </form>
        </>
    );
};

export default CreatePersonForm;
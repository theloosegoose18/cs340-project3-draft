import DeletePersonForm from './DeletePersonForm';

const TableRow = ({ rowObject, backendURL, refreshPeople }) => {
    return (
        <tr>
            {Object.values(rowObject).map((value, index) => (
                <td key={index}>{value}</td>
            ))}

            <DeletePersonForm rowObject={rowObject} backendURL={backendURL} refreshPeople={refreshPeople} />
        </tr>
    );
};

export default TableRow;
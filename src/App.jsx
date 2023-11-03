import { useMemo, useState, memo, useCallback } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// https://github.com/dexie/Dexie.js/discussions/1661
import { useLiveQuery, useObservable } from "dexie-react-hooks";
import { from, filter, distinctUntilChanged } from 'rxjs';
import { db } from "./db";

export function AddFriendForm({defaultAge} = {defaultAge: 21}) {
    const [name, setName] = useState("");
    const [age, setAge] = useState(defaultAge);
    const [status, setStatus] = useState("");

    async function addFriend() {
        try {

            // Add the new friend!
            const id = await db.friends.add({
                name,
                age
            });

            setStatus(`Friend ${name} successfully added. Got id ${id}`);
            setName("");
            setAge(defaultAge);
        } catch (error) {
            setStatus(`Failed to add ${name}: ${error}`);
        }
    }

    return <>
               <p>
                   {status}
               </p>
               Name:
               <input
                   type="text"
                   value={name}
                   onChange={ev => setName(ev.target.value)}
               />
               Age:
               <input
                   type="number"
                   value={age}
                   onChange={ev => setAge(Number(ev.target.value))}
               />
               
               <button onClick={addFriend}>
                   Add
               </button>
           </>
}

export const Friend = memo(({id}) => {
    const friend = useLiveQuery(async () =>
        await db.friends.get(id)
    );
    const deleteFriend = useCallback(() => db.friends.delete(id), [id]);
    const changeName = useCallback((e) => db.friends.update(id, {name: e.target.value}), [id]);
    console.log(id, friend);
    return <>Name: {friend?.name}, Age: {friend?.age} <input value={friend?.name} onChange={changeName} /> <button onClick={deleteFriend}>Delete</button>
           </>
})

export function FriendList() {
    const friendIds = useLiveQuery(
        async () => {
            // Also re-renders:
            // return await db.friends.toCollection().primaryKeys()
            return await db.friends.orderBy('id').primaryKeys()
        }
    );
    return <ul>
               {friendIds?.map(id => <li key={id}><Friend id={id}/></li>)}
           </ul>;
}


function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <h1>My friends</h1>
            <p>New friends:</p><AddFriendForm/>
            <FriendList/>
        </>
    )
}

export default App

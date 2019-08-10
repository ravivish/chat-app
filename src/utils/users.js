const users = []

// Adduser removeuser getuser getUserInRooms

const addUser = ({ id, username, room}) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    // Validate the data
    if(!username || !room){
        return {
            error:'username and room are required!'
        }
    }

    // check for existing user
    const existinguser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    // validate username
    if(existinguser){
        return {
            error:'Username is in use'
        }
    }

    // Store the user

    const user = {id, username, room};
    users.push(user);
    return { user }

}

const removeUser = (id)=>{
    // const index = users.findIndex( (user) => {
    //     return user.id === id
    // })
    const index = users.findIndex( (user) =>  user.id === id );
    if(index !== -1){
        return users.splice(index,1)[0];
    }
}   

const getUser = (id) => {
    return users.find((user) => user.id === id );
}

const getUserInRoom = (room) => {
    return users.filter((user)=> user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}

// addUser( {
//     id:22,
//     username:' Ravi   ',
//     room:' ambedkar  '
// })
// addUser( {
//     id:22,
//     username:' Max   ',
//     room:' ambedkar  '
// })
// // const user = getUser(22);
// // console.log(user); 

// const userInRoom = getuserInRoom('ambedkar');
// console.log(userInRoom);


// console.log(users);

// const res = addUser({
//     id:33,
//     username:'ravi',
//     room:''
// })

// console.log(res);


// addUser( {
//     id:23,
//     username:'Mr.Ravi',
//     room:'Ambedkar  '
// })

// const removedUser = removeUser(22);
// console.log(removedUser);
// console.log(users);


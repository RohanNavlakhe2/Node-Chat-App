const users = []

const addUser = ({id,username,room}) => {
    username = username.trim()
    room = room.trim()

    if(!username || !room){
        return {error:'username and room are required'}
    }

    username = username.toLowerCase()
    room = room.toLowerCase()

    const existingUserInRoom = users.find(user => user.username === username && user.room === room)

    if(existingUserInRoom)
        return {error:  'user has joined the room already'}

     const user = {id,username,room}
     users.push(user)
     return {user}
}

const removeUser = (id) => {
    const userIndexToRemove = users.findIndex(user => user.id === id)
    if(userIndexToRemove!==-1){
        //splice removes the n elements from the given index and return the deleted elements array
        return users.splice(userIndexToRemove,1)[0]
    }
}

const getUser = (id) => users.find(user => user.id === id)
const getUsersInRoom = (room) => users.filter(user => user.room === room.trim().toLowerCase())

module.exports = {
    addUser,removeUser,getUser,getUsersInRoom
}



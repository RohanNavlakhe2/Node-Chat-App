const generateMessage = (text,senderName) => {
     return {
         text,
         senderName,
         createdAt:new Date().getTime()
     }
}

const generateLocationMessage = (url,senderName) => {
    return {
        url,
        senderName,
        createdAt:new Date().getTime()
    }
}



module.exports = {generateMessage,generateLocationMessage}
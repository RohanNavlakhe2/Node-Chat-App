//Init socket connection to server
const socket = io()

//Its a convention to put $ as prefix for dom elements (here message-area is a div)
const $messageArea = document.querySelector('#message-area')

//This will provide us the template that we defined inside script tag in index.html
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = () => {
    // New message element
    const $newMessage = $messageArea.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messageArea.offsetHeight

    // Height of messages container
    const containerHeight = $messageArea.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messageArea.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messageArea.scrollTop = $messageArea.scrollHeight
    }
}

//listen to the 'message' event emitted by server in index.js
socket.on('message',(message) => {
    console.log(message)
    const messageTime = moment(message.createdAt).format('hh:mm a')
    const html = Mustache.render(messageTemplate,{message:message.text,createdAt:messageTime,senderName:message.senderName})
    $messageArea.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('location-message',(location) => {
    const locationShareTime = moment(location.createdAt).format("hh:mm a")
    const html = Mustache.render(locationTemplate,{location:location.url,createdAt: locationShareTime,senderName:location.senderName})
    $messageArea.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{room,users})
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join',{username,room},(error) => {
    if(error){
        alert(error)
        location.href = '/'
    }

})

const form = document.querySelector('form')

form.addEventListener('submit',(e) => {
    e.preventDefault()
    //accessing message input field with its name
    //e.target means form (on which we're listening the event)
    const messageField = e.target.elements.message
    socket.emit('sendMessage',messageField.value,(acknowledgementFromServer) => {
        console.log(acknowledgementFromServer)
        messageField.value = ''
        messageField.focus()
    })

})

document.querySelector('#send-location-btn').addEventListener('click',() => {
    if(!navigator.geolocation)
        return alert('location cannot be shared')
    navigator.geolocation.getCurrentPosition((location) => {

        socket.emit('sendLocation',{lat:location.coords.latitude,lng:location.coords.longitude},(acknowledgementFromServer) => {
            console.log(acknowledgementFromServer)
        })
    })
})